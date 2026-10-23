"use client";

import { useEffect, useRef, type RefObject } from "react";
import { diferenciaRumb, type Mirada } from "@/lib/orientacio";
import type { PuntGps } from "@/content/public/extres";

/** Posició de l'equip (GPS); nul·la mentre el mòbil no n'ha trobat cap. */
export type PosicioEquip = { lat: number; lng: number } | null;

const RAD = Math.PI / 180;
const METRES_GRAU_LAT = 111_320;
/** Angle de visió de la càmera del darrere (com a l'extra de les ànimes guia). */
const FOV_H = 52;
const FOV_V = 40;
/** Altura dels ulls sobre el terra, en metres. */
const ALCADA_OLLS = 1.5;
/** Dins d'aquesta distància (m) del camí, la brúixola està plena. Més enllà, s'apaga fins a zero. */
const RADI_CAMI_PLE = 3;
const RADI_CAMI_BUIT = 15;
/** Des d'aquesta distància (m) del lloc final, es dona per arribat. */
export const RADI_AMFORES = 6;
/** Ones translúcides que volen alhora, i quant triga una a anar de la fita fins al lloc final. */
const NOMBRE_ONES = 5;
const DURADA_ONA_MS = 9000;
/** Mida de cada ona: 2 m d'alçada i 2 m d'ample. */
const ALCADA_ONA = 2;
const AMPLADA_ONA = 2;
const PUNTS_PER_ONA = 14;
/** Marcador provisional del lloc final: l'objecte es decidirà més endavant. */
const OR = "255, 206, 92";
const AIGUA = "150, 220, 255";

/** Estat del camí respecte la posició de l'equip. */
export interface EstatTerra {
  /** 1 = sobre el camí; 0 = lluny del camí (la brúixola s'apaga). */
  ressonancia: number;
  /** Distància (m) des de l'equip fins al camí (el segment de la fita al lloc final). */
  distanciaCami: number;
  /** Distància (m) des de l'equip fins al lloc final. */
  distanciaAmfores: number;
  /** Rumb (graus des del nord) des de l'equip cap al lloc final. */
  rumbAmfores: number;
}

interface Local {
  /** Metres cap a l'est i cap al nord des de l'equip. */
  est: number;
  nord: number;
}

interface Punt {
  x: number;
  y: number;
  /** Píxels per metre a la profunditat del punt. */
  escala: number;
}

/** Posició d'un punt GPS en metres respecte l'equip (aproximació pla, suficient a pocs centenars de metres). */
function enMetres(p: PuntGps, u: { lat: number; lng: number }): Local {
  return {
    est: (p.longitud - u.lng) * METRES_GRAU_LAT * Math.cos(u.lat * RAD),
    nord: (p.latitud - u.lat) * METRES_GRAU_LAT,
  };
}

/** Distància de l'origen (l'equip) al segment que va de `a` a `b`. */
function distanciaAlSegment(a: Local, b: Local): number {
  const dx = b.est - a.est;
  const dy = b.nord - a.nord;
  const llarg2 = dx * dx + dy * dy;
  const t = llarg2 === 0 ? 0 : Math.max(0, Math.min(1, -(a.est * dx + a.nord * dy) / llarg2));
  return Math.hypot(a.est + dx * t, a.nord + dy * t);
}

/** Calcula com està el camí respecte la posició de l'equip. Null si encara no hi ha GPS. */
export function estatTerra(u: PosicioEquip, fita: PuntGps, amfores: PuntGps): EstatTerra | null {
  if (!u) return null;
  const a = enMetres(fita, u);
  const b = enMetres(amfores, u);
  const distanciaCami = distanciaAlSegment(a, b);
  const ressonancia = Math.max(0, Math.min(1, 1 - (distanciaCami - RADI_CAMI_PLE) / (RADI_CAMI_BUIT - RADI_CAMI_PLE)));
  return {
    ressonancia,
    distanciaCami,
    distanciaAmfores: Math.hypot(b.est, b.nord),
    rumbAmfores: (Math.atan2(b.est, b.nord) / RAD + 360) % 360,
  };
}

/** Projecta un punt de l'entorn (metres, a l'altura `altura`) a la pantalla. Null si és fora de vista o darrere. */
function projecta(l: Local, altura: number, mirada: Mirada, w: number, h: number): Punt | null {
  const theta = (Math.atan2(l.est, l.nord) / RAD + 360) % 360;
  const rel = diferenciaRumb(theta, mirada.rumb);
  const profunditat = Math.hypot(l.est, l.nord) * Math.cos(rel * RAD);
  if (Math.abs(rel) > 70 || profunditat < 0.8) return null;
  const fx = w / 2 / Math.tan((FOV_H / 2) * RAD);
  const fy = h / 2 / Math.tan((FOV_V / 2) * RAD);
  const horitzo = h / 2 + fy * Math.tan(mirada.elevacio * RAD);
  return {
    x: w / 2 + fx * Math.tan(rel * RAD),
    y: horitzo + (fy * (ALCADA_OLLS - altura)) / profunditat,
    escala: fy / profunditat,
  };
}

