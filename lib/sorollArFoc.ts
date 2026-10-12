"use client";

/**
 * So de l'extra del foc, sintetitzat amb Web Audio (sense fitxers): el rugit greu d'una foguera,
 * espetecs de llenya i un xiulet d'aire cada cop que un arc de flames fa el salt. Passa per un
 * volum mestre que es pot silenciar. Només comença quan l'usuari toca el botó d'entrada i s'atura en sortir.
 */

let context: AudioContext | null = null;
let mestre: GainNode | null = null;
let soroll: AudioBuffer | null = null;
let silenciat = false;
let espetecs: ReturnType<typeof setTimeout> | null = null;
let rugit: { font: AudioBufferSourceNode; gain: GainNode } | null = null;

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
      soroll = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const d = soroll.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch {
      context = null;
      mestre = null;
      soroll = null;
      return null;
    }
  }
  return context;
}

function fontSoroll(c: AudioContext, bucle: boolean): AudioBufferSourceNode {
  const font = c.createBufferSource();
  font.buffer = soroll;
  font.loop = bucle;
  return font;
}

function espetec() {
  const c = context;
  if (!c || !mestre || !soroll) return;
  const t = c.currentTime;
  const font = fontSoroll(c, false);
  const filtre = c.createBiquadFilter();
  filtre.type = "highpass";
  filtre.frequency.value = 1200 + Math.random() * 2800;
  const gain = c.createGain();
  const vol = 0.15 + Math.random() * 0.3;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02 + Math.random() * 0.05);
  font.connect(filtre).connect(gain).connect(mestre);
  font.start(t, Math.random(), 0.1);
}

function programaEspetec() {
  espetecs = setTimeout(
    () => {
      espetec();
      if (Math.random() < 0.4) setTimeout(espetec, 40 + Math.random() * 60);
      programaEspetec();
    },
    120 + Math.random() * 700,
  );
}

/** Comença el so de fons del foc (cal cridar-ho des d'un gest de l'usuari). */
export function iniciarSoFoc() {
  const c = obtenirContext();
  if (!c || !mestre || rugit) return;
  void c.resume().catch(() => {});
  const font = fontSoroll(c, true);
  const filtre = c.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.value = 380;
  const gain = c.createGain();
  gain.gain.value = 0.28;
  font.connect(filtre).connect(gain).connect(mestre);
  font.start();
  rugit = { font, gain };
  programaEspetec();
}

/** Un xiulet d'aire i flames: un arc ha saltat. `pan` va de -1 (esquerra) a 1 (dreta). */
export function sonarSaltFoc(pan: number) {
  const c = context;
  if (!c || !mestre || !soroll) return;
  const t = c.currentTime;
  const font = fontSoroll(c, false);
  const filtre = c.createBiquadFilter();
  filtre.type = "bandpass";
  filtre.Q.value = 1.2;
  filtre.frequency.setValueAtTime(300, t);
  filtre.frequency.exponentialRampToValueAtTime(1400, t + 0.7);
  filtre.frequency.exponentialRampToValueAtTime(350, t + 1.7);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.5, t + 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
  let cadena: AudioNode = font.connect(filtre).connect(gain);
  if (typeof c.createStereoPanner === "function") {
    const panner = c.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    cadena = cadena.connect(panner);
  }
  cadena.connect(mestre);
  font.start(t, Math.random(), 1.9);
}

export function aturarSoFoc() {
  if (espetecs) clearTimeout(espetecs);
  espetecs = null;
  try {
    rugit?.font.stop();
  } catch {
    // Ja parat.
  }
  rugit = null;
  void context?.close().catch(() => {});
  context = null;
  mestre = null;
  soroll = null;
}

export function silenciarFoc(si: boolean) {
  silenciat = si;
  if (mestre) mestre.gain.value = si ? 0 : 1;
}
