"use client";

import type { AnimationAction, AnimationMixer } from "three";
import { useEffect, useRef, type RefObject } from "react";
import { GLIFS_RUNES, INSCRIPCIO_RUNES } from "@/components/ui/runes";
import { diferenciaRumb, type Mirada } from "@/lib/orientacio";
import { EstatGolem, SeguimentGolem } from "@/components/ar/terra/seguiment";
import { dibuixaVora } from "@/components/ar/voraGuia";
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
/** Alçada (m) a què penja la còpia de la malla al cel. */
const ALCADA_CEL = 30;
/** Posició GPS exacta del con de la fita: on el Gollem porta l'equip i on són els anells de runes. */
export const PUNT_FORAT: PuntGps = { latitud: 41.912260852132, longitud: 2.233455370907986 };
/** Distància (m) a la qual s'ha de estar del monticle per veure'l (posició de prova de la galeria). */
export const DISTANCIA_PROVA_FORAT_M = 15;
/** Vèrtexs extra al disc del forat, perquè l'embut tingui prou punts. */
const NVERTEXS_FORAT = 2500;
/** Radi (m) del disc del forat, al voltant del punt GPS final. */
const RADI_FORAT = 3.5;
/** Malla de punts: 160 × 125 vèrtexs, en metres respecte el punt d'inici (x = est, z = sud). */
const NX = 160;
const NZ = 125;
/** Malla del cel: una graella pròpia, més esbiaixada que la del terra. */
const NX_CEL = 120;
const NZ_CEL = 93;
const MALLA_X0 = -120;
const MALLA_X1 = 260;
const MALLA_Z0 = -120;
/** Ha d'arribar fins al con de la fita (~150 m al sud del punt d'inici). */
const MALLA_Z1 = 180;
/** Colors del marcador provisional i de la brúixola. */
const OR = "255, 206, 92";
/** Alçades (m) dels tres anells de runes sobre el punt final. */
const ALCADES_ANELLS = [2.5, 5.5, 8.5];
/** Color dels anells runes: vermell lluny del número, blau quan s'hi acosta, verd quan tots són resolts. */
const COLOR_ANELL_LLUNY = { r: 1, g: 0, b: 0 };
const COLOR_ANELL_APROP = { r: 0, g: 0.35, b: 1 };
const COLOR_ANELL_RESOLT = { r: 0.2, g: 1, b: 0.2 };

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
 * Vèrtexs de la malla, per al terra i per al cel (la mateixa geometria, amb `uCel` = 0 o 1). El terra
 * es mou com el mar, amb diversos trens d'ona.
 */
const VERTEX = `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPR;
  uniform float uAlcada;
  uniform vec2 uCentre;
  uniform vec3 uOnades[90];
  uniform vec2 uCam;
  uniform vec3 uBaixa;
  uniform vec3 uAlta;
  varying vec3 vCol;
  varying float vA;
  void main() {
    vec3 p = position;
    float tm = uTime;
    float h = 0.0;
    h += 0.28 * sin(dot(p.xz, vec2(0.71, 0.70)) * 0.42 + tm * 1.1);
    h += 0.20 * sin(dot(p.xz, vec2(-0.45, 0.89)) * 0.61 + tm * 1.5 + 1.3);
    h += 0.16 * sin(dot(p.xz, vec2(0.92, -0.38)) * 0.97 + tm * 1.9 + 2.1);
    h += 0.10 * sin(dot(p.xz, vec2(-0.18, -0.98)) * 1.55 + tm * 2.4 + 0.4);
    h += 0.07 * sin(dot(p.xz, vec2(0.60, 0.80)) * 2.30 + tm * 3.1 + 3.0);
    h += 0.03 * sin(p.x * 3.1 + p.z * 2.7 + tm * 4.0 + aSeed * 6.2831);
    // Monticle a la posició final: la malla del terra puja en forma de trompeta (vora a terra, coll a 4 m i
    // base a 8 m per sobre). Cada vèrtex del disc es posa sobre la superfície, a una alçada pròpia.
    float d = distance(p.xz, uCentre);
    float s = fract(aSeed * 17.3);
    // Perfil: base al terra (1,67 m, un terç dels 5 m anteriors), coll al mig (2 m) i punta a dalt (0,5 m).
    float rf;
    if (s < 0.5) {
      float u = 1.0 - 2.0 * s;
      rf = 2.0 - 0.333 * u * u;
    } else {
      rf = 2.0 - 1.5 * (2.0 * s - 1.0);
    }
    float angF = aSeed * 6.2831 * 9.0;
    vec2 xzF = uCentre + vec2(cos(angF), sin(angF)) * rf;
    float wF = 1.0 - smoothstep(2.5, 4.0, d);
    p.xz = mix(p.xz, xzF, wF);
    // Doll de partícules: des de la punta de dalt, els vèrtexs pugen cap amunt en bucle.
    // Només un 30 % dels vèrtexs de la punta pugen; la resta es queden quiets i formen el con.
    float jet = smoothstep(0.8, 1.0, s) * wF * step(0.7, aSeed);
    float fase = fract(aSeed * 13.7 + uTime * 0.35);
    float yTerra = mix(h, 9.0 * s, wF) + jet * fase * 6.0;
    // Ones d'impacte: anells que s'expandeixen des de cada punt d'impacte i s'esvaeixen, com les ones de l'aigua.
    float ona = 0.0;
    for (int q = 0; q < 90; q++) {
      vec3 o = uOnades[q];
      float edat = uTime - o.z;
      if (edat > 0.0 && edat < 4.0) {
        float d = distance(p.xz, o.xy);
        float R = edat * 5.0;
        ona += 0.5 * exp(-edat * 0.9) * exp(-pow((d - R) / 1.0, 2.0));
      }
    }
    p.y = yTerra + ona;
    float cresta = smoothstep(-0.2, 0.4, h);
    float brill = pow(max(0.0, sin(tm * 3.0 + aSeed * 40.0)), 12.0) * 0.8;
    // Només es veuen els vèrtexs que pugen: el con estàtic es fa invisible (en additiu, el negre no suma res).
    float oculta = wF * (1.0 - step(0.0005, jet));
    // La base del con es dimmeja: els vèrtexs del terra s'acumulen allà i sumen massa llum.
    float dimBase = 1.0 - 0.7 * wF * (1.0 - s);
    vCol = (mix(uBaixa, uAlta, cresta) * (0.65 + 0.6 * cresta + brill) + vec3(jet * fase * 0.5)) * dimBase * (1.0 - oculta);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = length(p.xz - uCam);
    vA = 1.0 - smoothstep(120.0, 260.0, dist);
    gl_PointSize = clamp(260.0 / (-mv.z), 1.5, 9.0) * uPR;
    gl_Position = projectionMatrix * mv;
  }
`;