interface Guspira {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
}

interface Props {
  /** Lectura de la brúixola i la inclinació; pot ser nul·la fins que arribi la primera. */
  mirada: RefObject<Mirada | null>;
  /** Posició GPS de l'equip; nul·la mentre no n'hi ha. */
  posicio: RefObject<PosicioEquip>;
  /** Sense sensors (ordinador o permís denegat): arrossegar el dit gira la mirada. */
  arrossegar: boolean;
  /** Rumb inicial de la mirada quan s'arrossega: cap al camí. */
  rumb: number;
  /** La fita (on comença el camí) i el lloc final (on acaba). */
  fita: PuntGps;
  amfores: PuntGps;
}

/**
 * Ones translúcides de 2 m que volen i sinuegen des de la fita fins al lloc final, i una brúixola que
 * apunta cap al lloc final (el triangle de la Terra vibra amb guspires quan l'equip és sobre el camí).
 * Al lloc final hi ha un marcador provisional: l'objecte es decidirà més endavant.
 * Dibuixat en un canvas 2D transparent a sobre de la càmera. La lògica geogràfica és a `estatTerra`.
 */
export function EscenaTerra({ mirada, posicio, arrossegar, rumb, fita, amfores }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Sense sensors, la vista comença mirant cap al camí.
  const manual = useRef<Mirada>({ rumb, elevacio: 0 });
  const arrossegarRef = useRef(arrossegar);
  const punter = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    arrossegarRef.current = arrossegar;
  }, [arrossegar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const guspires: Guspira[] = [];
    let frame = 0;
    let w = 0;
    let h = 0;

    const bucle = (ara: number) => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      if (cw !== w || ch !== h) {
        w = cw;
        h = ch;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const m = arrossegarRef.current ? manual.current : (mirada.current ?? manual.current);
      const u = posicio.current;
      const e = estatTerra(u, fita, amfores);
      const t = ara;

      if (u && e) {
        const a = enMetres(fita, u);
        const b = enMetres(amfores, u);
        const dx = b.est - a.est;
        const dy = b.nord - a.nord;
        const llarg = Math.hypot(dx, dy) || 1;
        // Perpendicular al camí, en metres (per al gruix i el serpeig de les ones).
        const perp = { est: -dy / llarg, nord: dx / llarg };
        const r = e.ressonancia;

        // 1. Ones translúcides: cadascuna surt de la fita, vola cap al lloc final i sinuega pel camí.
        for (let k = 0; k < NOMBRE_ONES; k++) {
          const f = (t / DURADA_ONA_MS + k / NOMBRE_ONES) % 1;
          // Vol sinuós: la trajectòria es mou d'un costat a l'altre del camí.
          const serpeig = Math.sin(t * 0.0009 + k * 1.7) * 3;
          const centre: Local = {
            est: a.est + dx * f + perp.est * serpeig,
            nord: a.nord + dy * f + perp.nord * serpeig,
          };
          // Apareix i desapareix suaument a cada extrem del camí.
          const fade = Math.min(1, f * 6) * Math.min(1, (1 - f) * 6);
          const dalt: (Punt | null)[] = [];
          const baix: (Punt | null)[] = [];
          for (let j = 0; j <= PUNTS_PER_ONA; j++) {
            const lateral = (j / PUNTS_PER_ONA - 0.5) * AMPLADA_ONA + Math.sin(j * 0.8 + t * 0.005 + k) * 0.25;
            const x = centre.est + perp.est * lateral;
            const y = centre.nord + perp.nord * lateral;
            // La cresta de l'ona ondula en alçada.
            const alcada = ALCADA_ONA * (0.75 + 0.25 * Math.cos(j * 0.5 + t * 0.004 + k));
            dalt.push(projecta({ est: x, nord: y }, alcada, m, w, h));
            baix.push(projecta({ est: x, nord: y }, 0.1, m, w, h));
          }
          if (fade <= 0 || dalt.some((p) => p === null) || baix.some((p) => p === null)) continue;
          ctx.beginPath();
          dalt.forEach((p, j) => (j === 0 ? ctx.moveTo(p!.x, p!.y) : ctx.lineTo(p!.x, p!.y)));
          for (let j = baix.length - 1; j >= 0; j--) ctx.lineTo(baix[j]!.x, baix[j]!.y);
          ctx.closePath();
          ctx.fillStyle = `rgba(${AIGUA}, ${0.16 * fade})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(232, 250, 255, ${0.45 * fade})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // 2. Marcador provisional del lloc final: un cercle que batega a terra.
        const pFinal = projecta(b, 0, m, w, h);
        if (pFinal) {
          const batec = 0.6 + 0.4 * Math.sin(t / 500);
          ctx.strokeStyle = `rgba(${OR}, ${0.4 * batec})`;
          ctx.lineWidth = Math.max(1, 0.12 * pFinal.escala);
          ctx.beginPath();
          ctx.ellipse(pFinal.x, pFinal.y, 1.8 * pFinal.escala, 0.6 * pFinal.escala, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 3. Brúixola (HUD): al voltant de les puntes, a la cantonada inferior dreta. Quan l'equip és
        // lluny del camí s'apaga; el triangle vibra amb guspires quan hi és a sobre.
        drawBrujula(ctx, m, e, r, t, w, h, guspires);
      } else {
        drawBrujula(ctx, m, null, 0, t, w, h, guspires);
      }

      for (let i = guspires.length - 1; i >= 0; i--) {
        const g = guspires[i];
        g.x += g.vx;
        g.y += g.vy;
        g.vida -= 0.025;
        if (g.vida <= 0) {
          guspires.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(g.x, g.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${OR}, ${g.vida})`;
        ctx.fill();
      }

      frame = requestAnimationFrame(bucle);
    };

    frame = requestAnimationFrame(bucle);
    return () => cancelAnimationFrame(frame);
  }, [mirada, posicio, fita, amfores]);

  // Sense sensors: arrossegar gira la mirada (rumb amb l'horitzontal, inclinació amb la vertical).
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full touch-none"
      onPointerDown={(ev) => {
        punter.current = { x: ev.clientX, y: ev.clientY };
        ev.currentTarget.setPointerCapture(ev.pointerId);
      }}
      onPointerMove={(ev) => {
        if (!arrossegarRef.current || !punter.current) return;
        const dx = ev.clientX - punter.current.x;
        const dy = ev.clientY - punter.current.y;
        punter.current = { x: ev.clientX, y: ev.clientY };
        const graus = FOV_H / Math.max(1, ev.currentTarget.clientWidth);
        manual.current = {
          rumb: (manual.current.rumb - dx * graus + 360) % 360,
          elevacio: Math.max(-60, Math.min(60, manual.current.elevacio + dy * graus)),
        };
      }}
      onPointerUp={() => {
        punter.current = null;
      }}
      onPointerCancel={() => {
        punter.current = null;
      }}
    />
  );
}

