"use client";

/**
 * So de l'extra de realitat augmentada.
 *
 * - Passes: abans que aparegui la figura se senten uns peus que s'acosten. Sonen amb la gravació
 *   real (public/audio/ar/passes-grava.mp3, «footsteps on gravel and tuff» de lesiakower,
 *   Pixabay) i, si no es pot carregar, amb passes sintetitzades.
 * - Ambient: una nit al camp, sintetitzada amb Web Audio (sense fitxers): vent, grills, un mussol
 *   de tant en tant, branques que cruixen i fulles que es belluguen. Es pot canviar per una
 *   gravació amb llicència: només cal posar-la a `public/audio/ar/` i fer-la sonar a `iniciarAmbientAr`.
 *
 * Tot passa per un volum mestre que es pot silenciar. Només comença quan l'usuari toca el botó
 * d'entrada (els navegadors mòbils no deixen sonar abans) i s'atura en sortir.
 */

let context: AudioContext | null = null;
let mestre: GainNode | null = null;
let soroll: AudioBuffer | null = null;
let gravacio: AudioBuffer | null = null;
let silenciat = false;
const veus: Partial<Record<NomVeuAr, AudioBuffer>> = {};
let caminada: { gain: GainNode; panner: StereoPannerNode | null } | null = null;
let voltaCaminada: ReturnType<typeof setTimeout> | null = null;
let volumCaminada = 0;
let ambient: { aturar: () => void } | null = null;

const URL_PASSES = "/audio/ar/passes-grava.mp3";

/**
 * Veu de l'Inquisidor (Fra Francesc disfressat): «On sou?» abans de les primeres passes, «Alto!»
 * quan acaben i «A la força!» quan el jugador l'enfoca. `defecteMs` és la durada que s'assumeix
 * mentre el fitxer no s'ha carregat (o no pot sonar), perquè el guió no es desfaci.
 */
export type NomVeuAr = "on-sou" | "alto" | "a-la-forca";
const VEUS: Record<NomVeuAr, { url: string; defecteMs: number }> = {
  "on-sou": { url: "/audio/ar/inquisidor-on-sou.wav", defecteMs: 4600 },
  alto: { url: "/audio/ar/inquisidor-alto.wav", defecteMs: 900 },
  "a-la-forca": { url: "/audio/ar/inquisidor-a-la-forca.wav", defecteMs: 2200 },
};
const VOLUM = 1;
/** Volum màxim de les passes d'abans que aparegui la figura (0-1). */
const VOLUM_PASSES = 0.4;

function obtenirContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      context = new Ctor();
      mestre = context.createGain();
      mestre.gain.value = silenciat ? 0 : VOLUM;
      mestre.connect(context.destination);
    } catch {
      context = null;
      mestre = null;
      return null;
    }
  }
  return context;
}

/** Sortida comuna, amb panoràmica opcional (-1 esquerra, 1 dreta). */
function sortida(ctx: AudioContext, pan: number): AudioNode {
  const desti = mestre ?? ctx.destination;
  if (typeof ctx.createStereoPanner !== "function") return desti;
  const panner = ctx.createStereoPanner();
  panner.pan.value = Math.max(-1, Math.min(1, pan));
  panner.connect(desti);
  return panner;
}

/** Soroll blanc breu, compartit per tots els sons. */
function bufferSoroll(ctx: AudioContext): AudioBuffer {
  if (soroll) return soroll;
  const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * 2), ctx.sampleRate);
  const dades = buffer.getChannelData(0);
  for (let i = 0; i < dades.length; i++) dades[i] = Math.random() * 2 - 1;
  soroll = buffer;
  return buffer;
}

const aleatori = (min: number, max: number) => min + Math.random() * (max - min);

/** Prepara el so. S'ha de cridar dins d'un gest de l'usuari. */
export function iniciarSoAr() {
  const ctx = obtenirContext();
  if (!ctx) return;
  ctx.resume().catch(() => {});
  // Carrega i descodifica la gravació de passes; si falla, sonaran les sintetitzades.
  for (const nom of Object.keys(VEUS) as NomVeuAr[]) {
    if (veus[nom]) continue;
    fetch(VEUS[nom].url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(nom))))
      .then((dades) => ctx.decodeAudioData(dades))
      .then((buffer) => {
        veus[nom] = buffer;
      })
      .catch(() => {});
  }
  if (!gravacio) {
    fetch(URL_PASSES)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error("passes"))))
      .then((dades) => ctx.decodeAudioData(dades))
      .then((buffer) => {
        gravacio = buffer;
      })
      .catch(() => {});
  }
}

