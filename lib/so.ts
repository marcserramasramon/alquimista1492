"use client";

/**
 * So d'arribada a una fita, sintetitzat amb Web Audio (sense cap fitxer).
 *
 * Els navegadors no deixen sonar res fins que l'usuari ha tocat la pàgina:
 * `desbloquejarSo` s'ha de cridar des d'un gest (el primer toc al hub). Amb
 * el mòbil bloquejat el navegador congela la pàgina i no sona res; sonarà
 * quan el tornin a obrir i el GPS els situï a la fita.
 */

let context: AudioContext | null = null;

function obtenirContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  return context;
}

export function desbloquejarSo() {
  const ctx = obtenirContext();
  if (ctx && ctx.state !== "running") ctx.resume().catch(() => {});
}

/** Tres notes ascendents, com una campaneta, i una vibració (on n'hi ha: Android). */
export function sonarArribada() {
  try {
    navigator.vibrate?.([200, 100, 200, 100, 400]);
  } catch {
    // Alguns navegadors llancen si no hi ha hagut cap gest.
  }

  const ctx = obtenirContext();
  if (!ctx) return;
  ctx.resume().catch(() => {});
  const inici = ctx.currentTime + 0.05;
  [659.25, 783.99, 1046.5].forEach((freq, i) => {
    const t = inici + i * 0.18;
    const osc = ctx.createOscillator();
    const guany = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    guany.gain.setValueAtTime(0.0001, t);
    guany.gain.exponentialRampToValueAtTime(0.6, t + 0.02);
    guany.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(guany).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1);
  });
}
