"use client";

/**
 * So de la prova de la carta, sintetitzat amb Web Audio (sense fitxers): el paper que voleia al vent,
 * més fort com més a prop es mira la carta, i el segell de cera que s'esquerda i es trenca.
 * S'ha d'iniciar dins d'un gest de l'usuari (els navegadors mòbils no deixen sonar abans).
 */

/** Volum màxim del paper al vent i dels cops (fugida i segell), de 0 a 1. */
const VOLUM_VENT = 0.2;
const VOLUM_COPS = 0.4;

let context: AudioContext | null = null;
let soroll: AudioBuffer | null = null;
let vent: { gain: GainNode; panner: StereoPannerNode | null; aturar: () => void } | null = null;

function bufferSoroll(ctx: AudioContext): AudioBuffer {
  if (soroll) return soroll;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const dades = buffer.getChannelData(0);
  for (let i = 0; i < dades.length; i++) dades[i] = Math.random() * 2 - 1;
  soroll = buffer;
  return buffer;
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

    const font = ctx.createBufferSource();
    font.buffer = bufferSoroll(ctx);
    font.loop = true;
    const filtre = ctx.createBiquadFilter();
    filtre.type = "bandpass";
    filtre.frequency.value = 2600;
    filtre.Q.value = 0.7;

    // El paper bat: una oscil·lació ràpida del volum.
    const batec = ctx.createGain();
    batec.gain.value = 0.6;
    const oscil = ctx.createOscillator();
    oscil.frequency.value = 11;
    const profunditat = ctx.createGain();
    profunditat.gain.value = 0.4;
    oscil.connect(profunditat).connect(batec.gain);

    const gain = ctx.createGain();
    gain.gain.value = 0;
    font.connect(filtre).connect(batec).connect(gain);
    let panner: StereoPannerNode | null = null;
    if (typeof ctx.createStereoPanner === "function") {
      panner = ctx.createStereoPanner();
      gain.connect(panner).connect(ctx.destination);
    } else {
      gain.connect(ctx.destination);
    }
    font.start();
    oscil.start();
    vent = {
      gain,
      panner,
      aturar: () => {
        font.stop();
        oscil.stop();
      },
    };
  } catch {
    context = null;
    vent = null;
  }
}

/** Volum (0-1) i banda (-1 esquerra, 1 dreta) del paper al vent. */
export function ajustarVentCarta(volum: number, pan: number) {
  if (!context || !vent) return;
  const ara = context.currentTime;
  vent.gain.gain.setTargetAtTime(Math.max(0, Math.min(1, volum)) * VOLUM_VENT, ara, 0.08);
  vent.panner?.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), ara, 0.08);
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
  try {
    vent?.aturar();
  } catch {
    // Ja estava aturat.
  }
  vent = null;
  void context?.close().catch(() => {});
  context = null;
  soroll = null;
}