export function aturarSoAr() {
  aturarAmbientAr();
  if (voltaCaminada) clearTimeout(voltaCaminada);
  voltaCaminada = null;
  caminada = null;
  volumCaminada = 0;
  context?.close().catch(() => {});
  context = null;
  mestre = null;
  soroll = null;
  gravacio = null;
  for (const nom of Object.keys(veus) as NomVeuAr[]) delete veus[nom];
}

/** Silencia o torna a activar tot el so de l'extra. */
export function silenciarAr(si: boolean) {
  silenciat = si;
  if (mestre && context) mestre.gain.setTargetAtTime(si ? 0 : VOLUM, context.currentTime, 0.05);
}

/**
 * Fa sonar una frase de l'Inquisidor, a volum ple i al centre. Retorna quant dura (ms), perquè qui
 * l'ha demanada pugui encadenar el que ve després (les passes, la següent frase...).
 */
export function sonarVeuAr(nom: NomVeuAr): number {
  const buffer = veus[nom];
  const ctx = context;
  if (!buffer || !ctx || !mestre || ctx.state !== "running") return VEUS[nom].defecteMs;
  const font = ctx.createBufferSource();
  font.buffer = buffer;
  font.connect(mestre);
  font.start(ctx.currentTime + 0.03);
  return buffer.duration * 1000;
}

// ───────────────────────────── Ambient ─────────────────────────────

/** Una veu de grill: ràfegues de tres a cinc cops secs, aguts i molt fluixos. */
function sonarGrill(ctx: AudioContext) {
  const t = ctx.currentTime + 0.02;
  const to = aleatori(4200, 5200);
  const s = sortida(ctx, aleatori(-1, 1));
  const cops = Math.floor(aleatori(3, 6));
  const volum = aleatori(0.008, 0.02);
  for (let i = 0; i < cops; i++) {
    const t1 = t + i * 0.052;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = to;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t1);
    g.gain.exponentialRampToValueAtTime(volum, t1 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.035);
    o.connect(g).connect(s);
    o.start(t1);
    o.stop(t1 + 0.04);
  }
}

/** Un mussol a lluny: «hu... hu-hu-huuu», amb el to una mica caient. */
function sonarMussol(ctx: AudioContext) {
  const t = ctx.currentTime + 0.05;
  const s = sortida(ctx, aleatori(-0.9, 0.9));
  const base = aleatori(330, 400);
  const notes: [number, number][] = [
    [0, 0.34],
    [0.62, 0.2],
    [0.9, 0.2],
    [1.18, 0.7],
  ];
  const volum = aleatori(0.05, 0.09);
  for (const [inici, durada] of notes) {
    const t1 = t + inici;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(base * 1.06, t1);
    o.frequency.exponentialRampToValueAtTime(base * 0.92, t1 + durada);
    // Una mica de resonància perquè soni a gola i no a xiulet.
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t1);
    g.gain.linearRampToValueAtTime(volum, t1 + durada * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t1 + durada);
    o.connect(f).connect(g).connect(s);
    o.start(t1);
    o.stop(t1 + durada + 0.02);
  }
}

/** Una branca que es trenca a lluny: un clic sec i una cua curta de cruixits. */
function sonarBranca(ctx: AudioContext) {
  const t = ctx.currentTime + 0.02;
  const s = sortida(ctx, aleatori(-1, 1));
  const volum = aleatori(0.12, 0.25);
  const crits = [0, 0.045, 0.09 + Math.random() * 0.05];
  crits.forEach((delta, i) => {
    const t1 = t + delta;
    const font = ctx.createBufferSource();
    font.buffer = bufferSoroll(ctx);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = aleatori(1400, 2600);
    f.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t1);
    g.gain.exponentialRampToValueAtTime(volum * (i === 0 ? 1 : 0.5), t1 + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.03 + i * 0.02);
    font.connect(f).connect(g).connect(s);
    font.start(t1, Math.random());
    font.stop(t1 + 0.1);
  });
}

/** Fulles que es belluguen: una onada de soroll agut que puja i s'apaga. */
function sonarFulles(ctx: AudioContext) {
  const t = ctx.currentTime + 0.02;
  const durada = aleatori(1.2, 2.4);
  const s = sortida(ctx, aleatori(-1, 1));
  const font = ctx.createBufferSource();
  font.buffer = bufferSoroll(ctx);
  font.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = aleatori(2800, 4200);
  f.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(aleatori(0.05, 0.1), t + durada * 0.4);
  g.gain.linearRampToValueAtTime(0.0001, t + durada);
  font.connect(f).connect(g).connect(s);
  font.start(t);
  font.stop(t + durada + 0.05);
}