/** Dibuixa la brúixola del HUD (en píxels de pantalla) i les guspires del triangle quan és sobre el camí. */
function drawBrujula(
  ctx: CanvasRenderingContext2D,
  m: Mirada,
  e: EstatTerra | null,
  r: number,
  t: number,
  w: number,
  h: number,
  guspires: Guspira[],
) {
  const cx = w - 62;
  const cy = h - 150;
  const R = 42;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(20, 14, 6, 0.6)";
  ctx.fill();
  ctx.strokeStyle = `rgba(${OR}, ${0.3 + 0.7 * r})`;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = `rgb(${OR})`;
  ctx.shadowBlur = 12 * r;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ["N", "E", "S", "O"].forEach((lletra, k) => {
    const angle = (k * 90 - m.rumb) * RAD;
    ctx.fillStyle = `rgba(${OR}, ${0.25 + 0.75 * r})`;
    ctx.fillText(lletra, cx + Math.sin(angle) * R * 0.78, cy - Math.cos(angle) * R * 0.78);
  });
  if (e) {
    const vibra = r > 0.5 ? 1.4 * r : 0;
    const phi = (e.rumbAmfores - m.rumb) * RAD;
    const tx = cx + Math.sin(phi) * R * 0.55 + Math.sin(t * 0.09) * vibra;
    const ty = cy - Math.cos(phi) * R * 0.55 + Math.cos(t * 0.13) * vibra;
    ctx.beginPath();
    ctx.moveTo(tx - 8, ty - 6);
    ctx.lineTo(tx + 8, ty - 6);
    ctx.lineTo(tx, ty + 8);
    ctx.closePath();
    ctx.fillStyle = r > 0.5 ? `rgba(${OR}, 1)` : "rgba(200, 200, 200, 0.4)";
    ctx.fill();
    if (r > 0.5 && Math.random() < 0.35) {
      guspires.push({ x: tx + (Math.random() - 0.5) * 10, y: ty, vx: (Math.random() - 0.5) * 0.8, vy: -0.4 - Math.random() * 0.8, vida: 1 });
    }
  }
  ctx.restore();
}