/**
 * Vèrtexs del cel: una malla pròpia, amb una altra graella i uns altres trens d'ona (no és una còpia del
 * terra). Es mou més a poc a poc i sense forat.
 */
const SKY_VERTEX = `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPR;
  uniform float uAlcada;
  uniform vec2 uCam;
  uniform vec2 uCentre;
  uniform vec3 uBaixa;
  uniform vec3 uAlta;
  varying vec3 vCol;
  varying float vA;
  void main() {
    vec3 p = position;
    float h = 0.0;
    h += 0.22 * sin(dot(p.xz, vec2(0.30, -0.95)) * 0.35 + uTime * 0.6);
    h += 0.18 * sin(dot(p.xz, vec2(0.88, 0.47)) * 0.52 + uTime * 0.8 + 0.7);
    h += 0.12 * sin(dot(p.xz, vec2(-0.66, 0.75)) * 0.90 + uTime * 1.0 + 2.6);
    h += 0.06 * sin(dot(p.xz, vec2(0.10, 0.99)) * 1.80 + uTime * 1.6 + 1.1);
    // Mateixa forma de con que al terra, a la mateixa posició, en el cel.
    float d = distance(p.xz, uCentre);
    float s = fract(aSeed * 17.3);
    float rf;
    if (s < 0.5) {
      float u = 1.0 - 2.0 * s;
      rf = 2.0 - 0.333 * u * u;
    } else {
      rf = 2.0 - 1.5 * (2.0 * s - 1.0);
    }
    float angF = aSeed * 6.2831 * 9.0;
    vec2 xzF = uCentre + vec2(cos(angF), sin(angF)) * rf;
    float wF = 1.0 - smoothstep(2.5, 4.0, d);
    p.xz = mix(p.xz, xzF, wF);
    float jet = smoothstep(0.8, 1.0, s) * wF * step(0.7, aSeed);
    float fase = fract(aSeed * 13.7 + uTime * 0.35);
    // Mirall del terra: el con del cel és la imatge del del terra respecte del pla del cel (30 m).
    p.y = mix(uAlcada - h, uAlcada - 9.0 * s, wF) - jet * fase * 6.0;
    float oculta = wF * (1.0 - step(0.0005, jet));
    float cresta = smoothstep(-0.2, 0.4, h);
    float brill = pow(max(0.0, sin(uTime * 2.0 + aSeed * 31.0)), 14.0) * 0.7;
    float dimBase = 1.0 - 0.7 * wF * (1.0 - s);
    // La base del cel és la que brilla més (hi ha molts vèrtexs): s'apaga cap al seu bord.
    float fadeBase = mix(1.0, smoothstep(0.0, 0.35, s), wF);
    vCol = (mix(uBaixa, uAlta, cresta) * (0.6 + 0.6 * cresta + brill) + vec3(jet * fase * 0.5)) * dimBase * fadeBase * (1.0 - oculta);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = length(p.xz - uCam);
    vA = 1.0 - smoothstep(120.0, 260.0, dist);
    gl_PointSize = clamp(260.0 / (-mv.z), 1.5, 9.0) * uPR;
    gl_Position = projectionMatrix * mv;
  }
`;


