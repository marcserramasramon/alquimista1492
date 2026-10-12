import type { Mirada } from "@/lib/orientacio";

/**
 * Món de l'aigua: uns ràpids de riu que passen pels peus del jugador. Es dibuixa en 2D projectant
 * punts del terra sobre la pantalla segons la brúixola i la inclinació del mòbil: un vel blau sobre el
 * terra, ratlles d'escuma que corren en un sentit fix, roques amb escuma al voltant i gotes que
 * esquitxen. Res d'aquí és una solució ni toca la partida.
 *
 * Món: x = est, y = amunt, z = nord (metres). El jugador és a (0, ALCADA_ULLS, 0).
 */

const RAD = Math.PI / 180;
const ALCADA_ULLS = 1.5;
/** Camp de visió horitzontal que s'assumeix (el mateix que la resta d'extres d'AR). */
export const FOV_HORITZONTAL = 52;

/** Ratlles d'escuma i gotes màximes (mòbils modestos). */
const RATLLES_MAX = 340;
const GOTES_MAX = 160;
const ROQUES = 15;

interface Ratlla {
  e: number;
  n: number;
  /** Velocitat de l'aigua (m/s) i llargada, gruix i transparència màxima. */
  vel: number;
  llarg: number;
  ample: number;
  alfa: number;
  /** 0 = escuma blanca, 1 = ona blava. */
  blau: boolean;
  fase: number;
  vida: number;
  edat: number;
}

interface Gota {
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

interface Roca {
  e: number;
  n: number;
  radi: number;
  fase: number;
  dist: number;
}

function alea(a: number, b: number) {
  return a + Math.random() * (b - a);
}

/** Una gota: centre blanc i vora blavosa que s'esvaeix. */
function crearSpriteGota(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d");
  if (g) {
    const degradat = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    degradat.addColorStop(0, "rgba(255,255,255,1)");
    degradat.addColorStop(0.45, "rgba(205,235,255,0.8)");
    degradat.addColorStop(1, "rgba(120,190,240,0)");
    g.fillStyle = degradat;
    g.fillRect(0, 0, 32, 32);
  }
  return c;
}

export class MonAigua {
  private readonly ratlles: Ratlla[] = [];
  private readonly gotes: Gota[] = [];
  private readonly roques: Roca[] = [];
  private readonly spriteGota: HTMLCanvasElement;
  private t = 0;
  /** Sentit del corrent (rumb en radiants); es fixa en la primera lectura: d'esquerra a dreta de la pantalla. */
  private flux: number | null = null;
  private fe = 1;
  private fn = 0;
  // Càmera de la imatge actual.
  private rumb = 0;
  private elev = 0;
  private w = 1;
  private h = 1;
  private f = 1;
  // Resultat de l'última projecció.
  private px = 0;
  private py = 0;
  private pz = 0;

  constructor() {
    this.spriteGota = crearSpriteGota();
    for (let i = 0; i < ROQUES; i++) {
      const dist = alea(1.8, 14);
      const angle = Math.random() * Math.PI * 2;
      this.roques.push({
        e: Math.sin(angle) * dist,
        n: Math.cos(angle) * dist,
        radi: alea(0.25, 0.65) * (0.7 + dist / 14),
        fase: Math.random() * 10,
        dist,
      });
    }
    // De lluny a prop, perquè les properes tapin les llunyanes.
    this.roques.sort((a, b) => b.dist - a.dist);
  }

  /** Món -> pantalla (primer rumb, després inclinació). Retorna fals si és darrere la càmera. */
  private proj(e: number, u: number, n: number): boolean {
    const sr = Math.sin(this.rumb);
    const cr = Math.cos(this.rumb);
    const se = Math.sin(this.elev);
    const ce = Math.cos(this.elev);
    const ru = u - ALCADA_ULLS;
    const zc = e * sr * ce + ru * se + n * cr * ce;
    if (zc < 0.35) return false;
    const xc = e * cr - n * sr;
    const yc = -e * sr * se + ru * ce - n * cr * se;
    this.px = this.w / 2 + (this.f * xc) / zc;
    this.py = this.h / 2 - (this.f * yc) / zc;
    this.pz = zc;
    return true;
  }

