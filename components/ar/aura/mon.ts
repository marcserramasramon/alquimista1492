import type { Mirada } from "@/lib/orientacio";

/**
 * Món de l'aura: llumetes daurades que s'enlairen a poc a poc, pols de llum en suspensió a prop del
 * jugador i, al fons, una columna de llum que puja cap al cel. Es dibuixa en 2D (partícules additives)
 * projectant punts del món sobre la pantalla segons la brúixola i la inclinació del mòbil. Res d'aquí
 * és una solució ni toca la partida.
 *
 * Món: x = est, y = amunt, z = nord (metres). El jugador és a (0, ALCADA_ULLS, 0).
 */

const RAD = Math.PI / 180;
const ALCADA_ULLS = 1.5;
/** Camp de visió horitzontal que s'assumeix (el mateix que els altres extres). */
export const FOV_HORITZONTAL = 52;

const PARTICULES_MAX = 900;
const LLUMETES = 38;
const POLS = 70;
/** Cada quants segons sona un pols d'energia (coincideix amb els anells del contorn). */
const PERIODE_PULS = 3.8;
/** Distància de la columna de llum (m) i alçada que arriba a omplir (m). */
const DIST_COLUMNA = 55;

type Tipus = "llumeta" | "pols" | "columna";

interface Particula {
  tipus: Tipus;
  e: number;
  u: number;
  n: number;
  ve: number;
  vu: number;
  vn: number;
  vida: number;
  edat: number;
  mida: number;
  /** Fase del vaivé i del centelleig. */
  fase: number;
  /** Quin sprite fa servir (0 blanc, 1 daurat, 2 ambre, 3 violeta). */
  color: number;
}

export interface EsdevenimentPuls {
  /** Sempre al centre: el pols és de tot l'entorn. */
  pan: number;
}

/** Respiració lenta de l'aura (0-1), amb un cicle d'uns 5 segons. */
export function respiracio(ara: number): number {
  return 0.5 + 0.5 * Math.sin((ara / 5000) * Math.PI * 2);
}

function alea(a: number, b: number) {
  return a + Math.random() * (b - a);
}

/** Un orb de llum: centre blanc, cos daurat i vora càlida que s'esvaeix. */
function crearSprite(nucli: string, cos: string, vora: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  if (g) {
    const degradat = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    degradat.addColorStop(0, nucli);
    degradat.addColorStop(0.2, cos);
    degradat.addColorStop(0.55, vora);
    degradat.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = degradat;
    g.fillRect(0, 0, 64, 64);
  }
  return c;
}

export class MonAura {
  private readonly parts: Particula[] = [];
  private readonly sprites: HTMLCanvasElement[];
  private readonly alEsdeveniment: (e: EsdevenimentPuls) => void;
  /** Rumb (graus) de la columna de llum: es tria en començar i no es mou. */
  private readonly rumbColumna = alea(0, 360);
  private proximPuls = PERIODE_PULS;
  private f = 1;

  constructor(alEsdeveniment: (e: EsdevenimentPuls) => void) {
    this.alEsdeveniment = alEsdeveniment;
    this.sprites = [
      crearSprite("rgba(255,255,248,1)", "rgba(255,246,210,0.9)", "rgba(255,225,150,0.3)"),
      crearSprite("rgba(255,244,196,1)", "rgba(255,212,100,0.85)", "rgba(255,170,40,0.28)"),
      crearSprite("rgba(255,214,120,0.95)", "rgba(255,170,50,0.7)", "rgba(220,110,10,0.22)"),
      crearSprite("rgba(245,240,255,1)", "rgba(190,175,255,0.75)", "rgba(130,110,230,0.22)"),
    ];
    // Les llumetes ja hi són des del primer moment, a mitja vida, perquè no surtin totes alhora.
    for (let i = 0; i < LLUMETES; i++) this.novaLlumeta(0, Math.random());
  }

  private novaLlumeta(rumbMirada: number, edatInicial = 0) {
    // Sovint cap on mira el jugador, perquè les vegi; de tant en tant al voltant.
    const rumb = (Math.random() < 0.6 ? rumbMirada + alea(-45, 45) : alea(0, 360)) * RAD;
    const dist = alea(6, 34);
    const vida = alea(9, 15);
    const mida = alea(0.14, 0.3) * Math.max(1, dist / 12);
    this.parts.push({
      tipus: "llumeta",
      e: Math.sin(rumb) * dist,
      u: alea(0.1, 2.5),
      n: Math.cos(rumb) * dist,
      ve: 0,
      vu: alea(0.25, 0.8),
      vn: 0,
      vida,
      edat: edatInicial * vida,
      mida,
      fase: Math.random() * Math.PI * 2,
      color: Math.random() < 0.2 ? 0 : Math.random() < 0.15 ? 3 : 1,
    });
  }