/** Estella fugaç i impacte: punts amb color i alfa per vèrtex. */
const CAIGUDA_VERTEX = `
  attribute float aAlpha;
  attribute float aMida;
  attribute vec3 aCol;
  uniform float uPR;
  uniform vec2 uCam;
  uniform float uMida;
  uniform float uMax;
  varying vec3 vCol;
  varying float vA;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vA = aAlpha * (1.0 - smoothstep(120.0, 260.0, length(wp.xz - uCam)));
    vCol = aCol;
    gl_PointSize = clamp(uMida * aMida * 260.0 / (-mv.z), 2.0, uMax) * uPR;
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
 * Malla de punts que cobreix el terra fins a l'horitzó i es mou com el mar, amb una còpia invertida al cel.
 * Per sobre, la brúixola (canvas 2D) apunta cap al lloc final i el triangle de la Terra vibra amb guspires
 * quan l'equip és sobre el camí. Al lloc final hi ha un marcador provisional. Dibuixat en dos canvas
 * transparents a sobre de la càmera. La lògica geogràfica és a `estatTerra`.
 */
export function EscenaTerra({ mirada, posicio, arrossegar, rumb, fita, amfores }: Props) {
  // Anells de runes: angles de gir (radiants) i la posició de cada anell a la pantalla (per tocar-los).
  const anglesAnells = useRef<number[]>([0, 0, 0]);
  const anellsPantalla = useRef<number[]>([]);
  const anellActiu = useRef<number | null>(null);
  // Anells ja fixats al número correcte: no es poden tornar a girar.
  const anellsBloquejats = useRef<boolean[]>([false, false, false]);
  // Velocitat de cada anell (radiants per quadre), que ve del gest del dit.
  const velocitatAnells = useRef<number[]>([0, 0, 0]);
  const glRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Sense sensors, la vista comença mirant cap al camí.
  const manual = useRef<Mirada>({ rumb, elevacio: 0 });
  const arrossegarRef = useRef(arrossegar);
  const punter = useRef<{ x: number; y: number } | null>(null);
  // Posició del golem en metres (món de l'escena), per il·luminar la vora cap a on és.
  const golemRef = useRef<{ x: number; z: number } | null>(null);
  // Des de quan el golem és a la vista (per aturar la vora quan ja s'ha trobat).
  const vistaDesDeRef = useRef<number | null>(null);

  useEffect(() => {
    arrossegarRef.current = arrossegar;
  }, [arrossegar]);

  // Brúixola i marcador provisional, en 2D.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

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
      if (u) {
        // Posició a la pantalla de cada anell, per saber quin toca el dit.
        const centreAnells = enMetres(PUNT_FORAT, u);
        anellsPantalla.current = ALCADES_ANELLS.map((alcada) => {
          const pa = projecta(centreAnells, alcada, m, w, h);
          return pa ? pa.y : -1000;
        });
      }
      if (u) {
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

      // Vores il·luminades cap a on és el golem, com als altres AR.
      const gol = golemRef.current;
      const uu = posicio.current;
      if (gol && uu) {
        const o = aMon(uu.lat, uu.lng, fita);
        const rumbGolem = (Math.atan2(gol.x - o.x, -(gol.z - o.z)) / RAD + 360) % 360;
        const dxGolem = diferenciaRumb(rumbGolem, m.rumb);
        // Quan el golem ja és a la vista durant 2 s, la vora deixa d'il·luminar-se (ja s'ha trobat).
        const enVista = Math.abs(dxGolem) < 25;
        if (enVista) {
          if (vistaDesDeRef.current === null) vistaDesDeRef.current = ara;
        } else {
          vistaDesDeRef.current = null;
        }
        const trobat = vistaDesDeRef.current !== null && ara - vistaDesDeRef.current >= 2000;
        if (!trobat) dibuixaVora(ctx, w, h, dxGolem, 0.8, 900, ara, OR);
      }

      frame = requestAnimationFrame(bucle);
    };

    frame = requestAnimationFrame(bucle);
    return () => cancelAnimationFrame(frame);
  }, [mirada, posicio, fita, amfores]);

  // La malla, en WebGL. Three.js només es carrega en obrir aquesta pantalla. Sense WebGL, la pantalla
  // queda només amb la brúixola.
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

        // Centre del forat: el punt GPS final, en metres respecte la fita.
        // El monticle, a la posició GPS exacta PUNT_FORAT.
        const centre = aMon(PUNT_FORAT.latitud, PUNT_FORAT.longitud, fita);

        // El gegant de pedra (model GLB de public/golem), a 3 m d'alçada, sobre la posició exacta del monticle,
        // de cara a la fita.
        const ALCADA_GOLEM = 3;
        const golem = new THREE.Group();
        golem.position.set(centre.x, 0, centre.z);
        golem.rotation.y = Math.atan2(-centre.x, -centre.z);
        escena.add(golem);
        escena.add(new THREE.AmbientLight(0x6a6a78, 1.1));
        const sol = new THREE.DirectionalLight(0xffe3b0, 1.4);
        sol.position.set(-30, 60, 20);
        escena.add(sol);
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const seguiment = new SeguimentGolem(centre.x, centre.z);
        let mixerGolem: AnimationMixer | null = null;
        let accioCaminar: AnimationAction | null = null;
        let accioSaludar: AnimationAction | null = null;
        let accioAssenyalar: AnimationAction | null = null;
        let estatAnim: EstatGolem | null = null;
        let ultimFrameGolem = performance.now();
        let yawGolem: number | null = null;
        const accioDe = (estat: EstatGolem | null): AnimationAction | null =>
          estat === "seguint" ? accioCaminar : estat === "gest" ? accioSaludar : estat === "assenyala" ? accioAssenyalar : null;
        const canviaAnimacio = (estat: EstatGolem) => {
          const origen = accioDe(estatAnim);
          const desti = accioDe(estat);
          if (origen && origen !== desti) origen.fadeOut(0.3);
          if (desti) desti.reset().fadeIn(0.3).play();
          estatAnim = estat;
        };
        const carregador = new GLTFLoader();
        // El model és el del fitxer de la caminada: té la malla, la textura i el rig amb la mateixa postura de
        // repòs que els clips (si no, les rotacions es desfiguren).
        // Model amb el rig corregit (scripts/golem-animacio) i els dos clips: caminar i senyal (vine).
        const [gltfModel, gltfCaminar, gltfSaludar, gltfAssenyalar] = await Promise.all([
          carregador.loadAsync("/golem/golem.glb"),
          carregador.loadAsync("/golem/caminar.glb"),
          carregador.loadAsync("/golem/senyal.glb"),
          carregador.loadAsync("/golem/assenyalar.glb"),
        ]);
        const model = gltfModel.scene;
        const caixa = new THREE.Box3().setFromObject(model);
        const escala = ALCADA_GOLEM / (caixa.max.y - caixa.min.y || 1);
        const midaCentre = caixa.getCenter(new THREE.Vector3());
        model.scale.setScalar(escala);
        // Peus a terra i centrat en x i z.
        model.position.set(-midaCentre.x * escala, -caixa.min.y * escala, -midaCentre.z * escala);
        golem.add(model);
        // Llum que puja del terra: verd-daurat a ran de terra sota el golem, que l'il·lumina des de baix.
        // Deu focus de llum en circumferència de 1,5 m al voltant del golem, a la mateixa alçada que la llum del
        // terra i enfocats cap al pit (uns 2 m d'alçada).
        const RADI_LLUM = 1.5;
        const ALCADA_LLUM = 0.1;
        const ALCADA_PIT = 2.0;
        // La llum que il·lumina els peus, com abans: un punt a terra, davant del golem.
        const llumPeus = new THREE.PointLight(0xc8e07a, 0.7, 4);
        llumPeus.position.set(0, 0.05, 0.4);
        golem.add(llumPeus);
        for (let k = 0; k < 10; k++) {
          const angle = (k / 10) * Math.PI * 2;
          const focus = new THREE.SpotLight(0xc8e07a, 2.0, 6, 0.7, 0.6, 1.5);
          focus.position.set(Math.cos(angle) * RADI_LLUM, ALCADA_LLUM, Math.sin(angle) * RADI_LLUM);
          focus.target.position.set(0, ALCADA_PIT, 0);
          golem.add(focus);
          golem.add(focus.target);
        }
        // Ulls vermells: dues esferes i una llum vermella, enganxades a l'os del cap perquè es mouen amb el cap.
        // La posició es calcula en el volum del model (cap a dalt, mirant cap a +Z) i després es passa a
        // coordenades del cap, un cop el model és a l'escena.
        const alcadaRaw = caixa.max.y - caixa.min.y || 1;
        const xCentre = (caixa.max.x + caixa.min.x) / 2;
        const zOlls = (caixa.min.z + caixa.max.z) / 2 + 0.108 * alcadaRaw;
        const yOlls = caixa.max.y - 0.091 * alcadaRaw;
        const ulls = [
          new THREE.Vector3(xCentre - 0.018 * alcadaRaw, yOlls, zOlls),
          new THREE.Vector3(xCentre + 0.034 * alcadaRaw, yOlls, zOlls),
        ];
        const capOs = model.getObjectByName("head");
        if (capOs) {
          golem.updateMatrixWorld(true);
          const materialOll = new THREE.MeshBasicMaterial({ color: 0xff1a1a });
          const llumOlls = new THREE.PointLight(0xff1a1a, 0.25, 1.5);
          // L'os del cap hereta l'escala de l'arrel del rig: el radi de l'ull es corregeix perquè surti a la mida
          // que volem en el món.
          const escalaCap = new THREE.Vector3();
          capOs.getWorldScale(escalaCap);
          const radiUll = (0.008 * alcadaRaw * escala) / escalaCap.x;
          for (const posModel of ulls) {
            const posCap = capOs.worldToLocal(model.localToWorld(posModel.clone()));
            const oll = new THREE.Mesh(new THREE.SphereGeometry(radiUll, 12, 10), materialOll);
            oll.position.copy(posCap);
            capOs.add(oll);
          }
          llumOlls.position.copy(capOs.worldToLocal(model.localToWorld(new THREE.Vector3(xCentre, yOlls, zOlls))));
          capOs.add(llumOlls);
        }
        // Caminar i senyalar (beckon) amb els clips de les animacions; els ossos tenen els noms de Mesh2Motion.
        mixerGolem = new THREE.AnimationMixer(model);
        accioCaminar = mixerGolem.clipAction(gltfCaminar.animations[0]);
        accioCaminar.setLoop(THREE.LoopRepeat, Infinity);
        // El senyal es fa una vegada cada vegada que el golem el necessita i queda aturat al darrer fotograma.
        accioSaludar = mixerGolem.clipAction(gltfSaludar.animations[0]);
        accioSaludar.setLoop(THREE.LoopOnce, 1);
        accioSaludar.clampWhenFinished = true;
        accioAssenyalar = mixerGolem.clipAction(gltfAssenyalar.animations[0]);
        accioAssenyalar.setLoop(THREE.LoopRepeat, Infinity);
        const total = NX * NZ + NVERTEXS_FORAT;
        const pos = new Float32Array(total * 3);
        const seed = new Float32Array(total);
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
        // Vèrtexs extra al disc del forat, perquè l'embut tingui prou punts.
        for (let j = 0; j < NVERTEXS_FORAT; j++) {
          const angle = Math.random() * Math.PI * 2;
          const radi = RADI_FORAT * Math.sqrt(Math.random());
          pos[i * 3] = centre.x + Math.cos(angle) * radi;
          pos[i * 3 + 1] = 0;
          pos[i * 3 + 2] = centre.z + Math.sin(angle) * radi;
          seed[i] = Math.random();
          i++;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

        const uniforms = {
          uTime: { value: 0 },
          uPR: { value: 1 },
          uAlcada: { value: ALCADA_CEL },
          uCam: { value: new THREE.Vector2() },
          uCentre: { value: new THREE.Vector2(centre.x, centre.z) },
          uOnades: { value: Array.from({ length: 90 }, () => new THREE.Vector3(0, 0, -100)) },
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

        // Tres anells de runes, un damunt de l'altre al voltant del punt final. Es giren amb el dit: cada anell té
        // 8 posicions, i quan els tres són a la combinació correcta, apareix el símbol de la terra sobre el con.
        const OBJECTIU_ANELLS = [2, 5, 7];
        const PAS_ANELL = (2 * Math.PI) / 8;
        const RADI_ANELLS = 5;
        const lienzoRunes = document.createElement("canvas");
        lienzoRunes.width = 4096;
        lienzoRunes.height = 260;
        const ctxRunes = lienzoRunes.getContext("2d");
        if (ctxRunes) {
          const escalaRuna = 1.5;
          const lletres = [...INSCRIPCIO_RUNES];
          const paths: string[] = [];
          let x = 0;
          while (x < lienzoRunes.width) {
            for (const ch of lletres) {
              const g = GLIFS_RUNES[ch];
              if (!g || x >= lienzoRunes.width) continue;
              paths.push(`<path d="${g.d}" transform="translate(${x.toFixed(1)} 200) scale(${escalaRuna})"/>`);
              x += g.amplada * escalaRuna + 30;
            }
          }
          const svgRunes =
            `<svg xmlns="http://www.w3.org/2000/svg" width="4096" height="260" viewBox="0 0 4096 260">` +
            `<g fill="rgb(255,255,255)">${paths.join("")}</g></svg>`;
          const imatgeRunes = new Image();
          imatgeRunes.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgRunes);
          await imatgeRunes.decode().catch(() => {});
          ctxRunes.drawImage(imatgeRunes, 0, 0, lienzoRunes.width, lienzoRunes.height);
        }
        const texturaRunes = new THREE.CanvasTexture(lienzoRunes);
        // Cada anell té el seu material: així es pot tenyir de verd a mesura que s'acosta al seu número.
        const matsAnells = ALCADES_ANELLS.map(
          () => new THREE.MeshBasicMaterial({ map: texturaRunes, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
        );
        const geomAnell = new THREE.CylinderGeometry(RADI_ANELLS, RADI_ANELLS, 0.9, 96, 1, true);
        const anells = ALCADES_ANELLS.map((alcada, k) => {
          const anell = new THREE.Mesh(geomAnell, matsAnells[k]);
          anell.position.set(centre.x, alcada, centre.z);
          escena.add(anell);
          return anell;
        });

        // Símbol de la terra (triangle invertit amb una línia) que apareix sobre el con quan es resol.
        const lienzoTerra = document.createElement("canvas");
        lienzoTerra.width = 256;
        lienzoTerra.height = 256;
        const ctxTerra = lienzoTerra.getContext("2d");
        if (ctxTerra) {
          ctxTerra.strokeStyle = "rgb(150, 255, 110)";
          ctxTerra.lineWidth = 14;
          ctxTerra.shadowColor = "rgb(120, 255, 90)";
          ctxTerra.shadowBlur = 16;
          ctxTerra.beginPath();
          ctxTerra.moveTo(40, 60);
          ctxTerra.lineTo(216, 60);
          ctxTerra.lineTo(128, 220);
          ctxTerra.closePath();
          ctxTerra.stroke();
          ctxTerra.beginPath();
          ctxTerra.moveTo(70, 130);
          ctxTerra.lineTo(186, 130);
          ctxTerra.stroke();
        }
        const matSimbol = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(lienzoTerra), transparent: true, opacity: 0, depthWrite: false });
        const simbolTerra = new THREE.Sprite(matSimbol);
        // Uns 1 m: un terç de l'alçada del Gollem.
        simbolTerra.scale.set(1, 1, 1);
        simbolTerra.position.set(centre.x, 1.5, centre.z);
        escena.add(simbolTerra);
        let opacitatSimbol = 0;
        // 0 = anells en joc; 1 = tots resolts: es tornen verds i desapareixen.
        let progresResolt = 0;
        // Flaix blanc i pulsació quan un anell es fixa: 1 just al fixar-se, i es va apagant.
        const flaixAnells = [0, 0, 0];
        // Diferència amb el número correcte al quadre anterior, per detectar quan el travessa.
        const diferenciaAnterior = [NaN, NaN, NaN];

        // Estelles fugaces: 30, cada una amb el seu temps, que cauen a l'atzar cap a un punt a 50 m davant de
        // l'observador (dispersat). Cua de fins a 12 m, densa, en gradient fins a invisible, i que s'estreny fins a 1/10.
        const NUM_ESTELLES = 90;
        const TRAIL_ESTELLA = 80;
        const LLARG_CUA = 12;
        const PARTICULES_IMPACTE = 40;
        const CICLE_ESTELLA = 15;
        const T_IMPACTE = 5.3;
        const DURADA_IMPACTE = 1.5;
        const GRAVETAT = 6;
        const estelles = Array.from({ length: NUM_ESTELLES }, () => ({
          fase: Math.random() * CICLE_ESTELLA,
          cicleAnterior: 99,
          impacteRegistrat: false,
          inici: new THREE.Vector3(),
          impacte: new THREE.Vector3(),
          dir: new THREE.Vector3(1, 0, 0),
          dirsImpacte: Array.from({ length: PARTICULES_IMPACTE }, () => {
            const theta = Math.random() * Math.PI * 2;
            const elev = 0.2 + Math.random() * 1.0;
            const v = 1.5 + Math.random() * 3;
            return { x: Math.cos(theta) * Math.cos(elev) * v, y: Math.sin(elev) * v, z: Math.sin(theta) * Math.cos(elev) * v };
          }),
        }));
        const TOTAL_CUA = NUM_ESTELLES * (TRAIL_ESTELLA + 1);
        const posEstella = new Float32Array(TOTAL_CUA * 3);
        const alfaEstella = new Float32Array(TOTAL_CUA);
        const midaEstella = new Float32Array(TOTAL_CUA);
        const geoEstella = new THREE.BufferGeometry();
        geoEstella.setAttribute("position", new THREE.BufferAttribute(posEstella, 3));
        geoEstella.setAttribute("aAlpha", new THREE.BufferAttribute(alfaEstella, 1));
        geoEstella.setAttribute("aMida", new THREE.BufferAttribute(midaEstella, 1));
        geoEstella.setAttribute("aCol", new THREE.BufferAttribute(new Float32Array(TOTAL_CUA * 3).fill(1), 3));
        const matEstella = new THREE.ShaderMaterial({
          uniforms: { uPR: uniforms.uPR, uCam: uniforms.uCam, uCol: { value: new THREE.Vector3(1.0, 0.97, 0.85) }, uMida: { value: 1.5 }, uMax: { value: 36 } },
          vertexShader: CAIGUDA_VERTEX,
          fragmentShader: FRAGMENT,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const puntsEstella = new THREE.Points(geoEstella, matEstella);
        puntsEstella.frustumCulled = false;
        escena.add(puntsEstella);
        const TOTAL_IMPACTE = NUM_ESTELLES * PARTICULES_IMPACTE;
        const posImpacte = new Float32Array(TOTAL_IMPACTE * 3);
        const alfaImpacte = new Float32Array(TOTAL_IMPACTE);
        const midaImpacte = new Float32Array(TOTAL_IMPACTE).fill(1);
        const geoImpacte = new THREE.BufferGeometry();
        geoImpacte.setAttribute("position", new THREE.BufferAttribute(posImpacte, 3));
        geoImpacte.setAttribute("aAlpha", new THREE.BufferAttribute(alfaImpacte, 1));
        geoImpacte.setAttribute("aMida", new THREE.BufferAttribute(midaImpacte, 1));
        const colImpacte = new Float32Array(TOTAL_IMPACTE * 3);
        geoImpacte.setAttribute("aCol", new THREE.BufferAttribute(colImpacte, 3));
        const matImpacte = new THREE.ShaderMaterial({
          uniforms: { uPR: uniforms.uPR, uCam: uniforms.uCam, uCol: { value: new THREE.Vector3(0.6, 1.0, 0.5) }, uMida: { value: 1 }, uMax: { value: 10 } },
          vertexShader: CAIGUDA_VERTEX,
          fragmentShader: FRAGMENT,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const puntsImpacte = new THREE.Points(geoImpacte, matImpacte);
        puntsImpacte.frustumCulled = false;
        escena.add(puntsImpacte);


        // Malla del cel: geometria pròpia (altra graella i altres vèrtexs), en blau i sense forat.
        const totalCel = NX_CEL * NZ_CEL + NVERTEXS_FORAT;
        const posCel = new Float32Array(totalCel * 3);
        const seedCel = new Float32Array(totalCel);
        let k = 0;
        const pasXCel = (MALLA_X1 - MALLA_X0) / (NX_CEL - 1);
        const pasZCel = (MALLA_Z1 - MALLA_Z0) / (NZ_CEL - 1);
        for (let ix = 0; ix < NX_CEL; ix++) {
          for (let iz = 0; iz < NZ_CEL; iz++) {
            posCel[k * 3] = MALLA_X0 + ix * pasXCel + (Math.random() - 0.5) * pasXCel * 0.9;
            posCel[k * 3 + 1] = ALCADA_CEL;
            posCel[k * 3 + 2] = MALLA_Z0 + iz * pasZCel + (Math.random() - 0.5) * pasZCel * 0.9;
            seedCel[k] = Math.random();
            k++;
          }
        }
        // Vèrtexs extra al disc del con del cel, igual que al terra.
        for (let j = 0; j < NVERTEXS_FORAT; j++) {
          const angle = Math.random() * Math.PI * 2;
          const radi = RADI_FORAT * Math.sqrt(Math.random());
          posCel[k * 3] = centre.x + Math.cos(angle) * radi;
          posCel[k * 3 + 1] = ALCADA_CEL;
          posCel[k * 3 + 2] = centre.z + Math.sin(angle) * radi;
          seedCel[k] = Math.random();
          k++;
        }
        const geoCel = new THREE.BufferGeometry();
        geoCel.setAttribute("position", new THREE.BufferAttribute(posCel, 3));
        geoCel.setAttribute("aSeed", new THREE.BufferAttribute(seedCel, 1));
        const materialCel = new THREE.ShaderMaterial({
          uniforms: {
            uTime: uniforms.uTime,
            uPR: uniforms.uPR,
            uCam: uniforms.uCam,
            uAlcada: uniforms.uAlcada,
            uCentre: uniforms.uCentre,
            uBaixa: { value: new THREE.Vector3(0.1, 0.3, 0.7) },
            uAlta: { value: new THREE.Vector3(0.55, 0.8, 1.0) },
          },
          vertexShader: SKY_VERTEX,
          fragmentShader: FRAGMENT,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        escena.add(new THREE.Points(geoCel, materialCel));


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

        // Estelles: cada una té el seu temps. Quan comença un cicle nou, tria un punt d'impacte a l'atzar sobre el terra i una direcció de caiguda a 25° de la vertical. La cua es dibuixa fins a 4 m darrere la punta.
        for (let i = 0; i < NUM_ESTELLES; i++) {
          const e = estelles[i];
          const tC = ((ara - inici) / 1000 + e.fase) % CICLE_ESTELLA;
          if (tC < e.cicleAnterior) {
            // Punt d'impacte a l'atzar sobre tota la malla del terra (no només davant de l'observador).
            const ox = MALLA_X0 + Math.random() * (MALLA_X1 - MALLA_X0);
            const oz = MALLA_Z0 + Math.random() * (MALLA_Z1 - MALLA_Z0);
            e.impacte.set(ox, 0.02, oz);
            // Cada estella té la seva direcció i el seu angle de caiguda, a l'atzar (entre 8° i 12° de la vertical, al voltant de 10°).
            const az = Math.random() * Math.PI * 2;
            const angle = ((8 + Math.random() * 4) * Math.PI) / 180;
            const distancia = 60;
            e.inici.set(
              ox - Math.cos(az) * Math.sin(angle) * distancia,
              Math.cos(angle) * distancia,
              oz - Math.sin(az) * Math.sin(angle) * distancia,
            );
            e.dir.copy(e.impacte).sub(e.inici).normalize();
            e.impacteRegistrat = false;
          }
          e.cicleAnterior = tC;

          // Cua: el cap és gran i la cua s'estreny fins a 1/10 a 4 m de distància.
          const base = i * (TRAIL_ESTELLA + 1);
          if (tC < T_IMPACTE) {
            const cap = e.inici.clone().lerp(e.impacte, tC / T_IMPACTE);
            for (let k = 0; k <= TRAIL_ESTELLA; k++) {
              const fraccio = k / TRAIL_ESTELLA;
              const pt = cap.clone().addScaledVector(e.dir, -fraccio * LLARG_CUA);
              const j = base + k;
              posEstella[j * 3] = pt.x;
              posEstella[j * 3 + 1] = pt.y;
              posEstella[j * 3 + 2] = pt.z;
              alfaEstella[j] = Math.pow(1 - fraccio, 1.5);
              midaEstella[j] = 1 - 0.9 * fraccio;
            }
          } else {
            for (let k = 0; k <= TRAIL_ESTELLA; k++) alfaEstella[base + k] = 0;
          }

          // Impacte: les partícules salten des del punt d'impacte i cauen.
          const edat = tC - T_IMPACTE;
          // En impactar, es registra la ona (posició i instant) perquè el terra l'expandeixi.
          if (tC >= T_IMPACTE && !e.impacteRegistrat) {
            e.impacteRegistrat = true;
            uniforms.uOnades.value[i].set(e.impacte.x, e.impacte.z, (ara - inici) / 1000);
          }
          for (let q = 0; q < PARTICULES_IMPACTE; q++) {
            const j = i * PARTICULES_IMPACTE + q;
            if (edat > 0 && edat < DURADA_IMPACTE) {
              const d = e.dirsImpacte[q];
              posImpacte[j * 3] = e.impacte.x + d.x * edat;
              posImpacte[j * 3 + 1] = Math.max(0.02, e.impacte.y + d.y * edat - 0.5 * GRAVETAT * edat * edat);
              posImpacte[j * 3 + 2] = e.impacte.z + d.z * edat;
              alfaImpacte[j] = 1 - edat / DURADA_IMPACTE;
              // Espurnes blaves que es tornen verdes en apagar-se.
              const fraccioColor = Math.min(1, edat / DURADA_IMPACTE);
              colImpacte[j * 3] = 0.3 + (0.6 - 0.3) * fraccioColor;
              colImpacte[j * 3 + 1] = 0.6 + (1.0 - 0.6) * fraccioColor;
              colImpacte[j * 3 + 2] = 1.0 + (0.5 - 1.0) * fraccioColor;
            } else {
              alfaImpacte[j] = 0;
            }
          }
        }
        geoEstella.attributes.position.needsUpdate = true;
        geoEstella.attributes.aAlpha.needsUpdate = true;
        geoEstella.attributes.aMida.needsUpdate = true;
        geoImpacte.attributes.position.needsUpdate = true;
        geoImpacte.attributes.aAlpha.needsUpdate = true;
        geoImpacte.attributes.aCol.needsUpdate = true;


          cam.position.set(sobreCami.x, ALCADA_OLLS, sobreCami.z);
          cam.rotation.set(m.elevacio * RAD, -m.rumb * RAD, 0);
          uniforms.uCam.value.set(sobreCami.x, sobreCami.z);

          // El gegant segueix el jugador (mostreig cada 0,5 s) i camina cap a la fita.
          const pas = seguiment.update(ara, sobreCami.x, sobreCami.z);
          golemRef.current = { x: pas.x, z: pas.z };
          golem.position.set(pas.x, 0, pas.z);
          // El gir és continu: el golem gira cap a la direcció que toca a 2,5 rad/s, sense saltar.
          const dtGolem = Math.min(0.1, (ara - ultimFrameGolem) / 1000);
          if (yawGolem === null) yawGolem = pas.yaw;
          const diferencia = Math.atan2(Math.sin(pas.yaw - yawGolem), Math.cos(pas.yaw - yawGolem));
          const maxGir = 2.5 * dtGolem;
          yawGolem += Math.max(-maxGir, Math.min(maxGir, diferencia));
          golem.rotation.y = yawGolem;
          if (mixerGolem) {
            mixerGolem.update(dtGolem);
            if (pas.estat !== estatAnim) canviaAnimacio(pas.estat);
          }
          ultimFrameGolem = ara;

          // Anells: la posició de cada anell és el seu angle, i la combinació és correcta quan és a l'objectiu.
          const diferencies = anells.map((anell, k) => {
            // Inèrcia: l'anell continua girant després de solt el dit, i va frenant.
            if (!anellsBloquejats.current[k] && anellActiu.current !== k) {
              anglesAnells.current[k] += velocitatAnells.current[k];
              velocitatAnells.current[k] *= 0.92;
            }
            const diferencia = Math.atan2(
              Math.sin(anglesAnells.current[k] - OBJECTIU_ANELLS[k] * PAS_ANELL),
              Math.cos(anglesAnells.current[k] - OBJECTIU_ANELLS[k] * PAS_ANELL),
            );
            // Es fixa si el número és just davant, o si l'ha travessat girant de pressa (entre dos quadres).
            const anterior = diferenciaAnterior[k];
            const travessa =
              Number.isFinite(anterior) &&
              Math.sign(anterior) !== Math.sign(diferencia) &&
              Math.min(Math.abs(anterior), Math.abs(diferencia)) < PAS_ANELL;
            diferenciaAnterior[k] = diferencia;
            // En fixar-se, l'anell va exactament al número correcte i fa el flaix.
            if (!anellsBloquejats.current[k] && (travessa || Math.abs(diferencia) < PAS_ANELL / 3)) {
              anellsBloquejats.current[k] = true;
              anglesAnells.current[k] = OBJECTIU_ANELLS[k] * PAS_ANELL;
              velocitatAnells.current[k] = 0;
              flaixAnells[k] = 1;
            }
            anell.rotation.y = anglesAnells.current[k];
            return diferencia;
          });
          const resolt = diferencies.every((diferencia) => Math.abs(diferencia) < PAS_ANELL / 3);
          progresResolt += ((resolt ? 1 : 0) - progresResolt) * 0.05;
          // Color: vermell lluny del número correcte, blau quan s'hi acosta, verd quan tots són resolts.
          diferencies.forEach((diferencia, k) => {
            const proximitat = 1 - Math.min(1, Math.abs(diferencia) / (PAS_ANELL * 2));
            const r0 = COLOR_ANELL_LLUNY.r + (COLOR_ANELL_APROP.r - COLOR_ANELL_LLUNY.r) * proximitat;
            const g0 = COLOR_ANELL_LLUNY.g + (COLOR_ANELL_APROP.g - COLOR_ANELL_LLUNY.g) * proximitat;
            const b0 = COLOR_ANELL_LLUNY.b + (COLOR_ANELL_APROP.b - COLOR_ANELL_LLUNY.b) * proximitat;
            const r = r0 + (1 - r0) * flaixAnells[k];
            const g = g0 + (1 - g0) * flaixAnells[k];
            const b = b0 + (1 - b0) * flaixAnells[k];
            // En sRGB, perquè el vermell i el blau es vegin tal com s'han definit.
            matsAnells[k].color.setRGB(
              r + (COLOR_ANELL_RESOLT.r - r) * progresResolt,
              g + (COLOR_ANELL_RESOLT.g - g) * progresResolt,
              b + (COLOR_ANELL_RESOLT.b - b) * progresResolt,
              THREE.SRGBColorSpace,
            );
            flaixAnells[k] *= 0.9;
            anells[k].scale.setScalar(1 + 0.04 * flaixAnells[k]);
            matsAnells[k].opacity = 1 - progresResolt;
            anells[k].visible = progresResolt < 0.98;
          });
          opacitatSimbol += ((resolt ? 1 : 0) - opacitatSimbol) * 0.05;
          matSimbol.opacity = opacitatSimbol;
          renderer.render(escena, cam);
          frame = requestAnimationFrame(bucle);
        };
        frame = requestAnimationFrame(bucle);

        neteja = () => {
          cancelAnimationFrame(frame);
          geo.dispose();
          material.dispose();
          golem.traverse((objecte) => {
            if (objecte instanceof THREE.Mesh) objecte.geometry.dispose();
          });
          geoCel.dispose();
          texturaRunes.dispose();
          matsAnells.forEach((m) => m.dispose());
          geomAnell.dispose();
          matSimbol.map?.dispose();
          matSimbol.dispose();
          geoEstella.dispose();
          matEstella.dispose();
          geoImpacte.dispose();
          matImpacte.dispose();
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
          // Si el dit toca un anell de runes, el gira; si no, és el gest de mirar al voltant.
          const y = ev.clientY - ev.currentTarget.getBoundingClientRect().top;
          // L'anell més proper al dit, sempre que n'hi hagi un a menys de 60 px.
          let anell: number | null = null;
          let distancia = 60;
          anellsPantalla.current.forEach((py, k) => {
            if (!anellsBloquejats.current[k] && Math.abs(py - y) < distancia) {
              distancia = Math.abs(py - y);
              anell = k;
            }
          });
          anellActiu.current = anell;
          // Tocar un anell que gira el frena; després el gest el torna a girar.
          if (anell !== null) velocitatAnells.current[anell] = 0;
          punter.current = { x: ev.clientX, y: ev.clientY };
          ev.currentTarget.setPointerCapture(ev.pointerId);
        }}
        onPointerMove={(ev) => {
          if (anellActiu.current !== null && punter.current) {
            const girar = (ev.clientX - punter.current.x) * 0.02;
            anglesAnells.current[anellActiu.current] += girar;
            velocitatAnells.current[anellActiu.current] = girar;
            punter.current = { x: ev.clientX, y: ev.clientY };
            return;
          }
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
          anellActiu.current = null;
        }}
        onPointerCancel={() => {
          punter.current = null;
          anellActiu.current = null;
        }}
      />
    </>
  );
}
