"use client";

/**
 * Sons del joc, amb Web Audio i sense cap dependència.
 *
 * Cada so té un fitxer opcional a `public/audio/`. Si el fitxer hi és, sona el
 * fitxer; si no hi és (o no es pot descodificar), sona la versió sintetitzada:
 *
 *   public/audio/so-arribada.mp3  arribar a una fita (hub, per GPS). Curt, ~1 s.
 *   public/audio/so-fragment.mp3  resposta correcta, "obrint el fragment". Curt, ~2 s:
 *                                 la celebració dura 3 s.
 *   public/audio/so-temps.mp3     s'ha acabat el temps: campana greu / gong.
 *   public/audio/guardians.mp3    música de la pantalla final. Sona en bucle, així
 *                                 que cal que el final enllaci net amb el principi.
 *   public/audio/musica-entrada.mp3   música de l'entrada (benvinguda, ubicació, equips,
 *                                     espera). En bucle.
 *
 * Els altres fitxers de public/audio/ són les veus de Fra Francesc (content/public/textos.ts,
 * generades amb scripts/generate-audio.py) i sonen amb `sonarVeu`. Les pantalles amb veu no
 * porten música.
 *
 * Els navegadors mòbils no deixen sonar res fins que l'usuari ha tocat la
 * pàgina. En carregar aquest mòdul s'escolta el primer toc de qualsevol
 * pantalla per desbloquejar l'àudio (`desbloquejarSo`). Els efectes curts
 * només sonen si l'àudio ja està desbloquejat: si no, fallen en silenci (un
 * so que arribés tard, al toc següent, confondria). La música sí que queda
 * en espera i comença al primer toc. Amb el mòbil bloquejat el navegador
 * congela la pàgina i no sona res.
 */

export type NomMusica = "guardians" | "musica-entrada";
export type NomSo = "so-arribada" | "so-fragment" | "so-temps" | NomMusica;

type Sintesi = (ctx: AudioContext, desti: AudioNode, t: number) => void;

let context: AudioContext | null = null;
let bus: AudioNode | null = null;
let desbloquejat = false;

function obtenirContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      context = new Ctor();
    } catch {
      return null;
    }
  }
  return context;
}

/** Sortida comuna dels sons sintetitzats: un compressor (res no satura) i una mica de reverb de capella. */
function sortida(ctx: AudioContext): AudioNode {
  if (bus) return bus;
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -14;
  compressor.ratio.value = 4;
  compressor.connect(ctx.destination);

  const sec = ctx.createGain();
  sec.gain.value = 0.9;
  sec.connect(compressor);

  const reverb = ctx.createConvolver();
  reverb.buffer = respostaImpuls(ctx, 2.6);
  const humit = ctx.createGain();
  humit.gain.value = 0.3;
  sec.connect(reverb).connect(humit).connect(compressor);

  bus = sec;
  return bus;
}

/** Soroll que s'apaga: fa de sala amb eco sense cap fitxer. */
function respostaImpuls(ctx: AudioContext, segons: number): AudioBuffer {
  const mida = Math.floor(ctx.sampleRate * segons);
  const buffer = ctx.createBuffer(2, mida, ctx.sampleRate);
  for (let canal = 0; canal < 2; canal++) {
    const dades = buffer.getChannelData(canal);
    for (let i = 0; i < mida; i++) dades[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / mida, 3);
  }
  return buffer;
}

/** S'ha de cridar des d'un gest de l'usuari (ja ho fa sol el listener global de sota). */
export function desbloquejarSo() {
  const ctx = obtenirContext();
  if (!ctx) return;
  if (ctx.state !== "running") ctx.resume().catch(() => {});
  if (!desbloquejat) {
    // iOS: un so buit dins el gest acaba de desbloquejar la sortida.
    desbloquejat = true;
    try {
      const font = ctx.createBufferSource();
      font.buffer = ctx.createBuffer(1, 1, 22050);
      font.connect(ctx.destination);
      font.start();
    } catch {
      // Sense so: no passa res.
    }
  }
}