/**
 * Comença l'ambient de la nit: vent de fons i, de tant en tant (a intervals aleatoris), grills,
 * un mussol, branques i fulles. Va fluix perquè les passes destaquin.
 */
export function iniciarAmbientAr() {
  const ctx = obtenirContext();
  if (!ctx || !mestre || ambient) return;
  ctx.resume().catch(() => {});
  const sortidaMestre = mestre;

  // Vent: soroll filtrat amb un filtre que respira lentament.
  const vent = ctx.createBufferSource();
  vent.buffer = bufferSoroll(ctx);
  vent.loop = true;
  const filtre = ctx.createBiquadFilter();
  filtre.type = "bandpass";
  filtre.frequency.value = 380;
  filtre.Q.value = 0.8;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const profunditat = ctx.createGain();
  profunditat.gain.value = 140;
  lfo.connect(profunditat).connect(filtre.frequency);
  const gVent = ctx.createGain();
  gVent.gain.value = 0.07;
  vent.connect(filtre).connect(gVent).connect(sortidaMestre);
  vent.start();
  lfo.start();

  // Esdeveniments puntuals, cadascun amb el seu propi temps aleatori.
  const temporitzadors = new Set<ReturnType<typeof setTimeout>>();
  let actiu = true;
  const programa = (so: (c: AudioContext) => void, minMs: number, maxMs: number) => {
    const torn = () => {
      if (!actiu) return;
      if (ctx.state === "running") so(ctx);
      const id = setTimeout(torn, aleatori(minMs, maxMs));
      temporitzadors.add(id);
    };
    const id = setTimeout(torn, aleatori(minMs * 0.4, maxMs * 0.6));
    temporitzadors.add(id);
  };
  programa(sonarGrill, 500, 1500);
  programa(sonarMussol, 22_000, 45_000);
  programa(sonarBranca, 12_000, 28_000);
  programa(sonarFulles, 9000, 20_000);

  ambient = {
    aturar: () => {
      actiu = false;
      temporitzadors.forEach((id) => clearTimeout(id));
      for (const node of [vent, lfo]) {
        try {
          node.stop();
        } catch {
          // Ja aturat.
        }
      }
    },
  };
}

export function aturarAmbientAr() {
  ambient?.aturar();
  ambient = null;
}

// ───────────────────────── Passes mentre camina ─────────────────────────

/** Una còpia de la gravació amb fos d'entrada i de sortida, cap al volum de la caminada. */
function copiaCaminada(ctx: AudioContext, buffer: AudioBuffer, desti: AudioNode) {
  const solapament = 0.25;
  const t = ctx.currentTime + 0.02;
  const font = ctx.createBufferSource();
  font.buffer = buffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(1, t + solapament);
  g.gain.setValueAtTime(1, t + buffer.duration - solapament);
  g.gain.linearRampToValueAtTime(0.0001, t + buffer.duration);
  font.connect(g).connect(desti);
  font.start(t, Math.random() * 0.4);
  font.stop(t + buffer.duration);
  return (buffer.duration - solapament) * 1000;
}

/**
 * Passes de la figura mentre camina: la gravació en bucle, a un volum que va de 0 (quieta) a 1.
 * S'ha de cridar a cada fotograma mentre la figura és present; `pan` va de -1 a 1. Quan el volum
 * baixa a 0 (s'atura), s'esvaeix i deixa de repetir la gravació.
 */
export function actualitzarCaminadaAr(volum: number, pan: number) {
  const ctx = context;
  if (!ctx || !mestre || ctx.state !== "running" || !gravacio) return;
  if (!caminada) {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    let panner: StereoPannerNode | null = null;
    if (typeof ctx.createStereoPanner === "function") {
      panner = ctx.createStereoPanner();
      gain.connect(panner).connect(mestre);
    } else {
      gain.connect(mestre);
    }
    caminada = { gain, panner };
  }
  volumCaminada = Math.max(0, Math.min(1, volum));
  caminada.gain.gain.setTargetAtTime(volumCaminada, ctx.currentTime, 0.2);
  caminada.panner?.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), ctx.currentTime, 0.2);

  if (volumCaminada > 0.02 && voltaCaminada === null) {
    const torn = () => {
      voltaCaminada = null;
      if (!context || !caminada || !gravacio || volumCaminada <= 0.02) return;
      const espera = copiaCaminada(context, gravacio, caminada.gain);
      voltaCaminada = setTimeout(torn, espera);
    };
    torn();
  }
}

