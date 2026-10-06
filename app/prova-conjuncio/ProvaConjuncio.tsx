"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { disposarRunesCercle } from "@/components/ui/runes";

/**
 * PROTOTIP — «La Conjunció dels Astres» (idea de la fórmula màgica, PENDENT a docs/fites-nova.md).
 * Només visual i sense dependències: un cel d'estrelles amb profunditat real (projecció en
 * perspectiva sobre un canvas) i, a sota, un sintonitzador de ràdio amb tres dials per número
 * (centenes, desenes, unitats).
 *
 * - Cada element té una «freqüència» de 3 xifres. L'ona del seu canal és soroll quan és desafinat;
 *   en acostar-s'hi s'accelera i vira cap al color de l'element.
 * - Mentre es mou el dial, l'estrella de l'element entra en ressonància amb estrelles del cel i hi
 *   forma mini constel·lacions que van canviant. En arribar al valor exacte, queden fixades les
 *   estrelles que li pertoquen i l'estrella viatja al seu vèrtex del pentagrama (en un pla inclinat,
 *   conservant la profunditat 3D).
 *
 * ATENCIÓ: els números i les claus de ressonància són NOMÉS de prova i viuen al client. Si la idea
 * tira endavant, tot això (solució + proximitat) passarà al servidor (content/private/ + API nova).
 */

const ELEMENTS = [
  { id: "aigua", nom: "Aigua", color: "#4a9bff", prova: "127", pos: [-0.9, -0.5, 1.6] },
  { id: "foc", nom: "Foc", color: "#ff6a35", prova: "233", pos: [0.8, -0.8, 2.2] },
  { id: "terra", nom: "Terra", color: "#8fd13a", prova: "666", pos: [1.1, 0.6, 1.2] },
  { id: "aire", nom: "Aire", color: "#3fd4f0", prova: "431", pos: [-0.2, 0.9, 2.6] },
  { id: "anima", nom: "Ànima", color: "#c27bff", prova: "773", pos: [-1.2, 0.3, 2.0] },
] as const;

type V3 = [number, number, number];

/** Vèrtexs del pentagrama en un pla inclinat: el z que en resulta és la profunditat que es conserva. */
function vertexsPentagrama(): V3[] {
  const r = 0.62;
  const rx = 0.55;
  const ry = -0.5;
  return ELEMENTS.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    let x = r * Math.cos(a);
    let y = r * Math.sin(a);
    let z = 0;
    [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
    [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
    return [x, y, z + 0.9];
  });
}

/** Anells de runes concèntrics (viewBox 400): un per element, de fora cap a dins. */
const VB = 400;
const RADIS_ANELLS = [190, 172, 154, 136, 118];
const ALCADA_RUNA = 9;
/** Velocitat de gir (°/s) mentre l'anell no és encaixat; signes alterns, com al Stargate. */
const VELOCITATS = [11, -17, 24, -8, 15];
/** Alçada (fracció) del centre de l'escena: deixa lloc al sintonitzador de sota. */
const CENTRE_Y = 0.38;

/** Arc de 9° al capdamunt d'un anell: el «xevró» que s'encén en encaixar. */
function arcXevro(r: number): string {
  const a = (4.5 * Math.PI) / 180;
  const rm = r + ALCADA_RUNA / 2;
  const x = Math.sin(a) * rm;
  const y = Math.cos(a) * rm;
  return `M${VB / 2 - x} ${VB / 2 - y} A${rm} ${rm} 0 0 1 ${VB / 2 + x} ${VB / 2 - y}`;
}

/** Xifres objectiu [centenes, desenes, unitats] de cada element. NOMÉS PROVA: ha de viure al servidor. */
const OBJECTIUS: number[][] = ELEMENTS.map((e) => [...e.prova].map(Number));
const INICIALS: number[][] = [
  [4, 1, 2],
  [0, 8, 5],
  [5, 4, 0],
  [9, 0, 5],
  [2, 6, 0],
];
const NOM_DIALS = ["Centenes", "Desenes", "Unitats"];
/** Freqüència (0–999) que representen les tres xifres, amb decimals mentre s'arrossega. */
const freq = (d: number[]) => d[0] * 100 + d[1] * 10 + d[2];

