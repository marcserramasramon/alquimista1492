import type { Mirada } from "@/lib/orientacio";

/**
 * Món del foc: arcs de flames que surten de terra i hi tornen a entrar, com els salts dels dofins,
 * al voltant del jugador. Es dibuixa en 2D (partícules additives) projectant punts del món sobre la
 * pantalla segons la brúixola i la inclinació del mòbil. Res d'aquí és una solució ni toca la partida.
 *
 * Món: x = est, y = amunt, z = nord (metres). El jugador és a (0, ALCADA_ULLS, 0).
 */

const RAD = Math.PI / 180;
const ALCADA_ULLS = 1.5;
/** Camp de visió horitzontal que s'assumeix (el mateix que l'extra de les ànimes). */
export const FOV_HORITZONTAL = 52;

/** Arcs que hi ha alhora i marge de temps entre un salt i el següent (s). */
const ARCS_MAX = 4;
const ESPERA_MIN = 0.6;
const ESPERA_MAX = 1.5;
/** Partícules màximes (mòbils modestos). */
const PARTICULES_MAX = 850;
/** Temps que el rastre de l'arc encara es veu quan el cap ja ha tornat a terra (s). */
const REMANENT = 1.5;

interface Arc {
  /** Punt d'entrada a terra i vector cap al punt de sortida (est, nord). */
  e0: number;
  n0: number;
  de: number;
  dn: number;
  alt: number;
  dur: number;
  t: number;
  /** Ja ha fet l'esquitxada d'entrada / de sortida. */
  entrat: boolean;
  sortit: boolean;
}

interface Particula {
  e: number;
  u: number;
  n: number;
  ve: number;
  vu: number;
  vn: number;
  vida: number;
  edat: number;
  mida: number;
}

export interface EsdevenimentSalt {
  /** Cap on és l'arc respecte d'on mira la càmera: -1 (esquerra) a 1 (dreta). */
  pan: number;
}

