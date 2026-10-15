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
/** Dins d'aquesta distància (m) del camí, l'esquerda és plena de llum. Més enllà, s'apaga fins a zero. */
const RADI_CAMI_PLE = 3;
const RADI_CAMI_BUIT = 15;
/** Des d'aquesta distància (m) de les àmfores, es dona per arribat. */
export const RADI_AMFORES = 6;
/** Distància (m) a què una runa s'il·lumina quan hi passa l'equip. */
const RADI_RUNA = 4;
/** Posició de les runes al llarg del camí (fracció des de la fita). */
const FRACCIONS_RUNES = [0.14, 0.3, 0.46, 0.62, 0.78, 0.92];
const SIMBOLS_RUNES = ["♁", "☿", "♄", "☉", "♃", "⊕"];
const NOMBRE_ESPORES = 34;
const NOMBRE_MOSTRES_CAMI = 60;
const OR = "255, 206, 92";
const LLUM_VERDA = "150, 255, 170";

/** Estat del camí respecte la posició de l'equip. */
export interface EstatTerra {
  /** 1 = sobre l'esquerda de llum; 0 = lluny del camí (les runes s'apaguen). */
  ressonancia: number;
  /** Distància (m) des de l'equip fins al camí (el segment de la fita a les àmfores). */
  distanciaCami: number;
  /** Distància (m) des de l'equip fins a les àmfores. */
  distanciaAmfores: number;
  /** Rumb (graus des del nord) des de l'equip cap a les àmfores. */
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
  /** La fita (on comença el camí) i les àmfores (on acaba). */
  fita: PuntGps;
  amfores: PuntGps;
}

/**
 * Esquerda de llum que va de la fita fins a les àmfores, amb molsa lluminosa i espores que pugen; runes
 * de la Terra que floten a prop del terra i s'il·luminen quan hi passa l'equip; i una brúixola que apunta
 * cap a les àmfores (el triangle de la Terra vibra amb guspires quan l'equip és sobre el camí).
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

    const inici = performance.now();
    const lum = FRACCIONS_RUNES.map(() => 0);
    const esporesSeed = Array.from({ length: NOMBRE_ESPORES }, () => ({
      f: Math.random(),
      desp: (Math.random() - 0.5) * 1.6,
      fase: Math.random(),
    }));
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
      const t = ara - inici;

      if (u && e) {
        const a = enMetres(fita, u);
        const b = enMetres(amfores, u);
        const lerp = (f: number): Local => ({ est: a.est + (b.est - a.est) * f, nord: a.nord + (b.nord - a.nord) * f });
        const r = e.ressonancia;

        // 1. Esquerda de llum: s'obre en uns 2,5 s i avança de la fita cap a les àmfores.
        const obertura = Math.min(1, t / 2500);
        const mostres: (Punt | null)[] = [];
        const ultima = Math.floor(NOMBRE_MOSTRES_CAMI * obertura);
        for (let i = 0; i <= ultima; i++) {
          const f = i / NOMBRE_MOSTRES_CAMI;
          const l = lerp(f);
          // Petit serpeig lateral perquè no sembli una línia recta de programari.
          mostres.push(projecta({ est: l.est + Math.sin(i * 2.3) * 0.12, nord: l.nord }, 0, m, w, h));
        }
        for (let i = 1; i < mostres.length; i++) {
          const p0 = mostres[i - 1];
          const p1 = mostres[i];
          if (!p0 || !p1) continue;
          const amplada = Math.max(1, 0.35 * p1.escala);
          ctx.lineCap = "round";
          ctx.strokeStyle = `rgba(${LLUM_VERDA}, ${0.12 + 0.35 * r})`;
          ctx.lineWidth = amplada * 4;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
          ctx.strokeStyle = `rgba(232, 255, 214, ${0.3 + 0.7 * r})`;
          ctx.lineWidth = amplada;
          ctx.stroke();
        }

        // 2. Molsa luminescent: espores que pugen des del camí i s'esvaeixen.
        for (const s of esporesSeed) {
          const cicle = ((t / 2600) + s.fase) % 1;
          const p = projecta(lerp(s.f), 0.2 + cicle * 1.2, m, w, h);
          if (!p) continue;
          const alfa = (0.2 + 0.8 * r) * Math.sin(Math.PI * cicle) * obertura;
          ctx.fillStyle = `rgba(${LLUM_VERDA}, ${alfa})`;
          ctx.beginPath();
          ctx.arc(p.x + s.desp * p.escala, p.y, Math.max(0.8, 0.09 * p.escala), 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Runes de la Terra: floten a prop del terra; s'il·luminen i giren quan l'equip hi passa a prop.
        FRACCIONS_RUNES.forEach((f, i) => {
          const base = lerp(f);
          const distancia = Math.hypot(base.est, base.nord);
          lum[i] += ((distancia <= RADI_RUNA ? 1 : 0) - lum[i]) * 0.08;
          const sol = lum[i];
          const terra = projecta(base, 0, m, w, h);
          const aire = projecta(base, 0.35 + 0.08 * Math.sin(t / 900 + i), m, w, h);
          if (!terra || !aire) return;
          const alfa = (0.2 + 0.8 * r) * (0.35 + 0.65 * sol);
          ctx.save();
          ctx.strokeStyle = `rgba(${LLUM_VERDA}, ${alfa})`;
          ctx.lineWidth = Math.max(1, 0.08 * terra.escala);
          ctx.beginPath();
          ctx.ellipse(terra.x, terra.y, 1.1 * terra.escala, 0.4 * terra.escala, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = alfa;
          ctx.fillStyle = `rgb(${LLUM_VERDA})`;
          ctx.font = `${Math.min(60, Math.max(10, 1.2 * aire.escala))}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.translate(aire.x, aire.y);
          if (sol > 0.5) ctx.rotate(t * 0.0004);
          if (sol > 0.5) {
            ctx.shadowColor = `rgb(${LLUM_VERDA})`;
            ctx.shadowBlur = 14;
          }
          ctx.fillText(SIMBOLS_RUNES[i], 0, 0);
          ctx.restore();
        });

        // 4. Les àmfores: un cercle que batega a terra i una ampolla a sobre.
        const pAmfores = projecta(b, 0, m, w, h);
        if (pAmfores) {
          const batec = 0.6 + 0.4 * Math.sin(t / 500);
          ctx.strokeStyle = `rgba(${OR}, ${0.4 * batec})`;
          ctx.lineWidth = Math.max(1, 0.12 * pAmfores.escala);
          ctx.beginPath();
          ctx.ellipse(pAmfores.x, pAmfores.y, 1.8 * pAmfores.escala, 0.6 * pAmfores.escala, 0, 0, Math.PI * 2);
          ctx.stroke();
          const pIcona = projecta(b, 0.7, m, w, h);
          if (pIcona) {
            ctx.font = `${Math.min(80, Math.max(14, 1.6 * pIcona.escala))}px serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🏺", pIcona.x, pIcona.y);
          }
        }
      }

      // 5. Brúixola (HUD): al voltant de les puntes, a la cantonada inferior dreta. Les runes del voltant
      // s'apaguen quan l'equip és lluny del camí; el triangle vibra amb guspires quan hi és a sobre.
      const r = e?.ressonancia ?? 0;
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
