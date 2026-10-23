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
/** Alçada (m) a què penja la còpia invertida de la malla, com un cel de mar. */
const ALCADA_CEL = 30;
/** Malla de punts: 160 × 100 = 16.000 vèrtexs, en metres respecte la fita (x = est, z = sud). */
const NX = 160;
const NZ = 100;
const MALLA_X0 = -120;
const MALLA_X1 = 260;
const MALLA_Z0 = -120;
const MALLA_Z1 = 120;
/** Colors del marcador provisional i de la brúixola. */
const OR = "255, 206, 92";

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

/** Posició d'un punt GPS en el món de l'escena: origen a la fita, x = est i z = sud (el nord és -z). */
function aMon(lat: number, lng: number, fita: PuntGps): { x: number; z: number } {
  return {
    x: (lng - fita.longitud) * METRES_GRAU_LAT * Math.cos(fita.latitud * RAD),
    z: -(lat - fita.latitud) * METRES_GRAU_LAT,
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

/**
 * Vèrtexs de la malla: el terra es mou com el mar, amb diversos trens d'ona que van en direccions
 * diferents i a velocitats diferents. Les crestes més altes es veuen més clares, i alguns punts brillen
 * una mica a l'atzar, com la llum sobre l'aigua.
 */
const VERTEX = `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPR;
  uniform vec2 uCam;
  uniform vec3 uBaixa;
  uniform vec3 uAlta;
  varying vec3 vCol;
  varying float vA;
  void main() {
    vec3 p = position;
    float h = 0.0;
    h += 0.28 * sin(dot(p.xz, vec2(0.71, 0.70)) * 0.42 + uTime * 1.1);
    h += 0.20 * sin(dot(p.xz, vec2(-0.45, 0.89)) * 0.61 + uTime * 1.5 + 1.3);
    h += 0.16 * sin(dot(p.xz, vec2(0.92, -0.38)) * 0.97 + uTime * 1.9 + 2.1);
    h += 0.10 * sin(dot(p.xz, vec2(-0.18, -0.98)) * 1.55 + uTime * 2.4 + 0.4);
    h += 0.07 * sin(dot(p.xz, vec2(0.60, 0.80)) * 2.30 + uTime * 3.1 + 3.0);
    h += 0.03 * sin(p.x * 3.1 + p.z * 2.7 + uTime * 4.0 + aSeed * 6.2831);
    p.y += h;
    float cresta = smoothstep(-0.2, 0.4, h);
    float brill = pow(max(0.0, sin(uTime * 3.0 + aSeed * 40.0)), 12.0) * 0.8;
    vCol = mix(uBaixa, uAlta, cresta) * (0.65 + 0.6 * cresta + brill);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = length(p.xz - uCam);
    vA = 1.0 - smoothstep(120.0, 260.0, dist);
    gl_PointSize = clamp(260.0 / (-mv.z), 1.5, 9.0) * uPR;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = `
  varying vec3 vCol;
  varying float vA;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.05, r) * vA;
    gl_FragColor = vec4(vCol, a);
  }
