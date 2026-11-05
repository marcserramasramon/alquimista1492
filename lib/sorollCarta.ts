"use client";

/**
 * So de la prova de la carta.
 *
 * - De fons (public/audio/carta/fons.mp3): sona a cicles, amb entrada i sortida progressives i un
 *   silenci entre mig.
 * - Moviment de la carta (moviment-aprop.mp3 i moviment-lluny.mp3): sonen en bucle i es fonen l'un amb
 *   l'altre segons si la carta és a prop o lluny d'on mira el mòbil, i a la banda on és.
 * - La ventada que s'endú la carta i el segell que es trenca es sintetitzen amb Web Audio.
 *
 * S'ha d'iniciar dins d'un gest de l'usuari (els navegadors mòbils no deixen sonar abans).
 */

const URL_FONS = "/audio/carta/fons.mp3";
const URL_APROP = "/audio/carta/moviment-aprop.mp3";
const URL_LLUNY = "/audio/carta/moviment-lluny.mp3";

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
let moviment: { aprop: GainNode; lluny: GainNode; panner: StereoPannerNode | null } | null = null;
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

/** Baixa un so i el fa sonar en bucle cap a `desti`. Si no es pot carregar, la prova continua sense. */
async function sonarEnBucle(ctx: AudioContext, url: string, desti: AudioNode) {
  try {
    const resposta = await fetch(url);
    const buffer = await ctx.decodeAudioData(await resposta.arrayBuffer());
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
    void sonarEnBucle(ctx, URL_FONS, fons);
    cicleFons(ctx, fons);

    const aprop = ctx.createGain();
    const lluny = ctx.createGain();
    aprop.gain.value = 0;
    lluny.gain.value = 0;
    let panner: StereoPannerNode | null = null;
    if (typeof ctx.createStereoPanner === "function") {
      panner = ctx.createStereoPanner();
      panner.connect(ctx.destination);
    }
    aprop.connect(panner ?? ctx.destination);
    lluny.connect(panner ?? ctx.destination);
    moviment = { aprop, lluny, panner };
    void sonarEnBucle(ctx, URL_APROP, aprop);
    void sonarEnBucle(ctx, URL_LLUNY, lluny);
  } catch {
    context = null;
    moviment = null;
  }
}

/**
 * Moviment de la carta: `proximitat` és 1 si es mira just cap a ella i 0 si és a l'esquena, i `pan` la
 * banda on és (-1 esquerra, 1 dreta).
 */
export function ajustarMovimentCarta(proximitat: number, pan: number) {
  if (!context || !moviment) return;
  const ara = context.currentTime;
  const prop = Math.max(0, Math.min(1, (proximitat - 0.5) * 2));
  moviment.aprop.gain.setTargetAtTime(prop * VOLUM_MOVIMENT, ara, 0.1);
  moviment.lluny.gain.setTargetAtTime((1 - prop) * VOLUM_MOVIMENT, ara, 0.1);
  moviment.panner?.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), ara, 0.1);
}

/** La carta ja no es mou: només queda el so de fons. */
export function silenciarMovimentCarta() {
  if (!context || !moviment) return;
  const ara = context.currentTime;
  moviment.aprop.gain.setTargetAtTime(0, ara, 0.1);
  moviment.lluny.gain.setTargetAtTime(0, ara, 0.1);
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
  moviment = null;
  const ctx = context;
  context = null;
  soroll = null;
  void ctx?.close().catch(() => {});
}
