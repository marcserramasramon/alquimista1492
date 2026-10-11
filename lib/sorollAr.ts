"use client";

/**
 * Les passes de l'extra de realitat augmentada: uns peus que s'acosten pel camí abans que
 * aparegui la figura. Sintetitzades amb Web Audio (sense fitxers) i amb una mica d'estèreo, perquè
 * se senti pel costat des d'on vindrà. No hi ha cap altre so. Només comença quan l'usuari toca el
 * botó d'entrada (els navegadors mòbils no deixen sonar abans) i s'atura en sortir.
 */

let context: AudioContext | null = null;
let soroll: AudioBuffer | null = null;

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
  obtenirContext()
    ?.resume()
    .catch(() => {});
}

export function aturarSoAr() {
  context?.close().catch(() => {});
  context = null;
  soroll = null;
}

/**
 * Passes de qui s'acosta caminant durant `duradaMs`: cada pas és un copet greu i un cruixit de
 * terra, i van pujant de volum. `pan` va de -1 (esquerra) a 1 (dreta).
 */
export function sonarPassesAr(pan: number, duradaMs: number) {
  const ctx = obtenirContext();
  if (!ctx || ctx.state !== "running") return;
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