if (typeof window !== "undefined") {
  for (const esdeveniment of ["pointerdown", "touchend", "keydown"]) {
    window.addEventListener(esdeveniment, desbloquejarSo, { capture: true, passive: true });
  }
}

/** L'àudio ja pot sonar (hi ha hagut un toc i el navegador l'ha deixat engegar). */
export function soActiu(): boolean {
  return context?.state === "running";
}

/** Avisa quan l'àudio es desbloqueja o es suspèn. Retorna la funció per deixar d'escoltar. */
export function escoltarEstatSo(avis: () => void): () => void {
  const ctx = obtenirContext();
  if (!ctx) return () => {};
  ctx.addEventListener("statechange", avis);
  return () => ctx.removeEventListener("statechange", avis);
}

// ---------------------------------------------------------------------------
// Fitxers opcionals

const descarregues = new Map<NomSo, Promise<ArrayBuffer | null>>();
const buffers = new Map<NomSo, Promise<AudioBuffer | null>>();

function descarregar(nom: NomSo): Promise<ArrayBuffer | null> {
  let promesa = descarregues.get(nom);
  if (!promesa) {
    promesa = fetch(`/audio/${nom}.mp3`)
      .then((res) => {
        // Un 404 de Next torna HTML: només val si és àudio de debò.
        if (!res.ok || !(res.headers.get("content-type") ?? "").startsWith("audio")) return null;
        return res.arrayBuffer();
      })
      .catch(() => null);
    descarregues.set(nom, promesa);
  }
  return promesa;
}

function obtenirBuffer(ctx: AudioContext, nom: NomSo): Promise<AudioBuffer | null> {
  let promesa = buffers.get(nom);
  if (!promesa) {
    promesa = descarregar(nom)
      .then((dades) => (dades ? ctx.decodeAudioData(dades) : null))
      .catch(() => null);
    buffers.set(nom, promesa);
  }
  return promesa;
}

/** Comença a descarregar un fitxer abans de necessitar-lo (no crea cap context d'àudio). */
export function precarregarSo(nom: NomSo) {
  if (typeof window !== "undefined") void descarregar(nom);
}

function esperar(ms: number) {
  return new Promise<null>((resol) => setTimeout(() => resol(null), ms));
}

function vibrar(patro: number[]) {
  try {
    navigator.vibrate?.(patro);
  } catch {
    // Alguns navegadors llancen si no hi ha hagut cap gest.
  }
}

/**
 * Efecte curt: el fitxer si hi és (esperant-lo poc), si no el sintetitzat.
 * `encara` deixa sonar el so encara que l'àudio no estigui desbloquejat:
 * sonarà quan ho estigui (comportament antic del so d'arribada).
 */
async function sonarEfecte(nom: NomSo, sintesi: Sintesi, { encara = false } = {}) {
  const ctx = obtenirContext();
  if (!ctx) return;
  if (ctx.state !== "running") {
    if (!encara) return;
    ctx.resume().catch(() => {});
  }
  const buffer = await Promise.race([obtenirBuffer(ctx, nom), esperar(400)]);
  try {
    if (buffer) {
      const font = ctx.createBufferSource();
      font.buffer = buffer;
      font.connect(ctx.destination);
      font.start();
    } else {
      sintesi(ctx, sortida(ctx), ctx.currentTime + 0.03);
    }
  } catch {
    // Si no pot sonar, en silenci.
  }
}

// ---------------------------------------------------------------------------
// Peces de síntesi

