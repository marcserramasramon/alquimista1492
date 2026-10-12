"use client";

/**
 * So de l'extra de l'aigua, sintetitzat amb Web Audio (sense fitxers): el bram constant d'uns ràpids
 * que puja i baixa lentament, un xiscle d'escuma agut i bombolles i esquitxades aleatòries. Passa per un
 * volum mestre que es pot silenciar. Només comença quan l'usuari toca el botó d'entrada i s'atura en sortir.
 */

let context: AudioContext | null = null;
let mestre: GainNode | null = null;
let soroll: AudioBuffer | null = null;
let silenciat = false;
let bombolles: ReturnType<typeof setTimeout> | null = null;
let bram: { fonts: AudioScheduledSourceNode[] } | null = null;

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

/** Una bombolla: un to curt que puja de pressa, com un glop d'aigua. */
function bombolla() {
  const c = context;
  if (!c || !mestre) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "sine";
  const base = 280 + Math.random() * 600;
  osc.frequency.setValueAtTime(base, t);
  osc.frequency.exponentialRampToValueAtTime(base * 2.2, t + 0.1);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.06, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  osc.connect(gain).connect(mestre);
  osc.start(t);
  osc.stop(t + 0.16);
}

/** Una esquitxada: un cop curt de soroll agut. */
function esquitxada() {
  const c = context;
  if (!c || !mestre || !soroll) return;
  const t = c.currentTime;
  const font = fontSoroll(c, false);
  const filtre = c.createBiquadFilter();
  filtre.type = "highpass";
  filtre.frequency.value = 1500 + Math.random() * 2500;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.14 + Math.random() * 0.14, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18 + Math.random() * 0.2);
  font.connect(filtre).connect(gain).connect(mestre);
  font.start(t, Math.random(), 0.5);
}

function programaBombolla() {
  bombolles = setTimeout(
    () => {
      if (Math.random() < 0.55) bombolla();
      else esquitxada();
      programaBombolla();
    },
    120 + Math.random() * 600,
  );
}

/** Comença el so de fons dels ràpids (cal cridar-ho des d'un gest de l'usuari). */
export function iniciarSoAigua() {
  const c = obtenirContext();
  if (!c || !mestre || bram) return;
  void c.resume().catch(() => {});

  // Cos del bram: soroll de banda mitjana, amb el volum que respira lentament.
  const cos = fontSoroll(c, true);
  const filtreCos = c.createBiquadFilter();
  filtreCos.type = "bandpass";
  filtreCos.frequency.value = 650;
  filtreCos.Q.value = 0.45;
  const gainCos = c.createGain();
  gainCos.gain.value = 0.42;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.35;
  const profunditat = c.createGain();
  profunditat.gain.value = 0.1;
  lfo.connect(profunditat).connect(gainCos.gain);
  cos.connect(filtreCos).connect(gainCos).connect(mestre);

  // Xiscle d'escuma: soroll agut, fluix.
  const escuma = fontSoroll(c, true);
  const filtreEscuma = c.createBiquadFilter();
  filtreEscuma.type = "highpass";
  filtreEscuma.frequency.value = 3000;
  const gainEscuma = c.createGain();
  gainEscuma.gain.value = 0.1;
  escuma.connect(filtreEscuma).connect(gainEscuma).connect(mestre);

  cos.start();
  escuma.start(0, 0.7);
  lfo.start();
  bram = { fonts: [cos, escuma, lfo] };
  programaBombolla();
}

export function aturarSoAigua() {
  if (bombolles) clearTimeout(bombolles);
  bombolles = null;
  for (const font of bram?.fonts ?? []) {
    try {
      font.stop();
    } catch {
      // Ja parat.
    }
  }
  bram = null;
  void context?.close().catch(() => {});
  context = null;
  mestre = null;
  soroll = null;
}

export function silenciarAigua(si: boolean) {
  silenciat = si;
  if (mestre) mestre.gain.value = si ? 0 : 1;
}