/** Nitidesa del senyal (0 = soroll pur, 1 = sintonitzat) segons la distància de cada xifra a l'objectiu. */
function nitidesa(d: number[], i: number): number {
  const p = d.map((v, j) => Math.pow(Math.max(0, 1 - Math.abs(v - OBJECTIUS[i][j]) / 5), 1.4));
  // Cada xifra que s'acosta suma; amb les tres exactes, 1.
  return Math.pow((p[0] + p[1] + p[2]) / 3, 1.5);
}

/** Ressonància d'una estrella del cel amb un dial: ample (en unitats de freqüència) de la banda. */
const AMPLE_RESSONANCIA = 16;
/** Decalatge de la clau de les estrelles pròpies de cada element respecte a la seva freqüència. */
const DECALATGES = [-10, -6, -2, 3, 7, 11];

const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const GRIS: [number, number, number] = [150, 156, 184];
function hexRgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
/** Color que va del gris (desafinat) al de l'element (sintonitzat). */
function colorSenyal(hex: string, c: number): string {
  const e = hexRgb(hex);
  const m = GRIS.map((g, k) => Math.round(lerp(g, e[k], c)));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}

/** Igual que `colorSenyal` però amb transparència. */
function colorSenyalA(hex: string, c: number, alfa: number): string {
  const e = hexRgb(hex);
  const m = GRIS.map((g, k) => Math.round(lerp(g, e[k], c)));
  return `rgba(${m[0]},${m[1]},${m[2]},${alfa.toFixed(3)})`;
}

/** Proximitat (0–1) d'una sola xifra a la seva xifra objectiu. */
function proximitatXifra(v: number, i: number, j: number): number {
  return Math.pow(Math.max(0, 1 - Math.abs(v - OBJECTIUS[i][j]) / 5), 1.4);
}

