/** Sons del prototip «La Conjunció dels Astres» (fitxers a public/audio/conjuncio). Web Audio, com la resta d'efectes. */

const BASE = "/audio/conjuncio/";
const AMBIENTS = [
  { nom: "atmosfera-fosca.mp3", volum: 0.3 },
  { nom: "campanes-catedral.mp3", volum: 0.2 },
];
const DURADA_AMBIENT = 5;
const FADE_AMBIENT = 1;

let ctx: AudioContext | null = null;
const cache = new Map<string, Promise<AudioBuffer>>();

function obtenirCtx(): AudioContext | null {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function carregar(nom: string, c: AudioContext): Promise<AudioBuffer> {
  let p = cache.get(nom);
  if (!p) {
    p = fetch(BASE + nom)
      .then((r) => r.arrayBuffer())
      .then((b) => c.decodeAudioData(b));
    cache.set(nom, p);
  }
  return p;
}

interface OpcionsTocar {
  volum?: number;
  inici?: number;
  durada?: number;
  fade?: number;
}

function tocar(nom: string, opcions: OpcionsTocar = {}) {
  const c = obtenirCtx();
  if (!c) return;
  carregar(nom, c)
    .then((buf) => {
      const t0 = c.currentTime;
      const volum = opcions.volum ?? 1;
      const durada = opcions.durada ?? buf.duration;
      const fade = opcions.fade ?? 0;
      const guany = c.createGain();
      guany.connect(c.destination);
      if (fade > 0) {
        guany.gain.setValueAtTime(0, t0);
        guany.gain.linearRampToValueAtTime(volum, t0 + fade);
        guany.gain.setValueAtTime(volum, t0 + durada - fade);
        guany.gain.linearRampToValueAtTime(0, t0 + durada);
      } else {
        guany.gain.setValueAtTime(volum, t0);
      }
      const font = c.createBufferSource();
      font.buffer = buf;
      font.connect(guany);
      font.start(t0, opcions.inici ?? 0, durada);
    })
    .catch(() => {});
}

/** Click de botó. */
export function sonTocBoto() {
  tocar("toc-boto.mp3");
}

/** Una estrella encaixada (lock). */
export function sonEstrellaEncaixada() {
  tocar("estrella-encaixada.mp3", { volum: 0.8 });
}

/** Les cinc estrelles encaixades. */
export function sonAconseguit() {
  tocar("aconseguit-final.mp3");
}

export interface Carrega {
  /** Proximitat a l'estrella (0 a 1): el volum és proporcional a aquesta distància. */
  progres: (p: number) => void;
  aturar: () => void;
}

/** Nota de cada canal (aigua, foc, terra, aire, ànima): pentatònica, com les estrelles. */
const NOTES_CARREGA = [293.66, 329.63, 392, 440, 523.25];

/** Nota generada (oscil·lador) del canal: el volum varia amb la distància a l'estrella (màx. 40 %). */
export function iniciarCarregaLock(canal: number, volumMax = 0.2): Carrega {
  const c = obtenirCtx();
  if (!c) return { progres: () => {}, aturar: () => {} };
  const guany = c.createGain();
  guany.gain.value = 0;
  guany.connect(c.destination);
  const oscil = c.createOscillator();
  oscil.type = "sine";
  oscil.frequency.value = NOTES_CARREGA[canal] ?? 440;
  oscil.connect(guany);
  oscil.start();
  let parat = false;
  return {
    progres(p) {
      if (!parat) guany.gain.setTargetAtTime(volumMax * p, c.currentTime, 0.05);
    },
    aturar() {
      if (parat) return;
      parat = true;
      guany.gain.setTargetAtTime(0, c.currentTime, 0.03);
      oscil.stop(c.currentTime + 0.2);
    },
  };
}

/** Música d'inici de l'AR: una sola vegada, en començar a apuntar al cel. */
export function sonMusicaInici(volum = 0.25) {
  tocar("musica-final-stand.mp3", { volum });
}

/** Ambient: 5 s d'un dels fons, al 30 % del volum, amb fade d'entrada i de sortida, des d'un punt aleatori. */
export function sonAmbient() {
  const c = obtenirCtx();
  if (!c) return;
  const ambient = AMBIENTS[Math.floor(Math.random() * AMBIENTS.length)];
  carregar(ambient.nom, c)
    .then((buf) => {
      const inici = Math.random() * Math.max(0, buf.duration - DURADA_AMBIENT);
      tocar(ambient.nom, { volum: ambient.volum, inici, durada: DURADA_AMBIENT, fade: FADE_AMBIENT });
    })
    .catch(() => {});
}
