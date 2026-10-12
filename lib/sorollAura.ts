"use client";

/**
 * So de l'extra de l'aura, sintetitzat amb Web Audio (sense fitxers): un coixí greu i lluminós
 * (acord obert que respira), campanetes cristal·lines de tant en tant sobre una escala pentatònica,
 * i un pols més ample cada cop que l'aura emet un anell d'energia. Passa per un volum mestre que es
 * pot silenciar. Només comença quan l'usuari toca el botó d'entrada i s'atura en sortir.
 */

let context: AudioContext | null = null;
let mestre: GainNode | null = null;
let eco: GainNode | null = null;
let silenciat = false;
let campanetes: ReturnType<typeof setTimeout> | null = null;
let coixi: OscillatorNode[] = [];

/** Escala pentatònica (La major) en Hz, de dues octaves. */
const ESCALA = [440, 493.88, 554.37, 659.25, 739.99, 880, 987.77, 1108.73, 1318.51, 1479.98];

function obtenirContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      context = new Ctor();
      mestre = context.createGain();
      mestre.gain.value = silenciat ? 0 : 1;
      mestre.connect(context.destination);
      // Eco amb realimentació filtrada: dona l'aire de catedral a les campanetes.
      eco = context.createGain();
      eco.gain.value = 0.55;
      const retard = context.createDelay(1);
      retard.delayTime.value = 0.42;
      const realimentacio = context.createGain();
      realimentacio.gain.value = 0.45;
      const filtre = context.createBiquadFilter();
      filtre.type = "lowpass";
      filtre.frequency.value = 3200;
      eco.connect(retard).connect(filtre).connect(realimentacio).connect(retard);
      filtre.connect(mestre);
    } catch {
      context = null;
      mestre = null;
      eco = null;
      return null;
    }
  }
  return context;
}

function campaneta(freq: number, volum: number, pan = 0) {
  const c = context;
  if (!c || !mestre || !eco) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  // Un harmònic lleument desafinat dona l'aire de vidre.
  const osc2 = c.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = freq * 2.01;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volum, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 3);
  const gain2 = c.createGain();
  gain2.gain.value = 0.25;
  osc.connect(gain);
  osc2.connect(gain2).connect(gain);
  let sortida: AudioNode = gain;
  if (typeof c.createStereoPanner === "function") {
    const panner = c.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    sortida = gain.connect(panner);
  }
  sortida.connect(mestre);
  sortida.connect(eco);
  osc.start(t);
  osc2.start(t);
  osc.stop(t + 3.1);
  osc2.stop(t + 3.1);
}

function programaCampaneta() {
  campanetes = setTimeout(
    () => {
      const nota = ESCALA[Math.floor(Math.random() * ESCALA.length)];
      campaneta(nota, 0.05 + Math.random() * 0.05, Math.random() * 1.6 - 0.8);
      programaCampaneta();
    },
    1200 + Math.random() * 3200,
  );
}

/** Comença el so de fons de l'aura (cal cridar-ho des d'un gest de l'usuari). */
export function iniciarSoAura() {
  const c = obtenirContext();
  if (!c || !mestre || coixi.length) return;
  void c.resume().catch(() => {});
  // Coixí: La greu, la quinta i la desena, amb una respiració lenta de volum.
  const gain = c.createGain();
  gain.gain.value = 0.06;
  const filtre = c.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.value = 900;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.2;
  const profunditat = c.createGain();
  profunditat.gain.value = 0.03;
  lfo.connect(profunditat).connect(gain.gain);
  gain.connect(filtre).connect(mestre);
  for (const [freq, desafinacio] of [
    [110, 0],
    [110, 4],
    [164.81, -3],
    [220, 2],
    [277.18, -5],
  ] as const) {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    o.detune.value = desafinacio;
    o.connect(gain);
    o.start();
    coixi.push(o);
  }
  lfo.start();
  coixi.push(lfo);
  programaCampaneta();
}

/** Un pols d'energia: una campaneta greu i un acord obert que s'esvaeix. `pan` va de -1 a 1. */
export function sonarPulsAura(pan: number) {
  const c = context;
  if (!c) return;
  for (const [freq, volum] of [
    [220, 0.12],
    [329.63, 0.08],
    [554.37, 0.06],
  ] as const) {
    campaneta(freq, volum, pan);
  }
}

export function aturarSoAura() {
  if (campanetes) clearTimeout(campanetes);
  campanetes = null;
  for (const o of coixi) {
    try {
      o.stop();
    } catch {
      // Ja parat.
    }
  }
  coixi = [];
  void context?.close().catch(() => {});
  context = null;
  mestre = null;
  eco = null;
}

export function silenciarAura(si: boolean) {
  silenciat = si;
  if (mestre) mestre.gain.value = si ? 0 : 1;
}
