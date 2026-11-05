"use client";

/**
 * So de la prova de la carta.
 *
 * - De fons (public/audio/carta/fons.mp3): sona a cicles, amb entrada i sortida progressives i un
 *   silenci entre mig.
 * - Moviment de la carta (moviment-aprop.mp3 i moviment-lluny.mp3): sonen una sola vegada cada cop que
 *   la carta s'acosta o s'allunya, de la banda on és.
 * - La ventada que s'endú la carta i el segell que es trenca es sintetitzen amb Web Audio.
 *
 * S'ha d'iniciar dins d'un gest de l'usuari (els navegadors mòbils no deixen sonar abans).
 */

export type TipusMoviment = "aprop" | "lluny";

const URL_FONS = "/audio/carta/fons.mp3";
/** Riure del primer cop que la carta s'escapa («funny child laughter» d'universfield). */
const URL_RIURE = "/audio/carta/riure.mp3";
const VOLUM_RIURE = 0.7;
/** Música de quan obren la carta («toward the dream» de grand_project, els primers 10 s). */
const URL_MUSICA = "/audio/carta/musica.mp3";
const VOLUM_MUSICA = 0.55;
const DURADA_MUSICA = 10;
const FADE_MUSICA = 4;
/** Paper que es desplega quan obren la carta («unfold a map» de freesound_community). */
const URL_OBRIR = "/audio/carta/obrir.mp3";
const VOLUM_OBRIR = 0.7;
const URL_MOVIMENT: Record<TipusMoviment, string> = {
  aprop: "/audio/carta/moviment-aprop.mp3",
  lluny: "/audio/carta/moviment-lluny.mp3",
};

/** Volum del so de fons, de 0 a 1. */
const VOLUM_FONS = 0.2;
/** Cada cicle del so de fons: quant dura (segons), dins d'això l'entrada i la sortida, i el silenci posterior. */
const DURADA_FONS = 3;
const FADE_FONS = 1;
const SILENCI_FONS = 1;

/** Volum màxim dels sons de moviment i dels cops (fugida i segell), de 0 a 1. */
const VOLUM_MOVIMENT = 0.5;
const VOLUM_COPS = 0.4;

let context: AudioContext | null = null;
let soroll: AudioBuffer | null = null;
const sonsMoviment: Partial<Record<TipusMoviment, AudioBuffer>> = {};
let riure: AudioBuffer | null = null;
let obrir: AudioBuffer | null = null;
let bufferMusica: AudioBuffer | null = null;
let fonsGain: GainNode | null = null;
/** Estat de la música: encara no, demanada però sense baixar, o ja engegada. */
let estatMusica: "espera" | "pendent" | "sonant" = "espera";
let fonts: AudioBufferSourceNode[] = [];
let tempsFons: ReturnType<typeof setTimeout> | null = null;

function bufferSoroll(ctx: AudioContext): AudioBuffer {
  if (soroll) return soroll;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const dades = buffer.getChannelData(0);
  for (let i = 0; i < dades.length; i++) dades[i] = Math.random() * 2 - 1;
  soroll = buffer;
  return buffer;
}

async function carregarSo(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const resposta = await fetch(url);
  return ctx.decodeAudioData(await resposta.arrayBuffer());
}

/** Baixa un so de moviment. Si no es pot carregar, la prova continua sense. */
async function carregarMoviment(ctx: AudioContext, tipus: TipusMoviment) {
  try {
    const buffer = await carregarSo(ctx, URL_MOVIMENT[tipus]);
    if (ctx === context) sonsMoviment[tipus] = buffer;
  } catch {
    // Sense aquest so.
  }
}

/** Baixa el so de fons i el fa sonar en bucle cap a `desti` (el volum el porten els cicles). */
async function sonarFons(ctx: AudioContext, desti: AudioNode) {
  try {
    const buffer = await carregarSo(ctx, URL_FONS);
    if (ctx !== context) return;
    const font = ctx.createBufferSource();
    font.buffer = buffer;
    font.loop = true;
    font.connect(desti);
    font.start();
    fonts.push(font);
  } catch {
    // Sense aquest so.
  }
}

/** Un cicle del so de fons i, després del silenci, el següent. */
function cicleFons(ctx: AudioContext, gain: GainNode) {
  if (ctx !== context) return;
  const t = ctx.currentTime + 0.05;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(VOLUM_FONS, t + FADE_FONS);
  gain.gain.setValueAtTime(VOLUM_FONS, t + DURADA_FONS - FADE_FONS);
  gain.gain.linearRampToValueAtTime(0, t + DURADA_FONS);
  tempsFons = setTimeout(() => cicleFons(ctx, gain), (DURADA_FONS + SILENCI_FONS) * 1000);
}