  private nouPols() {
    const rumb = Math.random() * Math.PI * 2;
    const dist = alea(1.5, 8);
    this.parts.push({
      tipus: "pols",
      e: Math.sin(rumb) * dist,
      u: alea(0.1, 4),
      n: Math.cos(rumb) * dist,
      ve: alea(-0.06, 0.06),
      vu: alea(0.02, 0.14),
      vn: alea(-0.06, 0.06),
      vida: alea(6, 11),
      edat: 0,
      mida: alea(0.012, 0.03),
      fase: Math.random() * Math.PI * 2,
      color: Math.random() < 0.5 ? 0 : 1,
    });
  }

  private actualitza(dt: number, rumbMirada: number) {
    // Reposició de les llumetes i del pols fins al nombre previst.
    let llumetes = 0;
    let pols = 0;
    for (const p of this.parts) {
      if (p.tipus === "llumeta") llumetes++;
      else if (p.tipus === "pols") pols++;
    }
    if (this.parts.length < PARTICULES_MAX) {
      if (llumetes < LLUMETES && Math.random() < dt * 4) this.novaLlumeta(rumbMirada);
      if (pols < POLS && Math.random() < dt * 14) this.nouPols();
    }

    // Columna de llum al fons: raig de partícules que pugen des de terra.
    const nCol = Math.round(dt * 38 + Math.random());
    const rc = this.rumbColumna * RAD;
    for (let i = 0; i < nCol && this.parts.length < PARTICULES_MAX; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 1.8;
      this.parts.push({
        tipus: "columna",
        e: Math.sin(rc) * DIST_COLUMNA + Math.cos(a) * r,
        u: 0.2,
        n: Math.cos(rc) * DIST_COLUMNA + Math.sin(a) * r,
        ve: 0,
        vu: alea(7, 11),
        vn: 0,
        vida: alea(5, 8),
        edat: 0,
        mida: alea(1.2, 2.2),
        fase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.3 ? 0 : 1,
      });
    }

    // Pols d'energia periòdic: el contorn de la persona i el so van al mateix ritme.
    this.proximPuls -= dt;
    if (this.proximPuls <= 0) {
      this.proximPuls += PERIODE_PULS;
      this.alEsdeveniment({ pan: 0 });
    }

    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.edat += dt;
      if (p.edat >= p.vida) {
        this.parts[i] = this.parts[this.parts.length - 1];
        this.parts.pop();
        continue;
      }
      if (p.tipus === "llumeta") {
        // Vaivé suau mentre s'enlaira.
        p.ve = Math.sin(p.edat * 0.9 + p.fase) * 0.35;
        p.vn = Math.cos(p.edat * 0.7 + p.fase) * 0.35;
      }
      p.e += p.ve * dt;
      p.u += p.vu * dt;
      p.n += p.vn * dt;
    }
  }

  /** Dibuixa l'estat actual sobre el context (ja netejat) i avança la simulació `dt` segons. */
  pinta(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number, mirada: Mirada, ara: number) {
    this.actualitza(dt, mirada.rumb);
    const rumb = mirada.rumb * RAD;
    const elev = mirada.elevacio * RAD;
    this.f = w / 2 / Math.tan((FOV_HORITZONTAL * RAD) / 2);

    const sr = Math.sin(rumb);
    const cr = Math.cos(rumb);
    const se = Math.sin(elev);
    const ce = Math.cos(elev);
    const respira = respiracio(ara);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.parts) {
      // Món -> càmera: avant, dreta i amunt segons la mirada (primer rumb, després inclinació).
      const re = p.e;
      const ru = p.u - ALCADA_ULLS;
      const rn = p.n;
      const zc = re * sr * ce + ru * se + rn * cr * ce;
      if (zc < 0.4) continue;
      const xc = re * cr - rn * sr;
      const yc = -re * sr * se + ru * ce - rn * cr * se;
      const sx = w / 2 + (this.f * xc) / zc;
      const sy = h / 2 - (this.f * yc) / zc;
      const radi = (p.mida * this.f) / zc;
      if (sx < -radi || sx > w + radi || sy < -radi || sy > h + radi) continue;
      const k = p.edat / p.vida;
      // Entren i surten amb un fos suau; les llumetes i el pols brillen a poc a poc.
      const entra = Math.min(1, k / 0.15);
      const surt = Math.min(1, (1 - k) / 0.3);
      let alfa = entra * surt;
      if (p.tipus === "columna") alfa *= 0.3 * (1 - k * 0.6);
      else alfa *= 0.55 + 0.45 * Math.sin(p.edat * 2.2 + p.fase) * (0.6 + 0.4 * respira);
      if (alfa <= 0.01) continue;
      ctx.globalAlpha = Math.min(1, alfa);
      const mida = p.tipus === "columna" ? radi * (1 + k) : radi * 1.6;
      ctx.drawImage(this.sprites[p.color], sx - mida, sy - mida, mida * 2, mida * 2);
    }

    // Llum càlida suau que respira damunt tota la imatge (com un lleu «bloom»).
    ctx.globalAlpha = 0.05 + 0.05 * respira;
    const brillo = ctx.createRadialGradient(w / 2, h * 0.75, 0, w / 2, h * 0.75, h * 0.9);
    brillo.addColorStop(0, "rgba(255,215,130,1)");
    brillo.addColorStop(1, "rgba(255,215,130,0)");
    ctx.fillStyle = brillo;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
