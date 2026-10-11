"use client";

/**
 * Micròfon de l'extra de realitat augmentada: només mesura el volum (res es grava, no s'envia enlloc
 * ni es guarda) perquè la figura s'espanti quan el jugador crida. Cal demanar-lo dins d'un gest de
 * l'usuari. Si no hi ha micròfon o es denega el permís, `iniciarMicroAr` retorna fals i l'extra
 * ofereix un botó per cridar en el seu lloc.
 */

let flux: MediaStream | null = null;
let context: AudioContext | null = null;
let analitzador: AnalyserNode | null = null;
let mostres: Float32Array<ArrayBuffer> | null = null;

export async function iniciarMicroAr(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return false;
  try {
    // Sense supressió de soroll ni control automàtic de guany: un crit ha de ser més fort que la resta.
    flux = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      video: false,
    });
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error("sense Web Audio");
    context = new Ctor();
    await context.resume().catch(() => {});
    analitzador = context.createAnalyser();
    analitzador.fftSize = 1024;
    // L'analitzador no es connecta a la sortida: el micròfon no es reprodueix mai.
    context.createMediaStreamSource(flux).connect(analitzador);
    mostres = new Float32Array(analitzador.fftSize);
    return true;
  } catch {
    aturarMicroAr();
    return false;
  }
}

/** Volum actual del micròfon (RMS, 0-1 aproximadament). 0 si no està actiu. */
export function nivellMicroAr(): number {
  if (!analitzador || !mostres) return 0;
  analitzador.getFloatTimeDomainData(mostres);
  let suma = 0;
  for (let i = 0; i < mostres.length; i++) suma += mostres[i] * mostres[i];
  return Math.sqrt(suma / mostres.length);
}

export function aturarMicroAr() {
  flux?.getTracks().forEach((t) => t.stop());
  flux = null;
  context?.close().catch(() => {});
  context = null;
  analitzador = null;
  mostres = null;
}