  private novaRatlla(rumbMirada: number, edatInicial: boolean) {
    // Sobretot cap on mira el jugador, perquè ho vegi; una part al voltant i als peus.
    const rumbCentre = (Math.random() < 0.75 ? rumbMirada + alea(-70, 70) : alea(0, 360)) * RAD;
    const dist = 0.8 + 30 * Math.pow(Math.random(), 1.8);
    const blau = Math.random() < 0.3;
    const vida = alea(0.8, 1.8);
    this.ratlles.push({
      e: Math.sin(rumbCentre) * dist,
      n: Math.cos(rumbCentre) * dist,
      vel: alea(3, 6.5),
      llarg: (0.5 + dist * 0.1) * alea(0.6, 1.5) * (blau ? 1.8 : 1),
      ample: 0.04 + dist * 0.012,
      alfa: blau ? alea(0.2, 0.4) : alea(0.35, 0.8),
      blau,
      fase: Math.random() * 10,
      vida,
      edat: edatInicial ? Math.random() * vida : 0,
    });
  }

  private novaGota(e: number, n: number) {
    if (this.gotes.length >= GOTES_MAX) return;
    const a = Math.random() * Math.PI * 2;
    const v = alea(0.2, 1.2);
    this.gotes.push({
      e,
      u: 0.05,
      n,
      ve: Math.cos(a) * v + this.fe * 1.2,
      vu: alea(1.4, 3.4),
      vn: Math.sin(a) * v + this.fn * 1.2,
      vida: alea(0.5, 1),
      edat: 0,
      mida: alea(0.03, 0.07),
    });
  }

  private actualitza(dt: number, rumbMirada: number) {
    this.t += dt;
    while (this.ratlles.length < RATLLES_MAX) this.novaRatlla(rumbMirada, this.t === dt);

    for (let i = this.ratlles.length - 1; i >= 0; i--) {
      const r = this.ratlles[i];
      r.edat += dt;
      if (r.edat >= r.vida) {
        this.ratlles[i] = this.ratlles[this.ratlles.length - 1];
        this.ratlles.pop();
        continue;
      }
      // El corrent porta la ratlla i la bressola una mica de costat.
      const lateral = Math.sin(r.edat * 5 + r.fase) * 0.35;
      r.e += (this.fe * r.vel - this.fn * lateral) * dt;
      r.n += (this.fn * r.vel + this.fe * lateral) * dt;
    }

    // Les roques trenquen el corrent: escuma i gotes aigües avall.
    for (const roca of this.roques) {
      if (Math.random() < dt * 7) {
        const d = roca.radi * 1.1;
        if (this.ratlles.length < RATLLES_MAX + 60) {
          const lat = alea(-roca.radi, roca.radi);
          this.ratlles.push({
            e: roca.e + this.fe * d - this.fn * lat,
            n: roca.n + this.fn * d + this.fe * lat,
            vel: alea(3, 5),
            llarg: roca.radi * alea(1.5, 3.5),
            ample: 0.05 + roca.dist * 0.01,
            alfa: alea(0.55, 0.9),
            blau: false,
            fase: Math.random() * 10,
            vida: alea(0.6, 1.2),
            edat: 0,
          });
        }
      }
      if (Math.random() < dt * 3.5) {
        for (let k = 0; k < 3; k++) {
          this.novaGota(roca.e - this.fe * roca.radi + alea(-0.2, 0.2), roca.n - this.fn * roca.radi + alea(-0.2, 0.2));
        }
      }
    }

    for (let i = this.gotes.length - 1; i >= 0; i--) {
      const g = this.gotes[i];
      g.edat += dt;
      g.vu -= dt * 6;
      g.e += g.ve * dt;
      g.u += g.vu * dt;
      g.n += g.vn * dt;
      if (g.edat >= g.vida || g.u < 0) {
        this.gotes[i] = this.gotes[this.gotes.length - 1];
        this.gotes.pop();
      }
    }
  }