function mulberry(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Estrella {
  p: V3;
  m: number;
  /** Clau de ressonància (0–999), o -1 si no ressona amb res. */
  k: number;
  /** Element al qual pertany de debò (només les estrelles de la seva constel·lació), o -1. */
  el: number;
}

export function ProvaConjuncio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vals, setVals] = useState<number[][]>(INICIALS);
  const [alineats, setAlineats] = useState<boolean[]>([false, false, false, false, false]);
  const [actiu, setActiu] = useState(0);
  const anellsRef = useRef<(SVGGElement | null)[]>([]);
  const runes = useMemo(
    () => RADIS_ANELLS.map((r) => disposarRunesCercle(VB / 2, VB / 2, r, ALCADA_RUNA, { separacio: 2 })),
    [],
  );
  const alineatsRef = useRef(alineats);
  /** Valors decimals de cada dial (el que dibuixen els canvas); `vals` n'és l'arrodoniment per a la UI. */
  const valsRef = useRef<number[][]>(INICIALS.map((d) => [...d]));
  const actiuRef = useRef(actiu);
  useEffect(() => {
    alineatsRef.current = alineats;
    actiuRef.current = actiu;
  }, [alineats, actiu]);
  const completa = alineats.every(Boolean);

  function sintonitza(i: number, j: number, x: number) {
    if (alineatsRef.current[i]) return;
    const v = Math.min(9, Math.max(0, x));
    valsRef.current[i][j] = v;
    const r = Math.round(v);
    setVals((a) => (a[i][j] === r ? a : a.map((d, k) => (k === i ? d.map((q, n) => (n === j ? r : q)) : d))));
  }

  // Quan els tres dials queden clavats a l'objectiu, el senyal s'encaixa i es passa al següent canal.
  const clauActiu = vals[actiu].join("");
  useEffect(() => {
    if (alineatsRef.current[actiu] || clauActiu !== OBJECTIUS[actiu].join("")) return;
    const id = setTimeout(() => {
      const f = valsRef.current[actiu];
      if (!f.every((v, j) => Math.abs(v - OBJECTIUS[actiu][j]) < 0.06)) return;
      valsRef.current[actiu] = [...OBJECTIUS[actiu]];
      setAlineats((a) => a.map((x, k) => (k === actiu ? true : x)));
      const seguent = ELEMENTS.findIndex((_, k) => k !== actiu && !alineatsRef.current[k]);
      if (seguent >= 0) setTimeout(() => setActiu(seguent), 1100);
    }, 800);
    return () => clearTimeout(id);
  }, [clauActiu, actiu]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rnd = mulberry(1472);
    const destins = vertexsPentagrama();
    const fons: Estrella[] = Array.from({ length: 240 }, () => ({
      p: [(rnd() - 0.5) * 7, (rnd() - 0.5) * 5, rnd() * 5 + 0.3] as V3,
      m: rnd() * 1.4 + 0.4,
      k: rnd() < 0.55 ? Math.floor(rnd() * 1000) : -1,
      el: -1,
    }));
    // Estrelles pròpies de cada element: un cúmul al voltant del seu vèrtex, amb claus properes a la seva freqüència.
    ELEMENTS.forEach((_, i) => {
      DECALATGES.forEach((o) => {
        fons.push({
          p: [destins[i][0] + (rnd() - 0.5) * 0.8, destins[i][1] + (rnd() - 0.5) * 0.8, destins[i][2] + (rnd() - 0.5) * 0.8],
          m: rnd() * 1.4 + 0.4,
          k: freq(OBJECTIUS[i]) + o,
          el: i,
        });
      });
    });
    const t = [0, 0, 0, 0, 0];
    let zoom = 0;
    const angleAnell = RADIS_ANELLS.map((_, i) => i * 71);
    const arrossegat = { yaw: 0, pitch: 0 };
    let arrossega: { x: number; y: number } | null = null;
    let w = 0;
    let h = 0;

    function mida() {
      const r = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    mida();
    const ro = new ResizeObserver(mida);
    ro.observe(canvas);

    const onDown = (e: PointerEvent) => {
      arrossega = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!arrossega) return;
      arrossegat.yaw += (e.clientX - arrossega.x) * 0.006;
      arrossegat.pitch = Math.max(-0.7, Math.min(0.7, arrossegat.pitch + (e.clientY - arrossega.y) * 0.004));
      arrossega = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      arrossega = null;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    let raf = 0;
    let ultim = performance.now();
    const inici = ultim;

    function frame(ara: number) {
      const dt = Math.min((ara - ultim) / 1000, 0.05);
      ultim = ara;
      const temps = (ara - inici) / 1000;
      const al = alineatsRef.current;
      const tot = al.every(Boolean);
      const cx = w / 2;
      const cy = h * CENTRE_Y;

      for (let i = 0; i < 5; i++) t[i] = Math.min(1, Math.max(0, t[i] + (al[i] ? dt / 2.2 : 0)));
      zoom = lerp(zoom, tot ? 1 : 0, 1 - Math.exp(-dt * 1.6));
      if (!arrossega) {
        arrossegat.yaw *= Math.exp(-dt * 0.6);
        arrossegat.pitch *= Math.exp(-dt * 0.6);
      }

      // El cel gira lent; un cop completat només es balanceja, per mostrar que la 3D es manté.
      const yaw = (tot ? Math.sin(temps * 0.5) * 0.28 : temps * 0.05) + arrossegat.yaw;
      const pitch = (tot ? Math.cos(temps * 0.4) * 0.1 : 0) + arrossegat.pitch;
      const cyw = Math.cos(yaw);
      const syw = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const focal = Math.min(w, h * 1.3) * (1.0 + zoom * 0.25);
      const cam = 3.2 - zoom * 0.5;

      function proj(p: V3) {
        // El centre de la rotació és el del pentagrama (z≈0.9).
        const x0 = p[0];
        const y0 = p[1];
        const z0 = p[2] - 0.9;
        const x1 = x0 * cyw + z0 * syw;
        const z1 = -x0 * syw + z0 * cyw;
        const y1 = y0 * cp - z1 * sp;
        const z2 = y0 * sp + z1 * cp;
        const s = focal / Math.max(0.2, cam + z2 + 0.9);
        return { x: cx + x1 * s, y: cy + y1 * s, s };
      }

      const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.75);
      grad.addColorStop(0, "#14123a");
      grad.addColorStop(1, "#05040f");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, w, h);

      // Estrelles del cel: més lluny = més petites i apagades.
      const qs = fons.map((e) => proj(e.p));
      fons.forEach((e, j) => {
        const q = qs[j];
        const prof = Math.min(1, Math.max(0, q.s / (focal / 2)));
        const a = (0.25 + prof * 0.6) * (0.75 + 0.25 * Math.sin(temps * e.m * 2 + e.p[0] * 9));
        ctx!.fillStyle = `rgba(235,235,255,${a.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(q.x, q.y, 0.4 + prof * 1.5, 0, 6.283);
        ctx!.fill();
      });

      const pos = ELEMENTS.map((el, i) => {
        const k = ease(t[i]);
        // Sense encaixar, l'astre s'acosta una mica a mesura que el senyal es torna nítid.
        const kp = Math.max(k, 0.85 * nitidesa(valsRef.current[i], i));
        const p: V3 = [lerp(el.pos[0], destins[i][0], kp), lerp(el.pos[1], destins[i][1], kp), lerp(el.pos[2], destins[i][2], kp)];
        return { ...proj(p), k };
      });

      // Ressonància: l'estrella de cada element s'enllaça amb les estrelles del cel que sonen a la seva freqüència
      // actual (mini constel·lacions que canvien en moure el dial). Encaixat, només queden les que li pertoquen.
      ctx!.lineCap = "round";
      for (let i = 0; i < 5; i++) {
        const F = freq(valsRef.current[i]);
        const col = ELEMENTS[i].color;
        const lit: { j: number; s: number; ang: number }[] = [];
        // Només el canal que s'està tocant ressona a ple; els altres, tènuement, i els encaixats, fixos.
        const pes = al[i] ? 1 : i === actiuRef.current ? 1 : 0.3;
        fons.forEach((e, j) => {
          if (e.k < 0) return;
          const dx = qs[j].x - pos[i].x;
          const dy = qs[j].y - pos[i].y;
          // Les línies molt llargues s'esvaeixen: són mini constel·lacions, no tela d'aranya.
          const prop = 0.3 + 0.7 * Math.max(0, 1 - Math.hypot(dx, dy) / 260);
          const s = (al[i] ? (e.el === i ? 1 : 0) : Math.max(0, 1 - Math.abs(F - e.k) / AMPLE_RESSONANCIA)) * pes * (al[i] ? 1 : prop);
          if (s > 0.05) lit.push({ j, s, ang: Math.atan2(dy, dx) });
        });
        if (!lit.length) continue;
        lit.sort((a, b) => b.s - a.s);
        const triades = lit.slice(0, 9).sort((a, b) => a.ang - b.ang);
        ctx!.strokeStyle = col;
        ctx!.shadowColor = col;
        ctx!.shadowBlur = 6;
        ctx!.lineWidth = 1.2;
        triades.forEach((a, n) => {
          ctx!.globalAlpha = 0.45 * a.s;
          ctx!.beginPath();
          ctx!.moveTo(pos[i].x, pos[i].y);
          ctx!.lineTo(qs[a.j].x, qs[a.j].y);
          ctx!.stroke();
          const b = triades[n + 1];
          if (b) {
            ctx!.globalAlpha = 0.8 * Math.min(a.s, b.s);
            ctx!.beginPath();
            ctx!.moveTo(qs[a.j].x, qs[a.j].y);
            ctx!.lineTo(qs[b.j].x, qs[b.j].y);
            ctx!.stroke();
          }
        });
        ctx!.shadowBlur = 0;
        triades.forEach((a) => {
          const q = qs[a.j];
          const r = 3 + a.s * 6;
          const g = ctx!.createRadialGradient(q.x, q.y, 0, q.x, q.y, r);
          g.addColorStop(0, col);
          g.addColorStop(1, col + "00");
          ctx!.globalAlpha = a.s;
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(q.x, q.y, r, 0, 6.283);
          ctx!.fill();
          ctx!.fillStyle = "#fff";
          ctx!.beginPath();
          ctx!.arc(q.x, q.y, 1.1 + a.s * 0.9, 0, 6.283);
          ctx!.fill();
        });
        ctx!.globalAlpha = 1;
      }

      // Línies del pentagrama (i → i+2) entre estrelles ja alineades.
      for (let i = 0; i < 5; i++) {
        const j = (i + 2) % 5;
        const f = Math.min(pos[i].k, pos[j].k);
        if (f <= 0.02) continue;
        ctx!.strokeStyle = tot ? `rgba(255,215,110,${0.55 + 0.4 * zoom})` : `rgba(255,255,255,${(0.5 * f).toFixed(3)})`;
        ctx!.lineWidth = (1 + 1.6 * f) * (tot ? 1.4 : 1);
        ctx!.shadowColor = tot ? "#ffd76e" : "transparent";
        ctx!.shadowBlur = tot ? 14 : 0;
        ctx!.beginPath();
        ctx!.moveTo(pos[i].x, pos[i].y);
        ctx!.lineTo(pos[j].x, pos[j].y);
        ctx!.stroke();
      }
      ctx!.shadowBlur = 0;

      // Estrelles principals: la mida depèn de la profunditat; les no alineades són tènues.
      for (let i = 0; i < 5; i++) {
        const q = pos[i];
        const r = Math.max(4, (q.s / focal) * 34) * (1 + 0.15 * Math.sin(temps * 2 + i));
        const g = ctx!.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * 4);
        g.addColorStop(0, ELEMENTS[i].color + (q.k > 0.3 ? "ff" : "99"));
        g.addColorStop(0.25, ELEMENTS[i].color + "66");
        g.addColorStop(1, ELEMENTS[i].color + "00");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(q.x, q.y, r * 4, 0, 6.283);
        ctx!.fill();
        ctx!.fillStyle = "#fff";
        ctx!.beginPath();
        ctx!.arc(q.x, q.y, r * 0.5, 0, 6.283);
        ctx!.fill();
      }

      // Anells de runes: giren sols; en encaixar, el xevró s'orienta cap a la seva estrella.
      // Mentre es sintonitza, l'anell frena, s'il·lumina amb el color de l'element i s'orienta cap a la seva
      // estrella; en arribar al valor exacte fa lock.
      for (let i = 0; i < 5; i++) {
        const c = al[i] ? 1 : nitidesa(valsRef.current[i], i);
        const dx = pos[i].x - cx;
        const dy = pos[i].y - cy;
        const objectiu = (Math.atan2(dx, -dy) * 180) / Math.PI;
        const dif = ((objectiu - angleAnell[i] + 540) % 360) - 180;
        angleAnell[i] += VELOCITATS[i] * (1 - c) * dt;
        angleAnell[i] += dif * (1 - Math.exp(-dt * (al[i] ? 3.5 : 4 * c * c * c)));
        const g = anellsRef.current[i];
        if (!g) continue;
        g.setAttribute("transform", `rotate(${angleAnell[i].toFixed(2)} ${VB / 2} ${VB / 2})`);
        const color = tot ? "#ffd76e" : al[i] ? ELEMENTS[i].color : colorSenyal(ELEMENTS[i].color, c);
        g.style.setProperty("--anell", color);
        g.style.setProperty("--xevro", tot ? "#ffd76e" : colorSenyalA(ELEMENTS[i].color, c, 0.15 + 0.85 * c * c));
        g.style.opacity = String(al[i] || tot ? 1 : 0.5 + 0.5 * c);
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <main className="relative flex min-h-dvh flex-col bg-[#05040f] text-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" aria-hidden />
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="pointer-events-none absolute left-1/2 z-[5] aspect-square w-[min(100vw,60dvh)] -translate-x-1/2 -translate-y-1/2 transition-[filter] duration-1000"
        style={{ top: `${CENTRE_Y * 100}%`, filter: completa ? "drop-shadow(0 0 8px #ffd76e)" : "none" }}
        aria-hidden
      >
        {/* Els colors (--anell, --xevro) els posa el bucle d'animació segons la sintonia de cada canal. */}
        {RADIS_ANELLS.map((r, i) => (
          <g
            key={i}
            ref={(el) => {
              anellsRef.current[i] = el;
            }}
            style={{ ["--anell" as string]: "rgb(150,156,184)", ["--xevro" as string]: "rgba(150,156,184,0.15)", opacity: 0.5 }}
          >
            <circle cx={VB / 2} cy={VB / 2} r={r - 2} fill="none" strokeWidth={0.8} style={{ stroke: "var(--anell)" }} />
            <circle cx={VB / 2} cy={VB / 2} r={r + ALCADA_RUNA + 2} fill="none" strokeWidth={0.8} style={{ stroke: "var(--anell)" }} />
            <g style={{ fill: "var(--anell)" }}>
              {runes[i].map((g) => (
                <path key={g.key} d={g.d} transform={g.transform} />
              ))}
            </g>
            <path d={arcXevro(r)} fill="none" strokeWidth={ALCADA_RUNA + 3} style={{ stroke: "var(--xevro)" }} />
          </g>
        ))}
      </svg>
      <div className="relative z-10 px-4 pt-5 text-center">
        <h1 className="text-2xl font-bold tracking-wide">La Conjunció dels Astres</h1>
        <p className="mt-1 text-base text-white/80">
          {completa
            ? "Els astres són alineats. Arrossega el cel: la profunditat no s'ha perdut."
            : "Sintonitza cada canal: l'ona s'accelerarà i agafarà el color de l'element."}
        </p>
      </div>
      <div className="relative z-10 mt-auto flex flex-col gap-1.5 px-2 pb-3">
        <div className="flex w-full justify-center gap-1.5">
          {ELEMENTS.map((el, i) => (
            <button
              key={el.id}
              type="button"
              onClick={() => setActiu(i)}
              aria-label={`Canal ${el.nom}`}
              className="flex min-h-12 flex-1 flex-col items-center justify-center rounded-md border px-1 text-sm font-semibold leading-tight"
              style={{
                color: el.color,
                borderColor: i === actiu ? el.color : "rgba(255,255,255,0.15)",
                background: i === actiu ? `${el.color}22` : "rgba(5,4,15,0.55)",
                boxShadow: alineats[i] ? `inset 0 0 10px ${el.color}88` : "none",
              }}
            >
              <span className="font-display text-lg tabular-nums">{vals[i].join("")}</span>
              <span className="text-xs">{el.nom}</span>
            </button>
          ))}
        </div>
        <OsciloscopiRadio valsRef={valsRef} alineatsRef={alineatsRef} actiuRef={actiuRef} />
        {[0, 1, 2].map((j) => (
          <DialRadio key={j} index={actiu} roda={j} valsRef={valsRef} bloquejat={alineats[actiu]} onSintonitza={sintonitza} />
        ))}
      </div>
    </main>
  );
}

/** Canvas que s'ajusta a la mida CSS (amb DPR) i dibuixa cada fotograma amb `dibuixa`. */
function useCanvasBucle(dibuixa: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dibuixaRef = useRef(dibuixa);
  useEffect(() => {
    dibuixaRef.current = dibuixa;
  });
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let w = 0;
    let h = 0;
    const mida = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    mida();
    const ro = new ResizeObserver(mida);
    ro.observe(canvas);
    const inici = performance.now();
    let raf = 0;
    const bucle = (ara: number) => {
      ctx.clearRect(0, 0, w, h);
      dibuixaRef.current(ctx, w, h, (ara - inici) / 1000);
      raf = requestAnimationFrame(bucle);
    };
    raf = requestAnimationFrame(bucle);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);
  return ref;
}

/**
 * Pantalla d'oscil·loscopi amb els 5 canals. Un canal desafinat és soroll gris i lent; en acostar-s'hi,
 * l'ona s'accelera, es neteja i vira cap al color del seu element.
 */
function OsciloscopiRadio({
  valsRef,
  alineatsRef,
  actiuRef,
}: {
  valsRef: React.RefObject<number[][]>;
  alineatsRef: React.RefObject<boolean[]>;
  actiuRef: React.RefObject<number>;
}) {
  const ref = useCanvasBucle((ctx, w, h, t) => {
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let g = 1; g < 4; g++) {
      ctx.beginPath();
      ctx.moveTo(0, (h * g) / 4);
      ctx.lineTo(w, (h * g) / 4);
      ctx.stroke();
    }
    const mid = h / 2;
    for (let i = 0; i < 5; i++) {
      const d = valsRef.current[i];
      const v = freq(d);
      const c = alineatsRef.current[i] ? 1 : nitidesa(d, i);
      const actiu = i === actiuRef.current;
      const color = colorSenyal(ELEMENTS[i].color, c);
      ctx.strokeStyle = color;
      ctx.globalAlpha = actiu ? 1 : 0.3;
      ctx.lineWidth = actiu ? 2 : 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = actiu ? 4 + 8 * c : 0;
      ctx.beginPath();
      const amp = h * 0.42 * (0.4 + 0.6 * c);
      const cicles = 1.5 + 9 * c;
      const velocitat = 2 + 9 * c;
      for (let x = 0; x <= w; x += 2) {
        const u = x / w;
        const pura = Math.sin(2 * Math.PI * cicles * u - t * velocitat + i);
        const soroll =
          0.5 * Math.sin(2 * Math.PI * (4 + ((v * 0.021) % 5)) * u + t * 3.1 + v * 0.31) +
          0.35 * Math.sin(2 * Math.PI * (9 + ((v * 0.013) % 4)) * u - t * 4.7 + i * 2) +
          0.25 * Math.sin(2 * Math.PI * 23 * u + t * 8.3 - v * 0.17);
        const y = mid - amp * (c * pura + (1 - c) * soroll * 0.9);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    // Lectura de la intensitat del senyal del canal actiu.
    const a = actiuRef.current;
    const ca = alineatsRef.current[a] ? 1 : nitidesa(valsRef.current[a], a);
    ctx.textAlign = "left";
    ctx.font = "700 11px sans-serif";
    ctx.fillStyle = colorSenyal(ELEMENTS[a].color, ca);
    ctx.fillText(`${ELEMENTS[a].nom.toUpperCase()} · SENYAL ${Math.round(ca * 100)}%`, 8, 14);
  });
  return (
    <canvas
      ref={ref}
      className="h-14 w-full rounded-md border border-white/15 bg-[#05040f]/70"
      aria-label="Ones de ràdio dels cinc canals"
    />
  );
}

/**
 * Dial de sintonia horitzontal i fi d'una xifra (0–9), a tota l'amplada: s'arrossega l'agulla (el dit
 * la segueix 1:1) i en deixar-la, s'enganxa a la xifra més propera.
 */
function DialRadio({
  index,
  roda,
  valsRef,
  bloquejat,
  onSintonitza,
}: {
  index: number;
  roda: number;
  valsRef: React.RefObject<number[][]>;
  bloquejat: boolean;
  onSintonitza: (i: number, j: number, x: number) => void;
}) {
  const MARGE = 14;
  const drag = useRef<number | null>(null);
  const snap = useRef(0);
  const propsRef = useRef({ index, roda, bloquejat, onSintonitza });
  useEffect(() => {
    propsRef.current = { index, roda, bloquejat, onSintonitza };
  });
  // Si es canvia de canal, l'enganxament del canal anterior no ha de moure el nou.
  useEffect(() => {
    drag.current = null;
    cancelAnimationFrame(snap.current);
  }, [index]);

  const ref = useCanvasBucle((ctx, w, h, temps) => {
    const d = valsRef.current[index];
    const v = d[roda];
    const hex = ELEMENTS[index].color;
    // Proximitat d'aquesta xifra: governa l'agulla, l'ondulació de l'escala, el mesurador i la vora.
    const p = bloquejat ? 1 : proximitatXifra(v, index, roda);
    const correcta = bloquejat || Math.abs(v - OBJECTIUS[index][roda]) < 0.06;
    const color = colorSenyal(hex, p);
    const ample = w - 2 * MARGE;
    const base = h - 4;
    const xAgulla = MARGE + (v / 9) * ample;

    // Vora: s'il·lumina amb el color de l'element a mesura que la xifra s'acosta; amb la xifra bona, pulsa.
    const pols = correcta ? 0.65 + 0.35 * Math.sin(temps * 5) : 1;
    ctx.strokeStyle = colorSenyalA(hex, p, (0.15 + 0.85 * p) * pols);
    ctx.lineWidth = 1 + 1.5 * p;
    ctx.shadowColor = hex;
    ctx.shadowBlur = correcta ? 10 : 0;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    ctx.shadowBlur = 0;

    // Halo darrere l'agulla.
    const halo = ctx.createRadialGradient(xAgulla, base, 0, xAgulla, base, 60);
    halo.addColorStop(0, colorSenyalA(hex, p, 0.1 + 0.4 * p));
    halo.addColorStop(1, colorSenyalA(hex, p, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(235,235,255,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGE, base);
    ctx.lineTo(w - MARGE, base);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = "600 11px sans-serif";
    for (let n = 0; n <= 90; n++) {
      const x = MARGE + (n / 90) * ample;
      const gran = n % 10 === 0;
      const mitja = n % 5 === 0;
      // Les marques properes a l'agulla ondulen: caòtic si és lluny, una ona neta i viva si s'hi és a prop.
      const env = Math.exp(-(((x - xAgulla) / 70) ** 2));
      const ona = p * Math.sin(x * 0.28 - temps * (4 + 12 * p));
      const sorollet = (1 - p) * (Math.sin(x * 1.7 + temps * 9) * Math.sin(x * 0.53 - temps * 6.1));
      const mod = 1 + env * (0.9 * ona + 0.6 * sorollet);
      ctx.strokeStyle = gran ? "rgba(235,235,255,0.9)" : "rgba(235,235,255,0.4)";
      if (env > 0.25) ctx.strokeStyle = colorSenyalA(hex, p, gran ? 0.95 : 0.6);
      ctx.beginPath();
      ctx.moveTo(x, base);
      ctx.lineTo(x, base - (gran ? 15 : mitja ? 10 : 6) * Math.max(0.3, mod));
      ctx.stroke();
      if (gran) {
        ctx.fillStyle = "rgba(235,235,255,0.85)";
        ctx.fillText(String(n / 10), x, base - 21);
      }
    }
    ctx.textAlign = "left";
    ctx.font = "600 9px sans-serif";
    ctx.fillStyle = "rgba(235,235,255,0.5)";
    ctx.fillText(NOM_DIALS[roda].toUpperCase(), MARGE, 10);

    // Mesurador de senyal (5 barres) i ✓ quan la xifra és la bona.
    const lit = correcta ? 5 : Math.min(4, Math.floor(p * 5));
    for (let b = 0; b < 5; b++) {
      const bx = w - MARGE - 38 + b * 8;
      const bh = 4 + b * 2;
      ctx.fillStyle = b < lit ? (correcta ? hex : colorSenyal(hex, p)) : "rgba(235,235,255,0.18)";
      ctx.fillRect(bx, 14 - bh, 5, bh);
    }
    if (correcta) {
      ctx.textAlign = "right";
      ctx.font = "700 12px sans-serif";
      ctx.fillStyle = hex;
      ctx.fillText("✓", w - MARGE - 44, 13);
    }

    // Agulla.
    const x = xAgulla;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6 + 10 * p;
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 5, 8);
    ctx.lineTo(x + 5, 8);
    ctx.lineTo(x, 15);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  const mou = (x: number) => {
    const p = propsRef.current;
    if (!p.bloquejat) p.onSintonitza(p.index, p.roda, x);
  };

  return (
    <canvas
      ref={ref}
      aria-label={`Dial de ${NOM_DIALS[roda].toLowerCase()}`}
      className="h-[52px] w-full touch-none rounded-md border border-white/15 bg-[#05040f]/70"
      onPointerDown={(e) => {
        cancelAnimationFrame(snap.current);
        drag.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current === null) return;
        const w = e.currentTarget.getBoundingClientRect().width - 2 * MARGE;
        const du = ((e.clientX - drag.current) / w) * 9;
        drag.current = e.clientX;
        mou(valsRef.current[propsRef.current.index][propsRef.current.roda] + du);
      }}
      onPointerUp={() => {
        drag.current = null;
        let ultim = performance.now();
        const enganxa = (ara: number) => {
          const dt = (ara - ultim) / 1000;
          ultim = ara;
          const { index: i, roda: j } = propsRef.current;
          const v = valsRef.current[i][j];
          const meta = Math.round(v);
          if (Math.abs(meta - v) < 0.004) {
            mou(meta);
            return;
          }
          mou(v + (meta - v) * (1 - Math.exp(-dt * 16)));
          snap.current = requestAnimationFrame(enganxa);
        };
        snap.current = requestAnimationFrame(enganxa);
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    />
  );
}