export function iniciarSoCarta() {
  if (typeof window === "undefined" || context) return;
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  try {
    const ctx = new Ctor();
    context = ctx;
    void ctx.resume().catch(() => {});

    const fons = ctx.createGain();
    fons.gain.value = 0;
    fons.connect(ctx.destination);
    fonsGain = fons;
    estatMusica = "espera";
    void carregarSo(ctx, URL_MUSICA)
      .then((buffer) => {
        if (ctx !== context) return;
        bufferMusica = buffer;
        if (estatMusica === "pendent") engegarMusica();
      })
      .catch(() => {});
    void sonarFons(ctx, fons);
    cicleFons(ctx, fons);

    void carregarMoviment(ctx, "aprop");
    void carregarMoviment(ctx, "lluny");
    void carregarSo(ctx, URL_RIURE)
      .then((buffer) => {
        if (ctx === context) riure = buffer;
      })
      .catch(() => {});
    void carregarSo(ctx, URL_OBRIR)
      .then((buffer) => {
        if (ctx === context) obrir = buffer;
      })
      .catch(() => {});
  } catch {
    context = null;
  }
}

/** La carta s'acosta o s'allunya: el so sona una vegada, de la banda on és (-1 esquerra, 1 dreta). */
export function sonarMovimentCarta(tipus: TipusMoviment, pan: number) {
  const buffer = sonsMoviment[tipus];
  if (!context || !buffer) return;
  const ctx = context;
  const font = ctx.createBufferSource();
  font.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = VOLUM_MOVIMENT;
  font.connect(gain);
  if (typeof ctx.createStereoPanner === "function") {
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    gain.connect(panner).connect(ctx.destination);
  } else {
    gain.connect(ctx.destination);
  }
  font.start();
}

/** Esclat curt de soroll filtrat: la base de la ventada i del segell. */
function esclat(frequencia: number, durada: number, volum: number, tipus: BiquadFilterType = "bandpass") {
  if (!context) return;
  const ctx = context;
  const font = ctx.createBufferSource();
  font.buffer = bufferSoroll(ctx);
  const filtre = ctx.createBiquadFilter();
  filtre.type = tipus;
  filtre.frequency.value = frequencia;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volum * VOLUM_COPS, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durada);
  font.connect(filtre).connect(gain).connect(ctx.destination);
  font.start(ctx.currentTime, Math.random());
  font.stop(ctx.currentTime + durada);
}

function engegarMusica() {
  if (!context || !bufferMusica) return;
  const t = context.currentTime;
  const font = context.createBufferSource();
  font.buffer = bufferMusica;
  const gain = context.createGain();
  gain.gain.setValueAtTime(VOLUM_MUSICA, t);
  gain.gain.setValueAtTime(VOLUM_MUSICA, t + DURADA_MUSICA - FADE_MUSICA);
  gain.gain.linearRampToValueAtTime(0, t + DURADA_MUSICA);
  font.connect(gain).connect(context.destination);
  font.start(t);
  font.stop(t + DURADA_MUSICA);
  estatMusica = "sonant";
}

/** Han atrapat la carta: calla el so de fons, també perquè el micròfon no el senti en cridar. */
export function callarFonsCarta() {
  if (!context) return;
  if (tempsFons) clearTimeout(tempsFons);
  tempsFons = null;
  if (fonsGain) {
    const ara = context.currentTime;
    fonsGain.gain.cancelScheduledValues(ara);
    fonsGain.gain.setTargetAtTime(0, ara, 0.1);
  }
}

/** Han obert la carta: sona la música sencera. Només una vegada. */
export function iniciarMusicaCarta() {
  if (!context || estatMusica !== "espera") return;
  estatMusica = "pendent";
  engegarMusica();
}

function sonarUnCop(buffer: AudioBuffer | null, volum: number) {
  if (!context || !buffer) return;
  const font = context.createBufferSource();
  font.buffer = buffer;
  const gain = context.createGain();
  gain.gain.value = volum;
  font.connect(gain).connect(context.destination);
  font.start();
}

/** El riure quan la carta s'escapa. Només es crida el primer cop que la toquen. */
export function sonarRiureCarta() {
  sonarUnCop(riure, VOLUM_RIURE);
}

/** El paper que es desplega quan obren la carta. */
export function sonarObrirCarta() {
  sonarUnCop(obrir, VOLUM_OBRIR);
}

/** La ventada que s'endú la carta. */
export function sonarFugidaCarta() {
  esclat(900, 1, 0.8, "lowpass");
}

/** Una esquerda al segell. */
export function sonarEsquerdaCarta() {
  esclat(3400, 0.09, 0.9);
}

/** El segell es trenca del tot. */
export function sonarTrencaCarta() {
  esclat(2200, 0.22, 1);
  esclat(500, 0.3, 0.8, "lowpass");
}

export function aturarSoCarta() {
  if (tempsFons) clearTimeout(tempsFons);
  tempsFons = null;
  for (const font of fonts) {
    try {
      font.stop();
    } catch {
      // Ja estava aturat.
    }
  }
  fonts = [];
  delete sonsMoviment.aprop;
  delete sonsMoviment.lluny;
  riure = null;
  obrir = null;
  bufferMusica = null;
  fonsGain = null;
  estatMusica = "espera";
  const ctx = context;
  context = null;
  soroll = null;
  void ctx?.close().catch(() => {});
}
