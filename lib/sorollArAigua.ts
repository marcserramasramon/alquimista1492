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
let bufferRugit: AudioBuffer | null = null;
let bufferPassos: AudioBuffer | null = null;
let passos: { font: AudioBufferSourceNode; gain: GainNode } | null = null;

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
  gain.gain.exponentialRampToValueAtTime(0.012 + Math.random() * 0.015, t + 0.015);
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
  gain.gain.exponentialRampToValueAtTime(0.035 + Math.random() * 0.035, t + 0.02);
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
  void carregaRugit(c);
  void carregaPassos(c);

  // Cos del bram: soroll de banda mitjana, amb el volum que respira lentament.
  const cos = fontSoroll(c, true);
  const filtreCos = c.createBiquadFilter();
  filtreCos.type = "bandpass";
  filtreCos.frequency.value = 650;
  filtreCos.Q.value = 0.45;
  const gainCos = c.createGain();
  gainCos.gain.value = 0.07;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.35;
  const profunditat = c.createGain();
  profunditat.gain.value = 0.02;
  lfo.connect(profunditat).connect(gainCos.gain);
  cos.connect(filtreCos).connect(gainCos).connect(mestre);

  // Xiscle d'escuma: soroll agut, fluix.
  const escuma = fontSoroll(c, true);
  const filtreEscuma = c.createBiquadFilter();
  filtreEscuma.type = "highpass";
  filtreEscuma.frequency.value = 3000;
  const gainEscuma = c.createGain();
  gainEscuma.gain.value = 0.016;
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
  bufferRugit = null;
  bufferPassos = null;
  passos = null;
  void context?.close().catch(() => {});
  context = null;
  mestre = null;
  soroll = null;
}

export function silenciarAigua(si: boolean) {
  silenciat = si;
  if (mestre) mestre.gain.value = si ? 0 : 1;
}

/** Reserva si l'MP3 no ha arribat: un so greu amb vibrat i grunyit, filtrat per formants, d'uns 2,3 s. */
function rugitSintetic() {
  const c = context;
  if (!c || !mestre || !soroll) return;
  const t = c.currentTime;
  const durada = 2.3;

  // Veu: dues dents de serra (una octava a part) que pugen i baixen de to, amb vibrat.
  const to = (osc: OscillatorNode, f: number) => {
    osc.frequency.setValueAtTime(f * 0.8, t);
    osc.frequency.linearRampToValueAtTime(f * 1.45, t + 0.5);
    osc.frequency.linearRampToValueAtTime(f * 1.15, t + 1.5);
    osc.frequency.linearRampToValueAtTime(f * 0.6, t + durada);
  };
  const voc = c.createGain();
  voc.gain.value = 0.5;
  const fonts: OscillatorNode[] = [];
  for (const f of [78, 156]) {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    to(osc, f);
    osc.connect(voc);
    fonts.push(osc);
  }
  const vibrat = c.createOscillator();
  vibrat.frequency.value = 17;
  const profunditat = c.createGain();
  profunditat.gain.value = 9;
  vibrat.connect(profunditat);
  for (const osc of fonts) profunditat.connect(osc.frequency);

  // Grunyit: soroll a banda mitjana tallat a ritme.
  const gr = fontSoroll(c, true);
  const filtreGr = c.createBiquadFilter();
  filtreGr.type = "bandpass";
  filtreGr.frequency.value = 520;
  filtreGr.Q.value = 0.8;
  const gainGr = c.createGain();
  gainGr.gain.value = 0.45;
  const tall = c.createOscillator();
  tall.frequency.value = 29;
  const tallProf = c.createGain();
  tallProf.gain.value = 0.35;
  tall.connect(tallProf).connect(gainGr.gain);
  gr.connect(filtreGr).connect(gainGr);

  // Formants de la gola.
  const sortida = c.createGain();
  sortida.gain.setValueAtTime(0.0001, t);
  sortida.gain.exponentialRampToValueAtTime(0.9, t + 0.14);
  sortida.gain.setValueAtTime(0.9, t + 1.5);
  sortida.gain.exponentialRampToValueAtTime(0.0001, t + durada);
  for (const [fq, q, g] of [
    [620, 4, 1.0],
    [1150, 5, 0.6],
    [190, 1.5, 0.9],
  ] as const) {
    const filtre = c.createBiquadFilter();
    filtre.type = "bandpass";
    filtre.frequency.value = fq;
    filtre.Q.value = q;
    const gain = c.createGain();
    gain.gain.value = g;
    voc.connect(filtre);
    gainGr.connect(filtre);
    filtre.connect(gain).connect(sortida);
  }
  sortida.connect(mestre);

  for (const font of [...fonts, vibrat, tall]) {
    font.start(t);
    font.stop(t + durada + 0.05);
  }
  gr.start(t, Math.random(), durada);
}