/** Campana: parcials inharmònics que s'apaguen, els aguts abans. */
function campana(
  ctx: AudioContext,
  desti: AudioNode,
  t: number,
  freq: number,
  durada: number,
  volum: number,
  parcials: [number, number][] = [
    [1, 1],
    [2.76, 0.5],
    [5.4, 0.25],
    [8.93, 0.12],
  ]
) {
  for (const [ratio, amplitud] of parcials) {
    const osc = ctx.createOscillator();
    const guany = ctx.createGain();
    const final = t + durada / Math.sqrt(ratio);
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    guany.gain.setValueAtTime(0.0001, t);
    guany.gain.exponentialRampToValueAtTime(volum * amplitud, t + 0.006);
    guany.gain.exponentialRampToValueAtTime(0.0001, final);
    osc.connect(guany).connect(desti);
    osc.start(t);
    osc.stop(final + 0.05);
  }
}

/** Esclat de soroll filtrat: cop, buf o fregament. */
function soroll(
  ctx: AudioContext,
  desti: AudioNode,
  t: number,
  durada: number,
  volum: number,
  filtre: { tipus: BiquadFilterType; de: number; a: number }
) {
  const mida = Math.floor(ctx.sampleRate * durada);
  const buffer = ctx.createBuffer(1, mida, ctx.sampleRate);
  const dades = buffer.getChannelData(0);
  for (let i = 0; i < mida; i++) dades[i] = Math.random() * 2 - 1;
  const font = ctx.createBufferSource();
  font.buffer = buffer;
  const bq = ctx.createBiquadFilter();
  bq.type = filtre.tipus;
  bq.frequency.setValueAtTime(filtre.de, t);
  bq.frequency.exponentialRampToValueAtTime(filtre.a, t + durada);
  const guany = ctx.createGain();
  guany.gain.setValueAtTime(0.0001, t);
  guany.gain.exponentialRampToValueAtTime(volum, t + durada * 0.3);
  guany.gain.exponentialRampToValueAtTime(0.0001, t + durada);
  font.connect(bq).connect(guany).connect(desti);
  font.start(t);
  font.stop(t + durada + 0.05);
}

const sintesiArribada: Sintesi = (ctx, desti, t) => {
  // Tres notes ascendents, com una campaneta.
  [659.25, 783.99, 1046.5].forEach((freq, i) => campana(ctx, desti, t + i * 0.18, freq, 1.2, 0.35));
};

const sintesiFragment: Sintesi = (ctx, desti, t) => {
  // Buf màgic que puja...
  soroll(ctx, desti, t, 0.7, 0.12, { tipus: "bandpass", de: 300, a: 5000 });
  // ...cascada d'espurnes (arpegi de do major molt agut)...
  [1046.5, 1318.51, 1567.98, 2093, 2637.02, 3135.96, 4186].forEach((freq, i) =>
    campana(ctx, desti, t + 0.05 + i * 0.065, freq, 0.9, 0.09)
  );
  // ...i l'acord de campanes quan s'obre el fragment, amb un fons greu.
  const obertura = t + 0.5;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => campana(ctx, desti, obertura + i * 0.02, freq, 3, 0.16));
  for (const freq of [130.81, 196]) {
    const osc = ctx.createOscillator();
    const guany = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    guany.gain.setValueAtTime(0.0001, t);
    guany.gain.exponentialRampToValueAtTime(0.14, obertura);
    guany.gain.exponentialRampToValueAtTime(0.0001, obertura + 2.4);
    osc.connect(guany).connect(desti);
    osc.start(t);
    osc.stop(obertura + 2.5);
  }
};

const sintesiTemps: Sintesi = (ctx, desti, t) => {
  // Tres tocs d'una campana greu, com un gong de capella.
  const parcials: [number, number][] = [
    [0.5, 0.45],
    [1, 1],
    [2, 0.55],
    [2.76, 0.4],
    [3.01, 0.3],
    [4.07, 0.22],
    [5.4, 0.12],
  ];
  for (let i = 0; i < 3; i++) {
    const toc = t + i * 2.6;
    soroll(ctx, desti, toc, 0.12, 0.25, { tipus: "lowpass", de: 1800, a: 200 });
    campana(ctx, desti, toc, 98, 6, 0.32, parcials);
  }
};