  /** Dibuixa l'estat actual sobre el context (ja netejat) i avança la simulació `dt` segons. */
  pinta(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number, mirada: Mirada) {
    if (this.flux === null) {
      this.flux = ((mirada.rumb + 90) % 360) * RAD;
      this.fe = Math.sin(this.flux);
      this.fn = Math.cos(this.flux);
    }
    this.actualitza(dt, mirada.rumb);
    this.rumb = mirada.rumb * RAD;
    this.elev = mirada.elevacio * RAD;
    this.w = w;
    this.h = h;
    this.f = w / 2 / Math.tan((FOV_HORITZONTAL * RAD) / 2);

    // Vel d'aigua sobre el terra: de l'horitzó (transparent) cap als peus (més fosc).
    const horitzo = h / 2 + this.f * Math.tan(this.elev);
    if (horitzo < h) {
      const dalt = Math.max(0, horitzo);
      const g = ctx.createLinearGradient(0, horitzo, 0, Math.max(horitzo + 1, Math.min(h, horitzo + this.f * 1.1)));
      g.addColorStop(0, "rgba(40,130,200,0)");
      g.addColorStop(0.35, "rgba(30,115,190,0.3)");
      g.addColorStop(1, "rgba(15,80,150,0.5)");
      ctx.fillStyle = g;
      ctx.fillRect(0, dalt, w, h - dalt);
    }

    ctx.save();
    ctx.lineCap = "round";
    // Ratlles d'escuma i ones, ja amb la transparència d'entrada i sortida.
    for (const r of this.ratlles) {
      if (!this.proj(r.e, 0, r.n)) continue;
      const hx = this.px;
      const hy = this.py;
      const hz = this.pz;
      if (!this.proj(r.e - this.fe * r.llarg, 0, r.n - this.fn * r.llarg)) continue;
      const k = r.edat / r.vida;
      const ample = Math.max(1, (r.ample * this.f) / hz);
      if ((hx < -50 && this.px < -50) || (hx > w + 50 && this.px > w + 50) || hy < -50) continue;
      ctx.globalAlpha = r.alfa * Math.sin(Math.PI * k);
      ctx.strokeStyle = r.blau ? "rgb(110,185,235)" : "rgb(236,248,255)";
      ctx.lineWidth = ample;
      ctx.beginPath();
      ctx.moveTo(this.px, this.py);
      ctx.lineTo(hx, hy);
      ctx.stroke();
    }

    // Roques, de lluny a prop, amb un anell d'escuma que tremola.
    for (const roca of this.roques) {
      if (!this.proj(roca.e, 0, roca.n)) continue;
      const rx = (roca.radi * this.f) / this.pz;
      const dist3 = Math.hypot(roca.dist, ALCADA_ULLS);
      const ry = rx * (ALCADA_ULLS / dist3 + 0.1);
      if (this.px < -rx * 2 || this.px > w + rx * 2 || this.py < -rx * 2 || this.py > h + rx * 2) continue;
      const cx = this.px;
      const cy = this.py;
      ctx.globalAlpha = 0.45 + 0.3 * Math.sin(this.t * 7 + roca.fase);
      ctx.strokeStyle = "rgb(240,250,255)";
      ctx.lineWidth = Math.max(1.5, rx * 0.22);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 1.3, ry * 1.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = "rgb(38,52,60)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgb(78,96,104)";
      ctx.beginPath();
      ctx.ellipse(cx, cy - rx * 0.4, rx * 0.8, rx * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(190,215,225,0.55)";
      ctx.beginPath();
      ctx.ellipse(cx - rx * 0.2, cy - rx * 0.62, rx * 0.4, rx * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gotes que salten.
    ctx.globalCompositeOperation = "lighter";
    for (const g of this.gotes) {
      if (!this.proj(g.e, g.u, g.n)) continue;
      const radi = (g.mida * this.f) / this.pz;
      if (this.px < -radi || this.px > w + radi || this.py < -radi || this.py > h + radi) continue;
      ctx.globalAlpha = Math.min(1, (1 - g.edat / g.vida) * 1.4);
      const mida = Math.max(2, radi * 2.4);
      ctx.drawImage(this.spriteGota, this.px - mida, this.py - mida, mida * 2, mida * 2);
    }
    ctx.restore();
  }
}