function alea(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function diferenciaAngle(a: number, b: number) {
  return ((a - b + 540) % 360) - 180;
}

/** Una flama petita: centre blanc-groc, cos taronja i vora vermella que s'esvaeix. */
function crearSprite(nucli: string, cos: string, vora: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  if (g) {
    const degradat = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    degradat.addColorStop(0, nucli);
    degradat.addColorStop(0.35, cos);
    degradat.addColorStop(0.75, vora);
    degradat.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = degradat;
    g.fillRect(0, 0, 64, 64);
  }
  return c;
}

export class MonFoc {
  private readonly arcs: Arc[] = [];
  private readonly parts: Particula[] = [];
  private readonly sprites: HTMLCanvasElement[];
  private espera = 0.3;
  private alEsdeveniment: (e: EsdevenimentSalt) => void;
  // Càmera de la imatge actual.
  private rumb = 0;
  private elev = 0;
  private w = 1;
  private h = 1;
  private f = 1;

  constructor(alEsdeveniment: (e: EsdevenimentSalt) => void) {
    this.alEsdeveniment = alEsdeveniment;
    this.sprites = [
      crearSprite("rgba(255,255,235,1)", "rgba(255,225,120,0.95)", "rgba(255,150,30,0.45)"),
      crearSprite("rgba(255,210,110,0.95)", "rgba(255,120,20,0.85)", "rgba(220,40,0,0.4)"),
      crearSprite("rgba(255,110,40,0.8)", "rgba(200,30,0,0.65)", "rgba(110,0,0,0.3)"),
    ];
  }

  private nouArc(rumbMirada: number) {
    // Sovint cap on mira el jugador, perquè els vegi; de tant en tant al voltant.
    const rumbCentre = (Math.random() < 0.7 ? rumbMirada + alea(-55, 55) : alea(0, 360)) * RAD;
    const dist = alea(5, 13);
    const ce = Math.sin(rumbCentre) * dist;
    const cn = Math.cos(rumbCentre) * dist;
    // Direcció del salt: aproximadament perpendicular a la visual, amb una mica de biaix.
    const dir = rumbCentre + Math.PI / 2 + alea(-0.6, 0.6);
    const mig = alea(1.6, 2.8);
    const alt = alea(1.8, 3.2);
    const arc: Arc = {
      e0: ce - Math.sin(dir) * mig,
      n0: cn - Math.cos(dir) * mig,
      de: Math.sin(dir) * mig * 2,
      dn: Math.cos(dir) * mig * 2,
      alt,
      dur: alea(1.5, 2.1),
      t: 0,
      entrat: false,
      sortit: false,
    };
    this.arcs.push(arc);
    // Pan segons on cau respecte de la càmera.
    const dif = diferenciaAngle(rumbCentre / RAD, rumbMirada);
    this.alEsdeveniment({ pan: Math.max(-1, Math.min(1, dif / 70)) });
  }

  private pos(arc: Arc, u: number) {
    return { e: arc.e0 + arc.de * u, u: 4 * arc.alt * u * (1 - u), n: arc.n0 + arc.dn * u };
  }

  private emet(e: number, u: number, n: number, ve: number, vu: number, vn: number, vida: number, mida: number) {
    if (this.parts.length >= PARTICULES_MAX) return;
    this.parts.push({ e, u, n, ve, vu, vn, vida, edat: 0, mida });
  }

  private esquitxada(e: number, n: number) {
    for (let i = 0; i < 28; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = alea(0.6, 2.6);
      this.emet(e, 0.05, n, Math.cos(a) * v, alea(1, 3.8), Math.sin(a) * v, alea(0.5, 1.1), alea(0.12, 0.3));
    }
  }

  private actualitza(dt: number, rumbMirada: number) {
    this.espera -= dt;
    if (this.espera <= 0 && this.arcs.length < ARCS_MAX) {
      this.nouArc(rumbMirada);
      this.espera = alea(ESPERA_MIN, ESPERA_MAX);
    }

    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const arc = this.arcs[i];
      arc.t += dt;
      const u = Math.min(1, arc.t / arc.dur);
      if (!arc.entrat) {
        arc.entrat = true;
        this.esquitxada(arc.e0, arc.n0);
      }
      if (arc.t < arc.dur) {
        // El cap de l'arc: flames denses que es queden al rastre.
        const p = this.pos(arc, u);
        const n = Math.max(1, Math.round(dt * 110));
        for (let k = 0; k < n; k++) {
          this.emet(
            p.e + alea(-0.12, 0.12),
            p.u + alea(-0.08, 0.12),
            p.n + alea(-0.12, 0.12),
            alea(-0.15, 0.15),
            alea(0.1, 0.5),
            alea(-0.15, 0.15),
            alea(0.9, 1.5),
            alea(0.3, 0.5),
          );
        }
      } else if (!arc.sortit) {
        arc.sortit = true;
        this.esquitxada(arc.e0 + arc.de, arc.n0 + arc.dn);
      }
      // Flames a terra, als dos punts de l'arc, mentre dura.
      if (arc.t < arc.dur + REMANENT * 0.5) {
        const extrems = arc.t < 0.25 ? [0] : arc.t > arc.dur - 0.1 ? [0, 1] : [0];
        for (const x of extrems) {
          if (Math.random() < dt * 30) {
            this.emet(
              arc.e0 + arc.de * x + alea(-0.2, 0.2),
              0.05,
              arc.n0 + arc.dn * x + alea(-0.2, 0.2),
              alea(-0.1, 0.1),
              alea(0.7, 1.4),
              alea(-0.1, 0.1),
              alea(0.5, 0.9),
              alea(0.25, 0.45),
            );
          }
        }
      }
      if (arc.t > arc.dur + REMANENT) this.arcs.splice(i, 1);
    }

    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.edat += dt;
      if (p.edat >= p.vida) {
        this.parts[i] = this.parts[this.parts.length - 1];
        this.parts.pop();
        continue;
      }
      p.e += p.ve * dt;
      p.u += p.vu * dt;
      p.n += p.vn * dt;
      p.vu -= dt * 0.6;
      if (p.u < 0.02) {
        p.u = 0.02;
        p.vu = Math.abs(p.vu) * 0.3;
      }
    }
  }

  /** Dibuixa l'estat actual sobre el context (ja netejat) i avança la simulació `dt` segons. */
  pinta(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number, mirada: Mirada) {
    this.actualitza(dt, mirada.rumb);
    this.rumb = mirada.rumb * RAD;
    this.elev = mirada.elevacio * RAD;
    this.w = w;
    this.h = h;
    this.f = w / 2 / Math.tan((FOV_HORITZONTAL * RAD) / 2);

    const sr = Math.sin(this.rumb);
    const cr = Math.cos(this.rumb);
    const se = Math.sin(this.elev);
    const ce = Math.cos(this.elev);
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
      const sprite = this.sprites[k < 0.25 ? 0 : k < 0.6 ? 1 : 2];
      ctx.globalAlpha = Math.min(1, (1 - k) * 1.5);
      const mida = radi * (1.5 - k * 0.7);
      ctx.drawImage(sprite, sx - mida, sy - mida, mida * 2, mida * 2);
    }
    ctx.restore();
  }
}