// Música de la pantalla final (re menor: i - VI - III - VII), per si no hi ha guardians.mp3.
const D2 = 73.42;
const ACORDS: { baix: number; notes: number[] }[] = [
  { baix: D2, notes: [146.83, 174.61, 220, 293.66] }, // Re m
  { baix: 58.27, notes: [116.54, 146.83, 174.61, 233.08] }, // Si♭
  { baix: 87.31, notes: [174.61, 220, 261.63, 349.23] }, // Fa
  { baix: 65.41, notes: [130.81, 164.81, 196, 261.63] }, // Do
];
const FANFARES: Record<number, [number, number, number][]> = {
  // [freq, inici, durada] en segons dins l'acord
  0: [
    [293.66, 0, 0.3],
    [440, 0.35, 0.3],
    [587.33, 0.7, 2],
  ],
  2: [
    [523.25, 0, 0.3],
    [698.46, 0.35, 0.3],
    [880, 0.7, 2],
  ],
};
const DURADA_ACORD = 4;

function serra(ctx: AudioContext, desti: AudioNode, freq: number, t: number, fi: number) {
  for (const desafinament of [-7, 7]) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.detune.value = desafinament;
    osc.connect(desti);
    osc.start(t);
    osc.stop(fi);
  }
}

function acord(ctx: AudioContext, desti: AudioNode, t: number, notes: number[]) {
  const fi = t + DURADA_ACORD + 0.6;
  const filtre = ctx.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.value = 900;
  const guany = ctx.createGain();
  guany.gain.setValueAtTime(0.0001, t);
  guany.gain.exponentialRampToValueAtTime(0.05, t + 0.8);
  guany.gain.setValueAtTime(0.05, t + DURADA_ACORD - 0.2);
  guany.gain.exponentialRampToValueAtTime(0.0001, fi);
  filtre.connect(guany).connect(desti);
  for (const freq of notes) serra(ctx, filtre, freq, t, fi);
}

function timbal(ctx: AudioContext, desti: AudioNode, t: number, freq: number, volum: number) {
  const osc = ctx.createOscillator();
  const guany = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq * 1.25, t);
  osc.frequency.exponentialRampToValueAtTime(freq, t + 0.25);
  guany.gain.setValueAtTime(0.0001, t);
  guany.gain.exponentialRampToValueAtTime(volum, t + 0.01);
  guany.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
  osc.connect(guany).connect(desti);
  osc.start(t);
  osc.stop(t + 1.5);
  soroll(ctx, desti, t, 0.08, volum * 0.4, { tipus: "lowpass", de: 900, a: 150 });
}

function metall(ctx: AudioContext, desti: AudioNode, t: number, freq: number, durada: number) {
  const fi = t + durada + 0.25;
  const filtre = ctx.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.setValueAtTime(400, t);
  filtre.frequency.exponentialRampToValueAtTime(2600, t + 0.08);
  filtre.frequency.exponentialRampToValueAtTime(1400, t + 0.4);
  const guany = ctx.createGain();
  guany.gain.setValueAtTime(0.0001, t);
  guany.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
  guany.gain.setValueAtTime(0.09, t + durada);
  guany.gain.exponentialRampToValueAtTime(0.0001, fi);
  filtre.connect(guany).connect(desti);
  serra(ctx, filtre, freq, t, fi);
}