`;

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
  /** La fita (on comença el camí, i origen de la malla) i el lloc final. */
  fita: PuntGps;
  amfores: PuntGps;
}

/**
 * Malla de 16.000 punts que cobreix el terra fins a l'horitzó i es mou com el mar, amb diversos trens
 * d'ona en direccions diferents. Per sobre, la brúixola (canvas 2D) apunta cap al lloc final i el triangle
 * de la Terra vibra amb guspires quan l'equip és sobre el camí. Al lloc final hi ha un marcador provisional.
 * Dibuixat en dos canvas transparents a sobre de la càmera. La lògica geogràfica és a `estatTerra`.
 */
export function EscenaTerra({ mirada, posicio, arrossegar, rumb, fita, amfores }: Props) {
  const glRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Sense sensors, la vista comença mirant cap al camí.
  const manual = useRef<Mirada>({ rumb, elevacio: 0 });
  const arrossegarRef = useRef(arrossegar);
  const punter = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    arrossegarRef.current = arrossegar;
  }, [arrossegar]);

  // Brúixola i marcador provisional, en 2D.
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
      const r = e?.ressonancia ?? 0;

      if (u && e) {
        const b = enMetres(amfores, u);
        const pFinal = projecta(b, 0, m, w, h);
        if (pFinal) {
          const batec = 0.6 + 0.4 * Math.sin(ara / 500);
          ctx.strokeStyle = `rgba(${OR}, ${0.4 * batec})`;
          ctx.lineWidth = Math.max(1, 0.12 * pFinal.escala);
          ctx.beginPath();
          ctx.ellipse(pFinal.x, pFinal.y, 1.8 * pFinal.escala, 0.6 * pFinal.escala, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      drawBrujula(ctx, m, e, r, ara / 1000, w, h, guspires);

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

  // La malla i el front d'ona, en WebGL. Three.js només es carrega en obrir aquesta pantalla. Sense
  // WebGL, la pantalla queda només amb la brúixola.
  useEffect(() => {
    let cancel = false;
    let frame = 0;
    let neteja: () => void = () => {};

    (async () => {
      try {
        const THREE = await import("three");
        const canvas = glRef.current;
        if (cancel || !canvas) return;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setClearColor(0x000000, 0);
        const escena = new THREE.Scene();
        const cam = new THREE.PerspectiveCamera(FOV_V, 1, 0.5, 800);
        cam.rotation.order = "YXZ";

        const pos = new Float32Array(NX * NZ * 3);
        const seed = new Float32Array(NX * NZ);
        let i = 0;
        // Graella desplaçada a l'atzar dins de cada cel·la: així no es veuen línies rectes.
        const pasX = (MALLA_X1 - MALLA_X0) / (NX - 1);
        const pasZ = (MALLA_Z1 - MALLA_Z0) / (NZ - 1);
        for (let ix = 0; ix < NX; ix++) {
          for (let iz = 0; iz < NZ; iz++) {
            pos[i * 3] = MALLA_X0 + ix * pasX + (Math.random() - 0.5) * pasX * 0.9;
            pos[i * 3 + 1] = 0;
            pos[i * 3 + 2] = MALLA_Z0 + iz * pasZ + (Math.random() - 0.5) * pasZ * 0.9;
            seed[i] = Math.random();
            i++;
          }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

        const uniforms = {
          uTime: { value: 0 },
          uPR: { value: 1 },
          uCam: { value: new THREE.Vector2() },
          uBaixa: { value: new THREE.Vector3(0.12, 0.45, 0.22) },
          uAlta: { value: new THREE.Vector3(0.6, 1.0, 0.5) },
        };
        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: VERTEX,
          fragmentShader: FRAGMENT,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        escena.add(new THREE.Points(geo, material));

        // La mateixa malla penjada al cel, invertida i en blau: comparteix la geometria i el temps.
        const uniformsCel = {
          ...uniforms,
          uBaixa: { value: new THREE.Vector3(0.1, 0.3, 0.7) },
          uAlta: { value: new THREE.Vector3(0.55, 0.8, 1.0) },
        };
        const materialCel = new THREE.ShaderMaterial({
          uniforms: uniformsCel,
          vertexShader: VERTEX,
          fragmentShader: FRAGMENT,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const cel = new THREE.Points(geo, materialCel);
        cel.position.y = ALCADA_CEL;
        cel.scale.y = -1;
        escena.add(cel);

        const inici = performance.now();
        let w = 0;
        let h = 0;
        const bucle = (ara: number) => {
          const cw = canvas.clientWidth;
          const ch = canvas.clientHeight;
          if (cw !== w || ch !== h) {
            w = cw;
            h = ch;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            renderer.setPixelRatio(dpr);
            renderer.setSize(w, h, false);
            cam.aspect = w / Math.max(1, h);
            cam.updateProjectionMatrix();
            uniforms.uPR.value = dpr;
          }

          const m = arrossegarRef.current ? manual.current : (mirada.current ?? manual.current);
          const u = posicio.current;
          const sobreCami = u ? aMon(u.lat, u.lng, fita) : { x: 0, z: 0 };
          uniforms.uTime.value = (ara - inici) / 1000;

          cam.position.set(sobreCami.x, ALCADA_OLLS, sobreCami.z);
          cam.rotation.set(m.elevacio * RAD, -m.rumb * RAD, 0);
          uniforms.uCam.value.set(sobreCami.x, sobreCami.z);

          renderer.render(escena, cam);
          frame = requestAnimationFrame(bucle);
        };
        frame = requestAnimationFrame(bucle);

        neteja = () => {
          cancelAnimationFrame(frame);
          geo.dispose();
          material.dispose();
          materialCel.dispose();
          renderer.dispose();
        };
      } catch {
        // Sense WebGL: només es veu la brúixola.
      }
    })();

    return () => {
      cancel = true;
      cancelAnimationFrame(frame);
      neteja();
    };
  }, [mirada, posicio, fita, amfores]);

  // Sense sensors: arrossegar gira la mirada (rumb amb l'horitzontal, inclinació amb la vertical).
  return (
    <>
      <canvas ref={glRef} className="absolute inset-0 h-full w-full" />
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
    </>
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