// ───────────────────────────── Passes ─────────────────────────────

/**
 * La gravació de passes durant `duradaMs`: si és més curta, es repeteix amb un petit solapament;
 * puja de volum i es va centrant, com algú que s'acosta, i s'esvaeix al final.
 */
function sonarGravacio(ctx: AudioContext, buffer: AudioBuffer, pan: number, duradaMs: number) {
  const dur = duradaMs / 1000;
  const t0 = ctx.currentTime + 0.05;

  const gMestre = ctx.createGain();
  gMestre.gain.setValueAtTime(VOLUM_PASSES * 0.15, t0);
  gMestre.gain.linearRampToValueAtTime(VOLUM_PASSES, t0 + dur * 0.85);
  gMestre.gain.setValueAtTime(VOLUM_PASSES, t0 + dur - 0.01);
  gMestre.gain.linearRampToValueAtTime(0.0001, t0 + dur + 0.4);
  if (typeof ctx.createStereoPanner === "function") {
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, t0);
    panner.pan.linearRampToValueAtTime(pan * 0.4, t0 + dur);
    gMestre.connect(panner).connect(mestre ?? ctx.destination);
  } else {
    gMestre.connect(mestre ?? ctx.destination);
  }

  // Còpies seguides amb 0,25 s de solapament i un petit fos entre elles.
  const solapament = 0.25;
  for (let inici = 0; inici < dur; inici += buffer.duration - solapament) {
    const font = ctx.createBufferSource();
    font.buffer = buffer;
    const g = ctx.createGain();
    const t = t0 + inici;
    g.gain.setValueAtTime(inici === 0 ? 1 : 0.0001, t);
    if (inici > 0) g.gain.linearRampToValueAtTime(1, t + solapament);
    g.gain.setValueAtTime(1, t + buffer.duration - solapament);
    g.gain.linearRampToValueAtTime(0.0001, t + buffer.duration);
    font.connect(g).connect(gMestre);
    font.start(t);
    font.stop(t + buffer.duration);
  }
}

/**
 * Passes de qui s'acosta caminant durant `duradaMs`: la gravació real o, si no s'ha pogut
 * carregar, passes sintetitzades (un copet greu i un cruixit de terra, cada cop més fort).
 * `pan` va de -1 (esquerra) a 1 (dreta).
 */
export function sonarPassesAr(pan: number, duradaMs: number) {
  const ctx = obtenirContext();
  if (!ctx || ctx.state !== "running") return;
  if (gravacio) {
    sonarGravacio(ctx, gravacio, pan, duradaMs);
    return;
  }
  const pas = 0.62;
  const passos = Math.max(2, Math.floor(duradaMs / 1000 / pas));
  const inici = ctx.currentTime + 0.1;

  for (let i = 0; i < passos; i++) {
    const t = inici + i * pas + (Math.random() - 0.5) * 0.06;
    const volum = (0.1 + 0.5 * (i / (passos - 1))) * VOLUM_PASSES;
    // Una mica cada cop més cap al centre: s'acosta.
    const s = sortida(ctx, pan * (1 - 0.5 * (i / (passos - 1))));

    // Cruixit de grava: soroll filtrat i molt curt.
    const font = ctx.createBufferSource();
    font.buffer = bufferSoroll(ctx);
    const filtre = ctx.createBiquadFilter();
    filtre.type = "bandpass";
    filtre.frequency.value = i % 2 === 0 ? 720 : 560;
    filtre.Q.value = 0.9;
    const gc = ctx.createGain();
    gc.gain.setValueAtTime(0.0001, t);
    gc.gain.exponentialRampToValueAtTime(volum, t + 0.008);
    gc.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    font.connect(filtre).connect(gc).connect(s);
    font.start(t, Math.random());
    font.stop(t + 0.14);

    // Copet greu del taló.
    const cop = ctx.createOscillator();
    cop.type = "sine";
    cop.frequency.setValueAtTime(95, t);
    cop.frequency.exponentialRampToValueAtTime(52, t + 0.12);
    const gp = ctx.createGain();
    gp.gain.setValueAtTime(0.0001, t);
    gp.gain.exponentialRampToValueAtTime(volum * 0.9, t + 0.006);
    gp.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    cop.connect(gp).connect(s);
    cop.start(t);
    cop.stop(t + 0.18);
  }
}