/** Programa la música a trossos, uns segons per endavant. Retorna la funció d'aturar-la. */
function sintesiGuardians(ctx: AudioContext, desti: AudioNode, t0: number): () => void {
  const pedal = ctx.createBiquadFilter();
  pedal.type = "lowpass";
  pedal.frequency.value = 320;
  const guanyPedal = ctx.createGain();
  guanyPedal.gain.setValueAtTime(0.0001, t0);
  guanyPedal.gain.exponentialRampToValueAtTime(0.06, t0 + 3);
  pedal.connect(guanyPedal).connect(desti);
  const oscPedal = [D2, D2 * 1.5].map((freq) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.connect(pedal);
    osc.start(t0);
    return osc;
  });

  let seguent = t0 + 0.1;
  let index = 0;
  const programar = () => {
    // Amb l'àudio suspès el rellotge no avança: no s'acumula res.
    while (seguent < ctx.currentTime + 6) {
      const pas = index % ACORDS.length;
      const { baix, notes } = ACORDS[pas];
      acord(ctx, desti, seguent, notes);
      timbal(ctx, desti, seguent, baix, 0.5);
      timbal(ctx, desti, seguent + 0.22, baix, 0.25);
      for (const [freq, inici, durada] of FANFARES[pas] ?? []) metall(ctx, desti, seguent + inici, freq, durada);
      seguent += DURADA_ACORD;
      index++;
    }
  };
  programar();
  const interval = setInterval(programar, 1000);

  return () => {
    clearInterval(interval);
    for (const osc of oscPedal) {
      try {
        osc.stop(ctx.currentTime + 1.5);
      } catch {
        // Ja aturat.
      }
    }
  };
}

/** Pad suau d'oscil·ladors triangulars: l'acord respira sense atac. */
function pad(ctx: AudioContext, desti: AudioNode, t: number, notes: number[], durada: number, volum: number) {
  const fi = t + durada + 1.5;
  const filtre = ctx.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.value = 1100;
  const guany = ctx.createGain();
  guany.gain.setValueAtTime(0.0001, t);
  guany.gain.exponentialRampToValueAtTime(volum, t + 2.5);
  guany.gain.setValueAtTime(volum, t + durada - 0.5);
  guany.gain.exponentialRampToValueAtTime(0.0001, fi);
  filtre.connect(guany).connect(desti);
  for (const freq of notes) {
    for (const desafinament of [-5, 5]) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.detune.value = desafinament;
      osc.connect(filtre);
      osc.start(t);
      osc.stop(fi);
    }
  }
}

/** Dron continu amb un filtre que respira. Retorna la funció d'aturar-lo. */
function dron(ctx: AudioContext, desti: AudioNode, t0: number, freqs: number[], volum: number, tall: number) {
  const filtre = ctx.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.value = tall;
  filtre.Q.value = 3;
  const lfo = ctx.createOscillator();
  const lfoGuany = ctx.createGain();
  lfo.frequency.value = 0.07;
  lfoGuany.gain.value = tall * 0.45;
  lfo.connect(lfoGuany).connect(filtre.frequency);
  const guany = ctx.createGain();
  guany.gain.setValueAtTime(0.0001, t0);
  guany.gain.exponentialRampToValueAtTime(volum, t0 + 4);
  filtre.connect(guany).connect(desti);
  const oscs = freqs.map((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.detune.value = i % 2 ? 6 : -6;
    osc.connect(filtre);
    osc.start(t0);
    return osc;
  });
  lfo.start(t0);
  return () => {
    for (const osc of [...oscs, lfo]) {
      try {
        osc.stop(ctx.currentTime + 1.5);
      } catch {
        // Ja aturat.
      }
    }
  };
}

/** Programa una música a trossos de `durada` segons, uns segons per endavant. Retorna la funció d'aturar-la. */
function programarBucle(ctx: AudioContext, t0: number, durada: number, pas: (t: number, index: number) => void) {
  let seguent = t0;
  let index = 0;
  const programar = () => {
    // Amb l'àudio suspès el rellotge no avança: no s'acumula res.
    while (seguent < ctx.currentTime + 6) {
      pas(seguent, index);
      seguent += durada;
      index++;
    }
  };
  programar();
  const interval = setInterval(programar, 1000);
  return () => clearInterval(interval);
}

