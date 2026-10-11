"use client";

/**
 * Les passes de l'extra de realitat augmentada: uns peus que s'acosten pel camí abans que
 * aparegui la figura. Sonen amb la gravació real (public/audio/ar/passes-grava.mp3, «footsteps on
 * gravel and tuff» de lesiakower, Pixabay) i, si no es pot carregar, amb passes sintetitzades.
 * Van pujant de volum i amb una mica d'estèreo, perquè se senti pel costat des d'on vindrà. No hi
 * ha cap altre so. Només comença quan l'usuari toca el
 * botó d'entrada (els navegadors mòbils no deixen sonar abans) i s'atura en sortir.
 */

let context: AudioContext | null = null;
let soroll: AudioBuffer | null = null;
let gravacio: AudioBuffer | null = null;

const URL_PASSES = "/audio/ar/passes-grava.mp3";

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

/** Soroll blanc breu, compartit per totes les passes. */
function bufferSoroll(ctx: AudioContext): AudioBuffer {
  if (soroll) return soroll;
  const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.25), ctx.sampleRate);
  const dades = buffer.getChannelData(0);
  for (let i = 0; i < dades.length; i++) dades[i] = Math.random() * 2 - 1;
  soroll = buffer;
  return buffer;
}

/** Prepara el so. S'ha de cridar dins d'un gest de l'usuari. */
export function iniciarSoAr() {
  const ctx = obtenirContext();
  if (!ctx) return;
  ctx.resume().catch(() => {});
  // Carrega i descodifica la gravació de passes; si falla, sonaran les sintetitzades.
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
  context?.close().catch(() => {});
  context = null;
  soroll = null;
  gravacio = null;
}

/**
 * La gravació de passes durant `duradaMs`: si és més curta, es repeteix amb un petit solapament;
 * puja de volum i es va centrant, com algú que s'acosta, i s'esvaeix al final.
 */
function sonarGravacio(ctx: AudioContext, buffer: AudioBuffer, pan: number, duradaMs: number) {
  const dur = duradaMs / 1000;
  const t0 = ctx.currentTime + 0.05;

  const mestre = ctx.createGain();
  mestre.gain.setValueAtTime(0.15, t0);
  mestre.gain.linearRampToValueAtTime(1, t0 + dur * 0.85);
  mestre.gain.setValueAtTime(1, t0 + dur - 0.01);
  mestre.gain.linearRampToValueAtTime(0.0001, t0 + dur + 0.4);
  if (typeof ctx.createStereoPanner === "function") {
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, t0);
    panner.pan.linearRampToValueAtTime(pan * 0.4, t0 + dur);
    mestre.connect(panner).connect(ctx.destination);
  } else {
    mestre.connect(ctx.destination);
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
    font.connect(g).connect(mestre);
    font.start(t);
    font.stop(t + buffer.duration);
  }
}

/**
 * Passes de qui s'acosta caminant durant `duradaMs`: cada pas és un copet greu i un cruixit de
 * terra, i van pujant de volum. `pan` va de -1 (esquerra) a 1 (dreta).
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
    const volum = 0.1 + 0.5 * (i / (passos - 1));

    const sortida = ctx.createGain();
    sortida.gain.value = 1;
    if (typeof ctx.createStereoPanner === "function") {
      const panner = ctx.createStereoPanner();
      // Un peu cada cop una mica més cap al centre: s'acosta.
      panner.pan.value = pan * (1 - 0.5 * (i / (passos - 1)));
      sortida.connect(panner).connect(ctx.destination);
    } else {
      sortida.connect(ctx.destination);
    }

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
    font.connect(filtre).connect(gc).connect(sortida);
    font.start(t);
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
    cop.connect(gp).connect(sortida);
    cop.start(t);
    cop.stop(t + 0.18);
  }
}
