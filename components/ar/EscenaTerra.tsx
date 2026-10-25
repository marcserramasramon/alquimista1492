"use client";

import type { AnimationAction, AnimationMixer } from "three";
import { useEffect, useRef, type RefObject } from "react";
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
/** Posició GPS exacta del monticle. */
export const PUNT_FORAT: PuntGps = { latitud: 41.91203206477954, longitud: 2.234635039095013 };
/** Distància (m) a la qual s'ha de estar del monticle per veure'l (posició de prova de la galeria). */
export const DISTANCIA_PROVA_FORAT_M = 15;
/** Vèrtexs extra al disc del forat, perquè l'embut tingui prou punts. */
const NVERTEXS_FORAT = 2500;
/** Radi (m) del disc del forat, al voltant del punt GPS final. */
const RADI_FORAT = 3.5;
/** Malla de punts: 160 × 100 = 16.000 vèrtexs, en metres respecte la fita (x = est, z = sud). */
const NX = 160;
const NZ = 100;
/** Malla del cel: una graella pròpia, més esbiaixada que la del terra. */
const NX_CEL = 120;
const NZ_CEL = 75;
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
 * Vèrtexs de la malla, per al terra i per al cel (la mateixa geometria, amb `uCel` = 0 o 1). El terra
 * es mou com el mar, amb diversos trens d'ona.
 */
const VERTEX = `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPR;
  uniform float uAlcada;
  uniform vec2 uCentre;
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
    p.y = yTerra;
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
        // Punts de llum: el central a terra, dos als costats a terra i dos sota els braços.
        const posicionsLlumTerra: [number, number, number][] = [
          [0, 0.05, 0.4],
          [-1.0, 0.1, 0.4],
          [1.0, 0.1, 0.4],
          [-1.8, 1.2, 0.3],
          [1.8, 1.2, 0.3],
        ];
        for (const [x, y, z] of posicionsLlumTerra) {
          const llum = new THREE.PointLight(0xc8e07a, 0.7, 4);
          llum.position.set(x, y, z);
          golem.add(llum);
        }
        // Ulls vermells: dues esferes i una llum vermella, enganxades a l'os del cap perquè es mouen amb el cap.
        // La posició es calcula en el volum del model (cap a dalt, mirant cap a +Z) i després es passa a
        // coordenades del cap, un cop el model és a l'escena.
        const alcadaRaw = caixa.max.y - caixa.min.y || 1;
        const xCentre = (caixa.max.x + caixa.min.x) / 2;
        const zOlls = (caixa.min.z + caixa.max.z) / 2 + 0.108 * alcadaRaw;
        const yOlls = caixa.max.y - 0.075 * alcadaRaw;
        const ulls = [
          new THREE.Vector3(xCentre - 0.014 * alcadaRaw, yOlls, zOlls),
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