// Música de l'entrada (la menor: i - VI - iv - V), misteriosa, per si no hi ha musica-entrada.mp3.
const ACORDS_ENTRADA = [
  [220, 261.63, 329.63], // La m
  [174.61, 220, 261.63], // Fa
  [146.83, 174.61, 220], // Re m
  [164.81, 207.65, 246.94], // Mi
];
const CAMPANETES_ENTRADA = [440, 523.25, 587.33, 659.25, 783.99, 880];
const DURADA_ENTRADA = 8;

function sintesiEntrada(ctx: AudioContext, desti: AudioNode, t0: number): () => void {
  const aturarDron = dron(ctx, desti, t0, [55, 82.41, 110], 0.05, 280);
  const aturarBucle = programarBucle(ctx, t0 + 0.5, DURADA_ENTRADA, (t, index) => {
    pad(ctx, desti, t, ACORDS_ENTRADA[index % ACORDS_ENTRADA.length], DURADA_ENTRADA, 0.03);
    // Tres campanetes esparses, com gotes en una cova.
    for (const retard of [1.5, 4.2, 6.4]) {
      const freq = CAMPANETES_ENTRADA[Math.floor(Math.random() * CAMPANETES_ENTRADA.length)];
      campana(ctx, desti, t + retard + Math.random() * 0.6, freq, 2.5, 0.05);
    }
  });
  return () => {
    aturarBucle();
    aturarDron();
  };
}

const SINTESI_MUSICA: Record<NomMusica, (ctx: AudioContext, desti: AudioNode, t0: number) => () => void> = {
  guardians: sintesiGuardians,
  "musica-entrada": sintesiEntrada,
};

// ---------------------------------------------------------------------------
// API

/** Arribada a una fita: tres notes i una vibració (on n'hi ha: Android). */
export function sonarArribada() {
  vibrar([200, 100, 200, 100, 400]);
  void sonarEfecte("so-arribada", sintesiArribada, { encara: true });
}

/** Resposta correcta: s'obre el fragment. */
export function sonarFragment() {
  vibrar([80, 60, 80, 60, 300]);
  void sonarEfecte("so-fragment", sintesiFragment);
}

/** S'ha acabat el temps: campana greu. */
export function sonarTemps() {
  vibrar([600, 300, 600, 300, 600]);
  void sonarEfecte("so-temps", sintesiTemps);
}

const DURADA_MUSICA = 15;
const FOS_FINAL = 4;

/**
 * Engega la música (el fitxer si hi és; si no, la sintetitzada) amb una entrada suau.
 * Dura com a màxim DURADA_MUSICA segons i s'apaga amb un fos; llavors avisa `enAcabar`.
 * Si l'àudio encara no està desbloquejat, començarà al primer toc (el rellotge de
 * l'àudio no corre fins llavors, així que els 15 s són sempre de música sonant).
 * Retorna la funció per aturar-la abans (amb una sortida suau, sense avisar `enAcabar`).
 */