/** L'onada gegant que s'aixeca: un retruny greu que creix durant uns 3,5 s. */
export function onadaLleo() {
  const c = context;
  if (!c || !mestre || !soroll) return;
  const t = c.currentTime;
  const font = fontSoroll(c, true);
  const filtre = c.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.setValueAtTime(180, t);
  filtre.frequency.exponentialRampToValueAtTime(900, t + 3.4);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.7, t + 3.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 4.2);
  font.connect(filtre).connect(gain).connect(mestre);
  font.start(t, Math.random());
  font.stop(t + 4.3);
}

/** El lleó es desfà en aigua: una onada greu i una pluja d'esquitxades. */
export function desferLleo() {
  const c = context;
  if (!c || !mestre || !soroll) return;
  const t = c.currentTime;
  const font = fontSoroll(c, false);
  const filtre = c.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.setValueAtTime(2400, t);
  filtre.frequency.exponentialRampToValueAtTime(300, t + 2.4);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.55, t + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
  font.connect(filtre).connect(gain).connect(mestre);
  font.start(t, Math.random(), 2.7);
  for (let i = 0; i < 12; i++) setTimeout(esquitxada, i * 170 + Math.random() * 120);
}

/** Baixa i descodifica el rugit gravat (2,7 s) perquè soni sense retard quan toqui. */
async function carregaRugit(c: AudioContext) {
  try {
    const resposta = await fetch("/audio/rugit-lleo.mp3");
    const buffer = await c.decodeAudioData(await resposta.arrayBuffer());
    if (c === context) bufferRugit = buffer;
  } catch {
    // Sense l'MP3, el rugit és el sintètic.
  }
}

/** El rugit del lleó d'aigua: l'MP3 gravat o, si encara no s'ha baixat, un de sintetitzat. */
export function rugitLleo() {
  const c = context;
  if (!c || !mestre) return;
  if (!bufferRugit) {
    rugitSintetic();
    return;
  }
  const font = c.createBufferSource();
  font.buffer = bufferRugit;
  const gain = c.createGain();
  gain.gain.value = 0.9;
  font.connect(gain).connect(mestre);
  font.start();
}

/** Baixa i descodifica les passes a l'aigua (40 s) per al caminar del lleó. */
async function carregaPassos(c: AudioContext) {
  try {
    const resposta = await fetch("/audio/passes-aigua-lleo.mp3");
    const buffer = await c.decodeAudioData(await resposta.arrayBuffer());
    if (c === context) bufferPassos = buffer;
  } catch {
    // Sense l'MP3, el lleó camina en silenci.
  }
}

/**
 * Les passes del lleó pel riu. `volum` (0-1) s'ha de cridar cada quadre: puja amb la proximitat i, a 0, l'so
 * s'esvaeix i s'atura. Una sola passada de l'enregistrament, una mica més greu (és un gegant).
 */
export function passesLleo(volum: number) {
  const c = context;
  if (!c || !mestre) return;
  if (volum > 0.01 && !passos && bufferPassos) {
    const font = c.createBufferSource();
    font.buffer = bufferPassos;
    font.playbackRate.value = 0.8;
    const gain = c.createGain();
    gain.gain.value = 0;
    font.connect(gain).connect(mestre);
    font.start(0, 0.8);
    passos = { font, gain };
  }
  if (!passos) return;
  if (volum > 0.01) {
    passos.gain.gain.setTargetAtTime(volum, c.currentTime, 0.15);
  } else {
    const { font, gain } = passos;
    passos = null;
    gain.gain.setTargetAtTime(0, c.currentTime, 0.12);
    try {
      font.stop(c.currentTime + 0.6);
    } catch {
      // Ja parat.
    }
  }
}
