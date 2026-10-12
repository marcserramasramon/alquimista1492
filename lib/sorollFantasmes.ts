"use client";

/**
 * So de l'extra de les ànimes (fantasmes), amb gravacions de public/audio/ar/fantasmes/
 * (dragon-studio i freesound_community, via Pixabay):
 * - **Fons**: els tres àudios llargs (uns 13 s, 22 s i 1 min 30 s) sonen un darrere l'altre,
 *   amb fosos entre ells, a un volum màxim del 20 %. Es llegeixen en streaming (element
 *   d'àudio) perquè el de 1 min 30 s descodificat ocuparia molta memòria al mòbil.
 * - **Curts**: els cinc àudios curts s'alternen (mai el mateix dos cops seguits) quan el jugador
 *   enfoca un fantasma de prop o un fantasma s'acosta. Mai més d'un cada pocs segons.
 * Tot passa per un volum mestre que es pot silenciar. Només comença quan l'usuari toca el botó
 * d'entrada (els navegadors mòbils no deixen sonar abans).
 */

const BASE = "/audio/ar/fantasmes/";
const FONS = ["fons-veus.mp3", "fons-agut.mp3", "fons-fantasma.mp3"];
const CURTS = ["sospir.mp3", "trist.mp3", "xiuxiueig-llarg.mp3", "xiuxiueig-curt.mp3", "horror.mp3"];

/** Volum màxim dels fons (0-1) i dels sons curts. */
const VOLUM_FONS = 0.2;
const VOLUM_CURTS = 0.7;
/** Temps mínim entre dos sons curts (ms) i fos entre fons (s). */
const ENTRE_CURTS_MS = 5000;
const FOS_FONS_S = 3;

let context: AudioContext | null = null;
let mestre: GainNode | null = null;
let gFons: GainNode | null = null;
const buffers = new Map<string, AudioBuffer>();
let silenciat = false;
let actiu = false;
let cuaCurts: string[] = [];
let ultimCurt: string | null = null;
let ultimCurtT = 0;
let ordreFons: string[] = [];
let indexFons = 0;
const elementsFons = new Set<HTMLAudioElement>();

function barreja<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

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
      gFons = context.createGain();
      gFons.gain.value = VOLUM_FONS;
      gFons.connect(mestre);
    } catch {
      context = null;
      mestre = null;
      gFons = null;
      return null;
    }
  }
  return context;
}

/** Posa en marxa el fons: un àudio rere l'altre, amb un fos entre ells. */
function arrencaFons() {
  const ctx = context;
  if (!ctx || !gFons || !actiu) return;
  const nom = ordreFons[indexFons++ % ordreFons.length];
  const el = new Audio(BASE + nom);
  el.preload = "auto";
  elementsFons.add(el);
  let g: GainNode;
  try {
    const font = ctx.createMediaElementSource(el);
    g = ctx.createGain();
    g.gain.value = 0;
    font.connect(g).connect(gFons);
  } catch {
    elementsFons.delete(el);
    return;
  }
  g.gain.linearRampToValueAtTime(1, ctx.currentTime + FOS_FONS_S);
  let seguent = false;
  const alAcabar = () => {
    elementsFons.delete(el);
    el.pause();
  };
  el.ontimeupdate = () => {
    if (seguent || !isFinite(el.duration)) return;
    if (el.currentTime >= el.duration - FOS_FONS_S - 0.3) {
      seguent = true;
      g.gain.cancelScheduledValues(ctx.currentTime);
      g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + FOS_FONS_S);
      setTimeout(alAcabar, (FOS_FONS_S + 0.3) * 1000);
      arrencaFons();
    }
  };
  el.onended = alAcabar;
  el.play().catch(() => {
    elementsFons.delete(el);
  });
}

async function descodifica(nom: string): Promise<void> {
  const ctx = context;
  if (!ctx || buffers.has(nom)) return;
  try {
    const r = await fetch(BASE + nom);
    if (!r.ok) return;
    const buffer = await ctx.decodeAudioData(await r.arrayBuffer());
    buffers.set(nom, buffer);
  } catch {
    // Sense aquest so: els altres continuen.
  }
}

/** Prepara el so i engega el fons. S'ha de cridar dins d'un gest de l'usuari. */
export function iniciarSoFantasmes() {
  const ctx = obtenirContext();
  if (!ctx) return;
  ctx.resume().catch(() => {});
  actiu = true;
  ordreFons = barreja(FONS);
  indexFons = 0;
  cuaCurts = [];
  for (const nom of CURTS) void descodifica(nom);
  arrencaFons();
}

export function aturarSoFantasmes() {
  actiu = false;
  elementsFons.forEach((el) => {
    el.onended = null;
    el.ontimeupdate = null;
    el.pause();
    el.src = "";
  });
  elementsFons.clear();
  buffers.clear();
  context?.close().catch(() => {});
  context = null;
  mestre = null;
  gFons = null;
}

/** Silencia o torna a activar tot el so de l'extra. */
export function silenciarFantasmes(si: boolean) {
  silenciat = si;
  if (mestre && context) mestre.gain.setTargetAtTime(si ? 0 : 1, context.currentTime, 0.05);
}

/**
 * Fa sonar el següent so curt (s'alternen sense repetir-ne cap dos cops seguits), pel costat on és
 * el fantasma (`pan` de -1 a 1). Si n'ha sonat un fa poc, no fa res. Retorna si ha sonat.
 */
export function sonarFantasma(pan: number): boolean {
  const ctx = context;
  if (!ctx || !mestre || ctx.state !== "running") return false;
  const ara = performance.now();
  if (ara - ultimCurtT < ENTRE_CURTS_MS) return false;
  const disponibles = CURTS.filter((n) => buffers.has(n));
  if (!disponibles.length) return false;
  if (!cuaCurts.length) {
    cuaCurts = barreja(disponibles);
    // El primer de la nova tanda no pot ser el que acaba de sonar.
    if (cuaCurts.length > 1 && cuaCurts[0] === ultimCurt) cuaCurts.push(cuaCurts.shift() as string);
  }
  const nom = cuaCurts.shift() as string;
  const buffer = buffers.get(nom);
  if (!buffer) return false;
  ultimCurt = nom;
  ultimCurtT = ara;
  const font = ctx.createBufferSource();
  font.buffer = buffer;
  const g = ctx.createGain();
  g.gain.value = VOLUM_CURTS;
  font.connect(g);
  if (typeof ctx.createStereoPanner === "function") {
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    g.connect(panner).connect(mestre);
  } else {
    g.connect(mestre);
  }
  font.start();
  return true;
}