export function iniciarMusica(nom: NomMusica = "guardians", enAcabar?: () => void): () => void {
  const ctx = obtenirContext();
  if (!ctx) return () => {};
  if (ctx.state !== "running") ctx.resume().catch(() => {});

  const volum = ctx.createGain();
  const t0 = ctx.currentTime;
  const fi = t0 + DURADA_MUSICA;
  volum.gain.setValueAtTime(0.0001, t0);
  volum.gain.exponentialRampToValueAtTime(1, t0 + 2);
  volum.gain.setValueAtTime(1, fi - FOS_FINAL);
  volum.gain.exponentialRampToValueAtTime(0.0001, fi);

  let aturada = false;
  let aturarFont: (() => void) | null = null;

  // Rellotge silenciós en temps d'àudio: marca el final encara que el context hagi estat suspès.
  const rellotge = ctx.createConstantSource();
  const mut = ctx.createGain();
  mut.gain.value = 0;
  rellotge.connect(mut).connect(ctx.destination);
  rellotge.onended = () => {
    mut.disconnect();
    if (aturada) return;
    aturada = true;
    try {
      aturarFont?.();
    } catch {
      // Ja aturat.
    }
    setTimeout(() => volum.disconnect(), 1600);
    enAcabar?.();
  };
  rellotge.start(t0);
  rellotge.stop(fi);

  void Promise.race([obtenirBuffer(ctx, nom), esperar(1500)]).then((buffer) => {
    if (aturada) return;
    try {
      if (buffer) {
        volum.connect(ctx.destination);
        const font = ctx.createBufferSource();
        font.buffer = buffer;
        font.loop = true;
        font.connect(volum);
        font.start();
        aturarFont = () => font.stop(ctx.currentTime + 1.5);
      } else {
        volum.connect(sortida(ctx));
        aturarFont = SINTESI_MUSICA[nom](ctx, volum, ctx.currentTime + 0.05);
      }
    } catch {
      // Si no pot sonar, en silenci.
    }
  });

  return () => {
    if (aturada) return;
    aturada = true;
    try {
      rellotge.stop();
    } catch {
      // Ja aturat.
    }
    const ara = ctx.currentTime;
    try {
      volum.gain.cancelScheduledValues(ara);
      volum.gain.setValueAtTime(Math.max(volum.gain.value, 0.0001), ara);
      volum.gain.exponentialRampToValueAtTime(0.0001, ara + 1.2);
    } catch {
      // Ja aturat.
    }
    try {
      aturarFont?.();
    } catch {
      // Ja aturat.
    }
    setTimeout(() => volum.disconnect(), 1600);
  };
}

// ---------------------------------------------------------------------------
// Veu de Fra Francesc

const veus = new Map<string, Promise<AudioBuffer | null>>();

function bufferVeu(ctx: AudioContext, src: string): Promise<AudioBuffer | null> {
  let promesa = veus.get(src);
  if (!promesa) {
    promesa = fetch(src)
      .then((res) => {
        if (!res.ok || !(res.headers.get("content-type") ?? "").startsWith("audio")) return null;
        return res.arrayBuffer();
      })
      .then((dades) => (dades ? ctx.decodeAudioData(dades) : null))
      .catch(() => null);
    veus.set(src, promesa);
  }
  return promesa;
}

/** Descarrega i descodifica una veu. Resol a false si el fitxer no existeix o no es pot llegir. */
export async function carregarVeu(src: string): Promise<boolean> {
  const ctx = obtenirContext();
  return ctx ? (await bufferVeu(ctx, src)) !== null : false;
}

export interface Reproduccio {
  /** Atura la veu i torna el segon on s'ha quedat (per reprendre-la). */
  aturar(): number;
}

let veuActual: Reproduccio | null = null;

/**
 * Fa sonar una veu des de `desDe` segons. Només en sona una alhora: la que sonava s'atura.
 * `enAcabar` s'avisa quan arriba al final (no quan s'atura a mà).
 */
export async function sonarVeu(src: string, desDe: number, enAcabar: () => void): Promise<Reproduccio | null> {
  const ctx = obtenirContext();
  if (!ctx) return null;
  if (ctx.state !== "running") ctx.resume().catch(() => {});
  const buffer = await bufferVeu(ctx, src);
  if (!buffer) return null;

  veuActual?.aturar();
  const font = ctx.createBufferSource();
  font.buffer = buffer;
  font.connect(ctx.destination);
  const inici = ctx.currentTime - desDe;
  let aturada = false;
  font.onended = () => {
    if (aturada) return;
    aturada = true;
    if (veuActual === reproduccio) veuActual = null;
    enAcabar();
  };
  font.start(0, Math.min(desDe, buffer.duration));

  const reproduccio: Reproduccio = {
    aturar() {
      if (!aturada) {
        aturada = true;
        try {
          font.stop();
        } catch {
          // Ja aturada.
        }
      }
      if (veuActual === reproduccio) veuActual = null;
      return Math.min(ctx.currentTime - inici, buffer.duration);
    },
  };
  veuActual = reproduccio;
  return reproduccio;
}
