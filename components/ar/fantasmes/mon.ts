import type * as THREE from "three";

/**
 * Món de les ànimes: onze fantasmes encaputxats que suren al voltant del jugador, dins de la zona de
 * la fita (sense cap direcció concreta), sobre la càmera. Ve del projecte «Fantasmes vius»
 * (O:\PROJECTES AI\ghost): el cos de capa amb caputxa de cara negra i ulls vermells gairebé
 * sempre tancats, la cua llarga amb física i el to misteriós: observen de lluny, algun s'acosta
 * a poc a poc, es dissolen si se'ls mira fix o amb un flaix, i marxen si es crida.
 *
 * Tres portals de llum al terra (cian i lila) fan de punts de llum: els fantasmes en surten pujant del
 * terra i s'hi enfonsen quan els miren fix, i els que són a prop en reben llum de vora, cosa que els
 * ajuda a destacar sobre una càmera fosca.
 *
 * Aquí no hi ha res de la interfície de desenvolupament ni de l'escenografia de pistes de tennis:
 * la càmera real fa de fons i la mirada la donen la brúixola i la inclinació del mòbil.
 * Unitats en metres; el món és fix al voltant de l'usuari (nord = -Z, est = +X), i la càmera és a
 * 1,5 m d'alçada.
 */

type Tres = typeof THREE;

export interface Mirada {
  rumb: number;
  elevacio: number;
}

export interface EsdevenimentFantasma {
  /** "enfoca": el jugador té un fantasma de prop a la mira. "s-acosta": un fantasma s'acosta. */
  tipus: "enfoca" | "s-acosta";
  /** Cap a quina banda és (-1 esquerra, 1 dreta), per al so. */
  pan: number;
}

export interface OpcionsMon {
  quantitat: number;
  alEsdeveniment?: (e: EsdevenimentFantasma) => void;
}

const RAD = Math.PI / 180;
const TAIL_LEN = 3.8;
const N = 11;
const SEG = TAIL_LEN / (N - 1);
const NECK = 0.55;
const ALCADA_CAMERA = 1.5;
const FOV_HORITZONTAL = 52;

/** Zona on viuen els fantasmes, al voltant del jugador (m). */
const RADI_MIN = 7;
const RADI_MAX = 22;
const ALCADA_MIN = 1.0;
const ALCADA_MAX = 5.2;
/** Portals: a quina distància del jugador (m) i mides (m). */
const PORTAL_DIST_MIN = 10;
const PORTAL_DIST_MAX = 19;
const PORTAL_RADI_ANELL = 2.7;
const PORTAL_ALCADA_COLUMNA: [number, number] = [8, 12];
const PORTAL_PARTICULES = 45;
/** Colors dels portals (RGB 0-1). Cada portal té l'anell d'un color i la columna que passa a l'altre. */
const COLOR_CIAN: [number, number, number] = [0.2, 0.85, 1.0];
const COLOR_LILA: [number, number, number] = [0.62, 0.42, 1.0];
/** Distància a la qual s'acosta el fantasma curiós (m). */
const DIST_CURIOS = 5;

const alea = (a: number, b: number) => a + Math.random() * (b - a);
const angDiff = (a: number, b: number) => ((a - b + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
const limita = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

// ───────────────────────────── shaders ─────────────────────────────

const VERTEX = `
  uniform float uTime, uWob, uFace;
  uniform vec3 uOff[${N}];
  varying vec3 vN, vV, vP;
  varying float vFold, vWY;
  // radi de la capa segons la fondària d sota el coll: coll estret, espatlles, i cos que s'obre cap a la vora
  float capaR(float d) {
    float pinch = smoothstep(0.0, 0.18, d);
    float sh = smoothstep(0.10, 0.46, d);
    float bd = smoothstep(0.5, ${TAIL_LEN.toFixed(2)}, d);
    float pad = exp(-pow((d - 0.46) / 0.17, 2.0));
    return 0.62 - 0.12 * pinch + 0.52 * sh + 0.14 * pad + 0.22 * bd;
  }
  void main() {
    float TL = ${TAIL_LEN.toFixed(2)};
    float v = clamp(position.y > 0.0 ? position.y / 1.28 : position.y / TL, -1.0, 1.0);
    float th = atan(position.z, position.x);
    float bk = pow(max(0.0, -sin(th + uFace)), 1.3);
    float R, yy, fold = 0.0;
    vec3 nc;
    if (v >= 0.0) {
      float sp = sqrt(max(0.0, 1.0 - v * v));
      R = 0.62 * pow(sp, 0.5) + 0.10 * bk * sp; yy = v * 1.45;
      nc = normalize(vec3(cos(th) * sp, 0.25 + v * 0.8, sin(th) * sp));
    } else {
      float s = -v, d = s * TL;
      R = capaR(d); yy = -d;
      R += bk * (0.10 + 0.20 * smoothstep(0.0, 0.4, d)) * (1.0 - smoothstep(1.0, 1.3, d));
      float fa = sin(th * 9.0 + position.y * 0.9) * 0.6 + sin(th * 5.0 - position.y * 0.5 + 1.7) * 0.4;
      fold = fa * smoothstep(0.12, 0.45, s);
      R *= 1.0 + 0.09 * fold;
      float hem = smoothstep(0.72, 1.0, s);
      float tip = pow(0.5 + 0.5 * sin(th * 6.0 + sin(th * 3.0) * 1.3), 2.2);
      yy -= hem * (0.15 + 0.7 * tip);
      R *= 1.0 - 0.18 * hem * (1.0 - tip);
      float sl = (capaR(d + 0.06) - capaR(d)) / 0.06;
      nc = normalize(vec3(cos(th), 0.2 + 1.3 * clamp(sl, 0.0, 1.5), sin(th)));
    }
    vec3 p = vec3(cos(th) * R, yy, sin(th) * R);
    float wn = clamp((${NECK.toFixed(2)} - p.y) / ${(TAIL_LEN + NECK).toFixed(2)}, 0.0, 1.0);
    float wob = sin(p.y * 3.0 + uTime * 3.0 + p.x * 2.0) * 0.035 + sin(p.x * 4.0 + p.z * 3.0 + uTime * 2.3) * 0.02;
    p.xz *= 1.0 + wob * (0.4 + wn * 1.6) + uWob * 0.12 * sin(p.y * 6.0 - uTime * 14.0);
    p.x += sin(p.y * 5.0 + uTime * 4.0) * 0.05 * wn;
    p.z += cos(p.y * 4.0 + uTime * 3.4) * 0.05 * wn;
    float f = wn * ${(N - 1).toFixed(1)};
    vec3 off = uOff[0];
    for (int i = 0; i < ${N - 1}; i++) off += (uOff[i + 1] - uOff[i]) * clamp(f - float(i), 0.0, 1.0);
    p += off;
    vN = normalize(normalMatrix * nc);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vV = -mv.xyz; vP = p; vFold = fold;
    vWY = (modelMatrix * vec4(p, 1.0)).y;
    gl_Position = projectionMatrix * mv;
  }`;

const FRAGMENT = `
  uniform vec3 uCore, uRim;
  uniform float uTime, uFace, uGlow, uFade;
  varying vec3 vN, vV, vP;
  varying float vFold, vWY;
  // soroll de valor 3D: dona a la boira dels peus clapes i remolins que es mouen
  float h31(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float vnoise(vec3 x) {
    vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  void main() {
    vec3 nn = normalize(vN);
    float ndv = abs(dot(nn, normalize(vV)));
    // tela fosca, amb llum freda de dalt i de vora (perquè es vegi sobre una càmera fosca)
    float diff = max(0.0, dot(nn, normalize(vec3(-0.35, 0.65, 0.45))));
    float fr = pow(1.0 - ndv, 2.4);
    float shade = 0.35 + 0.65 * (0.5 + 0.5 * vFold);
    vec3 col = vec3(0.075, 0.08, 0.10) * (0.4 + 0.9 * diff) * shade + uRim * fr * 0.45 + uCore * 0.05;
    col += uRim * (uGlow - 1.0) * 0.9 + vec3(0.6) * (uGlow - 1.0) * 0.12;
    // cara negra del tot, cap on mira la cara
    float fwd = vP.x * sin(uFace) + vP.z * cos(uFace);
    float lat = vP.x * cos(uFace) - vP.z * sin(uFace);
    float hole = fwd > 0.0 ? smoothstep(0.62, 0.34, length(vec2(lat * 1.35, (vP.y - 0.5) * 1.15))) : 0.0;
    col = mix(col, vec3(0.0), hole);
    vec3 q = vP * 1.7 + vec3(uTime * 0.10, -uTime * 0.38, uTime * 0.07);
    float n2 = vnoise(q) * 0.6 + vnoise(q * 2.3 + 7.0) * 0.4;
    float mistH = smoothstep(${(-0.62 * TAIL_LEN).toFixed(2)}, ${(-1.04 * TAIL_LEN).toFixed(2)}, vP.y);   // la vora es converteix en boira
    col = mix(col, mix(uCore, vec3(1.0), 0.25) * 0.5, mistH * 0.85);
    float a = 0.97 * smoothstep(0.0, 0.2, ndv);                 // contorn que es dissol una mica
    a *= mix(1.0, smoothstep(0.15, 0.75, n2), mistH);
    float thr = (1.0 - uFade) * 1.25 - 0.1;                     // dissolució amb soroll: fade 1 = sencer, 0 = res
    a *= smoothstep(thr - 0.12, thr + 0.12, n2);
    a *= mix(1.0, 0.5, smoothstep(8.0, 48.0, length(vV)));      // perspectiva atmosfèrica
    a *= smoothstep(0.0, 0.35, vWY);                            // la part que queda sota terra s'amaga
    gl_FragColor = vec4(col, a);
  }`;

// ───────────────────────────── fantasma ─────────────────────────────

// emergeix: puja del terra per un portal; enfonsa: va a un portal i s'hi enfonsa.
type Estat = "ocult" | "emergeix" | "deriva" | "curios" | "dissolt" | "fuig" | "enfonsa" | "persegueix" | "porta";

class Fantasma {
  readonly grup: THREE.Group;
  readonly cara: THREE.Group;
  readonly cos: THREE.Mesh;
  readonly halo: THREE.Sprite;
  readonly ullL: THREE.Mesh;
  readonly ullR: THREE.Mesh;
  readonly mat: THREE.ShaderMaterial;
  readonly matUlls: THREE.MeshBasicMaterial;
  readonly matHalo: THREE.SpriteMaterial;
  readonly offs: THREE.Vector3[];
  readonly cadena: THREE.Vector3[];
  readonly prev: THREE.Vector3[];
  readonly head: THREE.Vector3;
  readonly vel: THREE.Vector3;
  readonly home = { x: 0, y: 3, z: -10 };
  readonly objectiu: THREE.Vector3;
  readonly s: number;
  readonly fase = Math.random() * 100;
  readonly sp = 0.18 + Math.random() * 0.22;
  readonly id: number;
  estat: Estat = "ocult";
  fade = 0;
  glow = 1;
  /** Temps a l'estat actual (s) o espera abans de tornar (en "ocult"). */
  t = 0;
  espera = 0;
  duradaDissol = 1.4;
  /** Quant fa que el jugador el té a la mira (ms) i si ja s'ha dit. */
  mirat = 0;
  enfocatDit = false;
  apropDit = false;
  wob = 0;
  dist = 99;
  /** Llum de vora que rep d'un portal proper (0-0,9). */
  llum = 0;
  /** Portal on s'enfonsa i si encara hi va (0) o ja s'hi enfonsa (1). */
  portalDesti: { x: number; z: number } | null = null;
  fase2 = 0;
  /** Temps fins al proper punt de la ronda (s), quan patrulla. */
  patrulla = 0;
  /** L'esperit que persegueix (estat "persegueix"). */
  victima: Esperit | null = null;

  constructor(
    readonly T: Tres,
    idx: number,
    geo: THREE.BufferGeometry,
    circle: THREE.BufferGeometry,
    mapUll: THREE.Texture,
    mapHalo: THREE.Texture,
    uTime: { value: number },
    scene: THREE.Scene
  ) {
    this.id = idx;
    this.s = alea(0.55, 0.85);
    this.head = new T.Vector3();
    this.vel = new T.Vector3();
    this.objectiu = new T.Vector3();
    this.offs = Array.from({ length: N }, () => new T.Vector3());
    this.cadena = Array.from({ length: N }, () => new T.Vector3());
    this.prev = Array.from({ length: N }, () => new T.Vector3());
    const hue = 0.5 + (Math.random() - 0.3) * 0.18;
    const core = new T.Color().setHSL(hue, 0.9, 0.68);
    const rim = new T.Color().setHSL(hue, 0.7, 0.92);
    this.mat = new T.ShaderMaterial({
      transparent: true,
      depthWrite: true,
      side: T.DoubleSide,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uTime,
        uOff: { value: this.offs },
        uWob: { value: 0 },
        uCore: { value: core },
        uRim: { value: rim },
        uFace: { value: 0 },
        uGlow: { value: 1 },
        uFade: { value: 0 },
      },
    });
    this.grup = new T.Group();
    this.grup.scale.setScalar(this.s);
    this.cos = new T.Mesh(geo, this.mat);
    this.cos.frustumCulled = false;
    this.grup.add(this.cos);
    // Ulls petits, rodons i vermells, gairebé sempre tancats, damunt la cara negra.
    this.cara = new T.Group();
    this.cara.rotation.order = "YXZ";
    this.matUlls = new T.MeshBasicMaterial({
      map: mapUll,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      depthTest: false,
      blending: T.AdditiveBlending,
    });
    this.ullL = new T.Mesh(circle, this.matUlls);
    this.ullR = new T.Mesh(circle, this.matUlls);
    this.ullL.position.set(-0.13, 0.5, 0.6);
    this.ullR.position.set(0.13, 0.5, 0.6);
    this.ullL.scale.set(0.085, 0.085, 1);
    this.ullR.scale.set(0.085, 0.085, 1);
    this.cara.add(this.ullL, this.ullR);
    this.grup.add(this.cara);
    this.matHalo = new T.SpriteMaterial({
      map: mapHalo,
      blending: T.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.12,
    });
    this.halo = new T.Sprite(this.matHalo);
    this.halo.scale.set(5.2, 5.2, 1);
    this.halo.position.set(0, -0.2, -0.3);
    this.grup.add(this.halo);
    this.grup.visible = false;
    scene.add(this.grup);
  }

  /** Posa el fantasma a un nou punt (amb la cua penjant recta) i el deixa invisible. */
  colloca(x: number, y: number, z: number) {
    this.head.set(x, y, z);
    this.vel.set(0, 0, 0);
    const sw = SEG * this.s;
    for (let i = 0; i < N; i++) {
      this.cadena[i].set(x, y - i * sw, z);
      this.prev[i].copy(this.cadena[i]);
      this.offs[i].set(0, 0, 0);
    }
  }

  /** Física, cara i uniforms. `cam` és la posició de la càmera. */
  actualitza(dt: number, t: number, cam: THREE.Vector3) {
    const k = dt * 60;
    const s = this.s;
    const head = this.head;
    const vel = this.vel;
    const mouArrel = this.estat !== "ocult";
    if (mouArrel) {
      let sx: number;
      let sy: number;
      let sz: number;
      if (this.estat === "curios" || this.estat === "fuig" || this.estat === "emergeix" || this.estat === "enfonsa" || this.estat === "persegueix" || this.estat === "porta") {
        sx = this.objectiu.x;
        sy = this.objectiu.y;
        sz = this.objectiu.z;
      } else {
        const R = 1.2;
        sx = this.home.x + Math.sin(t * this.sp + this.fase) * R;
        sz = this.home.z + Math.cos(t * this.sp * 0.83 + this.fase * 1.3) * R;
        sy = this.home.y + Math.sin(t * this.sp * 1.7 + this.fase * 0.7) * 0.4 + Math.sin(t * 1.9 + this.fase) * 0.08 * s;
      }
      const kk = 0.012 * k * (this.estat === "fuig" ? 3 : this.estat === "curios" || this.estat === "enfonsa" ? 1.4 : this.estat === "persegueix" ? 2.4 : this.estat === "porta" ? 1.6 : 1);
      vel.x += (sx - head.x) * kk;
      vel.y += (sy - head.y) * kk;
      vel.z += (sz - head.z) * kk;
      vel.multiplyScalar(Math.pow(0.9, k));
      const maxVel =
        this.estat === "fuig" ? 0.3 : this.estat === "curios" ? 0.06 : this.estat === "enfonsa" ? 0.035 : this.estat === "emergeix" ? 0.03 : this.estat === "persegueix" ? 0.115 : this.estat === "porta" ? 0.07 : 0.03;
      const vl = vel.length();
      if (vl > maxVel) vel.multiplyScalar(maxVel / vl);
      head.addScaledVector(vel, k);
    }
    this.grup.position.copy(head);

    // Cara cap al jugador.
    const dx = cam.x - head.x;
    const dz = cam.z - head.z;
    const dy = cam.y - head.y;
    const hd = Math.hypot(dx, dz);
    this.dist = Math.hypot(dx, dy, dz);
    this.cara.rotation.y += angDiff(Math.atan2(dx, dz), this.cara.rotation.y) * 0.1;
    this.cara.rotation.x += (limita(-Math.atan2(dy, hd), -0.6, 0.6) - this.cara.rotation.x) * 0.1;

    // Cua (Verlet), en unitats de món.
    const sw = SEG * s;
    const c = this.cadena;
    const prev = this.prev;
    c[0].copy(head);
    for (let i = 1; i < N; i++) {
      const p = c[i];
      const q = prev[i];
      const vx = (p.x - q.x) * 0.93;
      const vy = (p.y - q.y) * 0.93;
      const vz = (p.z - q.z) * 0.93;
      q.copy(p);
      p.x += vx;
      p.y += vy - 0.0006 * s;
      p.z += vz;
      p.x += (head.x - p.x) * 0.006 * i * 0.35;
      p.y += (head.y - i * sw - p.y) * 0.02;
      p.z += (head.z - p.z) * 0.006 * i * 0.35;
    }
    for (let it = 0; it < 4; it++) {
      c[0].copy(head);
      for (let i = 1; i < N; i++) {
        const a = c[i - 1];
        const b = c[i];
        const ex = b.x - a.x;
        const ey = b.y - a.y;
        const ez = b.z - a.z;
        const d = Math.hypot(ex, ey, ez) || 1e-6;
        const f = sw / d;
        b.set(a.x + ex * f, a.y + ey * f, a.z + ez * f);
      }
    }
    for (let i = 0; i < N; i++) this.offs[i].set((c[i].x - head.x) / s, (c[i].y - (head.y - i * sw)) / s, (c[i].z - head.z) / s);

    this.wob *= Math.pow(0.93, k);
    const u = this.mat.uniforms;
    u.uWob.value = this.wob;
    u.uFace.value = this.cara.rotation.y;
    u.uGlow.value = this.glow + this.llum;
    u.uFade.value = this.fade;
    this.grup.visible = this.fade > 0.01;
    // Ulls: gairebé sempre tancats; s'obren un moment cada pocs segons, i més quan el miren.
    const per = 6 + (this.id % 5) * 1.1;
    const cicle = ((t + this.fase) % per) / per;
    let obert = Math.max(0, 1 - Math.abs(cicle - 0.9) / 0.06);
    obert = obert * obert * (3 - 2 * obert);
    obert = Math.max(obert, limita(this.mirat / 600, 0, 1));
    this.ullL.scale.y = this.ullR.scale.y = 0.085 * (0.08 + 0.92 * obert);
    this.matUlls.opacity = (0.3 + 0.7 * obert) * this.fade;
    this.matHalo.opacity = 0.12 * this.fade * Math.min(this.glow, 2);
  }
}

// ───────────────────────────── portals ─────────────────────────────

const COLUMNA_VERTEX = `
  uniform float uH;
  varying vec3 vN, vV;
  varying float vY, vA;
  void main() {
    vY = position.y / uH;
    vA = atan(position.z, position.x);
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vV = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }`;

const COLUMNA_FRAGMENT = `
  uniform vec3 uA, uB;
  uniform float uTime, uPuls;
  varying vec3 vN, vV;
  varying float vY, vA;
  void main() {
    float ndv = abs(dot(normalize(vN), normalize(vV)));
    float vora = pow(ndv, 0.7);                                   // el centre de la columna és més intens que les vores
    float cap = pow(clamp(1.0 - vY, 0.0, 1.0), 1.5);               // s'esvaeix cap amunt
    float flux = 0.75 + 0.25 * sin(vA * 5.0 + uTime * 1.1 + vY * 9.0);
    vec3 col = mix(uA, uB, smoothstep(0.0, 1.0, vY));
    float a = 0.55 * vora * cap * flux * uPuls * smoothstep(0.0, 0.04, vY);
    gl_FragColor = vec4(col * 1.25, a);
  }`;

/** Portal de llum al terra: anell, columna que s'esvaeix cap amunt i partícules que pugen. */
class Portal {
  x: number;
  z: number;
  private readonly grup: THREE.Group;
  private readonly anell: THREE.Mesh;
  private readonly matAnell: THREE.MeshBasicMaterial;
  private readonly geoAnell: THREE.BufferGeometry;
  private readonly geoColumna: THREE.BufferGeometry;
  private readonly matColumna: THREE.ShaderMaterial;
  private readonly punts: THREE.Points;
  private readonly geoPunts: THREE.BufferGeometry;
  private readonly matPunts: THREE.PointsMaterial;
  private readonly pos: Float32Array;
  private readonly angle: Float32Array;
  private readonly radi: Float32Array;
  private readonly alt: Float32Array;
  private readonly vy: Float32Array;
  private readonly alcada: number;
  private readonly fase = Math.random() * 10;

  constructor(
    T: Tres,
    x: number,
    z: number,
    colorAnell: [number, number, number],
    colorColumna: [number, number, number],
    mapAnell: THREE.Texture,
    mapPunt: THREE.Texture,
    uTime: { value: number },
    escena: THREE.Scene
  ) {
    this.x = x;
    this.z = z;
    this.alcada = alea(PORTAL_ALCADA_COLUMNA[0], PORTAL_ALCADA_COLUMNA[1]);
    this.grup = new T.Group();
    this.grup.position.set(x, 0, z);

    // Anell a terra, pla, amb un nucli suau.
    this.geoAnell = new T.PlaneGeometry(PORTAL_RADI_ANELL * 2, PORTAL_RADI_ANELL * 2);
    this.matAnell = new T.MeshBasicMaterial({
      map: mapAnell,
      color: new T.Color(colorAnell[0], colorAnell[1], colorAnell[2]),
      transparent: true,
      depthWrite: false,
      blending: T.AdditiveBlending,
      opacity: 0.9,
    });
    this.anell = new T.Mesh(this.geoAnell, this.matAnell);
    this.anell.rotation.x = -Math.PI / 2;
    this.anell.position.y = 0.04;
    this.anell.renderOrder = -2000;
    this.grup.add(this.anell);

    // Columna de llum: cilindre obert, del color de l'anell a baix al de l'altre a dalt.
    this.geoColumna = new T.CylinderGeometry(0.6, 1.05, this.alcada, 28, 1, true);
    this.geoColumna.translate(0, this.alcada / 2, 0);
    this.matColumna = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: T.DoubleSide,
      blending: T.AdditiveBlending,
      vertexShader: COLUMNA_VERTEX,
      fragmentShader: COLUMNA_FRAGMENT,
      uniforms: {
        uH: { value: this.alcada },
        uA: { value: new T.Color(colorAnell[0], colorAnell[1], colorAnell[2]) },
        uB: { value: new T.Color(colorColumna[0], colorColumna[1], colorColumna[2]) },
        uTime,
        uPuls: { value: 1 },
      },
    });
    const columna = new T.Mesh(this.geoColumna, this.matColumna);
    columna.renderOrder = -1990;
    columna.frustumCulled = false;
    this.grup.add(columna);

    // Partícules que pugen per la columna.
    this.pos = new Float32Array(PORTAL_PARTICULES * 3);
    this.angle = new Float32Array(PORTAL_PARTICULES);
    this.radi = new Float32Array(PORTAL_PARTICULES);
    this.alt = new Float32Array(PORTAL_PARTICULES);
    this.vy = new Float32Array(PORTAL_PARTICULES);
    for (let i = 0; i < PORTAL_PARTICULES; i++) {
      this.angle[i] = Math.random() * Math.PI * 2;
      this.radi[i] = alea(0.1, 0.85);
      this.alt[i] = Math.random() * this.alcada * 0.7;
      this.vy[i] = alea(0.5, 1.4);
    }
    this.geoPunts = new T.BufferGeometry();
    this.geoPunts.setAttribute("position", new T.BufferAttribute(this.pos, 3));
    this.matPunts = new T.PointsMaterial({
      map: mapPunt,
      color: new T.Color(colorColumna[0], colorColumna[1], colorColumna[2]),
      size: 0.45,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: T.AdditiveBlending,
      opacity: 0.9,
    });
    this.punts = new T.Points(this.geoPunts, this.matPunts);
    this.punts.renderOrder = -1980;
    this.punts.frustumCulled = false;
    this.grup.add(this.punts);
    escena.add(this.grup);
  }

  actualitza(dt: number, t: number) {
    const puls = 0.85 + 0.15 * Math.sin(t * 1.6 + this.fase);
    this.matColumna.uniforms.uPuls.value = puls;
    this.matAnell.opacity = 0.75 + 0.25 * Math.sin(t * 1.3 + this.fase * 1.7);
    this.anell.scale.setScalar(1 + 0.03 * Math.sin(t * 1.5 + this.fase));
    for (let i = 0; i < PORTAL_PARTICULES; i++) {
      this.alt[i] += this.vy[i] * dt;
      if (this.alt[i] > this.alcada * 0.7) {
        this.alt[i] = 0;
        this.angle[i] = Math.random() * Math.PI * 2;
      }
      this.angle[i] += dt * 0.6;
      const r = this.radi[i] * (1 - this.alt[i] / (this.alcada * 1.2));
      this.pos[i * 3] = Math.cos(this.angle[i]) * r;
      this.pos[i * 3 + 1] = this.alt[i];
      this.pos[i * 3 + 2] = Math.sin(this.angle[i]) * r;
    }
    this.geoPunts.attributes.position.needsUpdate = true;
  }

  /** Canvia el portal de lloc (metres respecte al jugador: est i nord). */
  mou(x: number, z: number) {
    this.x = x;
    this.z = z;
    this.grup.position.set(x, 0, z);
  }

  /** Distància horitzontal d'un punt al portal. */
  distancia(x: number, z: number): number {
    return Math.hypot(x - this.x, z - this.z);
  }

  dispose(escena: THREE.Scene) {
    escena.remove(this.grup);
    this.geoAnell.dispose();
    this.matAnell.dispose();
    this.geoColumna.dispose();
    this.matColumna.dispose();
    this.geoPunts.dispose();
    this.matPunts.dispose();
  }
}

// ───────────────────────────── esperits (els fantasmes d'abans) ─────────────────────────────

/** Esperits que hi ha alhora. */
const QUANTITAT_ESPERITS = 5;
/** Cada quants segons arriba un esperit de fora, i a quina distància del jugador apareix (m). */
const ESPERIT_CADA_S = 5;
const ESPERIT_DIST_FORA: [number, number] = [34, 42];

const ESPERIT_VERTEX = `
  uniform float uTime, uWob;
  uniform vec3 uOff[${N}];
  varying vec3 vN, vV, vP;
  varying float vW;
  void main() {
    vec3 p = position;
    float w = clamp(-p.y / ${TAIL_LEN.toFixed(1)}, 0.0, 1.0);
    float wn = clamp((${NECK.toFixed(2)} - p.y) / ${(TAIL_LEN + NECK).toFixed(2)}, 0.0, 1.0);
    float wob = sin(p.y * 3.0 + uTime * 3.0 + p.x * 2.0) * 0.035 + sin(p.x * 4.0 + p.z * 3.0 + uTime * 2.3) * 0.02;
    p.xz *= 1.0 + wob * (0.4 + wn * 1.6) + uWob * 0.12 * sin(p.y * 6.0 - uTime * 14.0);
    p.x += sin(p.y * 5.0 + uTime * 4.0) * 0.05 * wn;
    p.z += cos(p.y * 4.0 + uTime * 3.4) * 0.05 * wn;
    float f = wn * ${(N - 1).toFixed(1)};
    vec3 off = uOff[0];
    for (int i = 0; i < ${N - 1}; i++) off += (uOff[i + 1] - uOff[i]) * clamp(f - float(i), 0.0, 1.0);
    p += off;
    vec3 n = normal;
    if (position.y < 0.0) n.y *= 0.35;
    vN = normalize(normalMatrix * n);
    vP = p;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vV = -mv.xyz;
    vW = w;
    gl_Position = projectionMatrix * mv;
  }`;

const ESPERIT_FRAGMENT = `
  uniform vec3 uCore, uRim;
  uniform float uAlpha, uTime;
  varying vec3 vN, vV, vP;
  varying float vW;
  float h31(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float vnoise(vec3 x) {
    vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  void main() {
    float ndv = abs(dot(normalize(vN), normalize(vV)));
    vec3 q = vP * 1.7 + vec3(uTime * 0.10, -uTime * 0.38, uTime * 0.07);
    float n = vnoise(q) * 0.6 + vnoise(q * 2.3 + 7.0) * 0.4;
    float dens = pow(ndv, 1.3);
    dens *= smoothstep(0.12, 0.85, n + 0.35 * ndv);
    vec3 col = mix(uCore, uRim, (1.0 - ndv) * 0.55);
    float fade = 1.0 - smoothstep(0.05, 1.0, vW);
    float air = mix(1.0, 0.35, smoothstep(8.0, 48.0, length(vV)));
    gl_FragColor = vec4(col * 1.25, dens * 1.15 * fade * uAlpha * air);
  }`;

// ocult: fora de l'escena; arriba: ve de lluny cap a la zona; deriva: voltant lliure; fuig: corre perquè el persegueixen;
// capturat: el fantasma gran se l'emporta; absorbit: puja en espiral per la columna d'un portal.
type EstatEsperit = "ocult" | "arriba" | "deriva" | "fuig" | "capturat" | "absorbit";

/** Esperit petit de boira lluminosa (el fantasma de la versió anterior): els encaputxats el persegueixen, el capturen i el porten a un portal. */
class Esperit {
  readonly grup: THREE.Group;
  readonly cara: THREE.Group;
  readonly mat: THREE.ShaderMaterial;
  readonly matUlls: THREE.MeshBasicMaterial;
  readonly matHalo: THREE.SpriteMaterial;
  readonly ullL: THREE.Mesh;
  readonly ullR: THREE.Mesh;
  readonly offs: THREE.Vector3[];
  readonly cadena: THREE.Vector3[];
  readonly prev: THREE.Vector3[];
  readonly head: THREE.Vector3;
  readonly vel: THREE.Vector3;
  readonly home = { x: 0, y: 2, z: -8 };
  readonly s: number;
  readonly fase = Math.random() * 100;
  readonly sp = 0.18 + Math.random() * 0.22;
  readonly id: number;
  estat: EstatEsperit = "ocult";
  fade = 0;
  t = 0;
  espera = 0;
  wob = 0;
  portal: Portal | null = null;
  perseguidor: Fantasma | null = null;
  private angle = 0;

  constructor(
    T: Tres,
    idx: number,
    geo: THREE.BufferGeometry,
    circle: THREE.BufferGeometry,
    mapUll: THREE.Texture,
    mapHalo: THREE.Texture,
    uTime: { value: number },
    scene: THREE.Scene
  ) {
    this.id = idx;
    this.s = alea(0.3, 0.42); // petits: els encaputxats són molt més grans
    this.head = new T.Vector3();
    this.vel = new T.Vector3();
    this.offs = Array.from({ length: N }, () => new T.Vector3());
    this.cadena = Array.from({ length: N }, () => new T.Vector3());
    this.prev = Array.from({ length: N }, () => new T.Vector3());
    const hue = 0.5 + (Math.random() - 0.3) * 0.18;
    this.mat = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: T.DoubleSide,
      blending: T.AdditiveBlending,
      vertexShader: ESPERIT_VERTEX,
      fragmentShader: ESPERIT_FRAGMENT,
      uniforms: {
        uTime,
        uOff: { value: this.offs },
        uWob: { value: 0 },
        uCore: { value: new T.Color().setHSL(hue, 0.9, 0.68) },
        uRim: { value: new T.Color().setHSL(hue, 0.7, 0.92) },
        uAlpha: { value: 0 },
      },
    });
    this.grup = new T.Group();
    this.grup.scale.setScalar(this.s);
    const cos = new T.Mesh(geo, this.mat);
    cos.frustumCulled = false;
    cos.renderOrder = 5000;
    this.grup.add(cos);
    // Ulls vermells, ovals i gairebé sempre tancats, com els de la versió treballada.
    this.cara = new T.Group();
    this.cara.rotation.order = "YXZ";
    this.matUlls = new T.MeshBasicMaterial({ map: mapUll, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }); // amb prova de profunditat: un fantasma gran els tapa
    this.ullL = new T.Mesh(circle, this.matUlls);
    this.ullR = new T.Mesh(circle, this.matUlls);
    this.ullL.position.set(-0.2, 0.25, 0.73);
    this.ullR.position.set(0.2, 0.25, 0.73);
    this.ullL.scale.set(0.12, 0.12, 1);
    this.ullR.scale.set(0.12, 0.12, 1);
    this.ullL.renderOrder = this.ullR.renderOrder = 5001;
    this.cara.add(this.ullL, this.ullR);
    this.grup.add(this.cara);
    this.matHalo = new T.SpriteMaterial({ map: mapHalo, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 });
    this.halo = new T.Sprite(this.matHalo);
    this.halo.scale.set(5.2, 5.2, 1);
    this.halo.position.set(0, -0.2, -0.3);
    this.halo.renderOrder = 4999;
    this.grup.add(this.halo);
    this.grup.visible = false;
    scene.add(this.grup);
  }

  readonly halo: THREE.Sprite;

  colloca(x: number, y: number, z: number) {
    this.head.set(x, y, z);
    this.vel.set(0, 0, 0);
    const sw = SEG * this.s;
    for (let i = 0; i < N; i++) {
      this.cadena[i].set(x, y - i * sw, z);
      this.prev[i].copy(this.cadena[i]);
      this.offs[i].set(0, 0, 0);
    }
  }

  /** Mou i dibuixa. `fugida` és la direcció (horitzontal) en què fuig d'un perseguidor, si el persegueixen. */
  actualitza(dt: number, t: number, cam: THREE.Vector3, caçador: Fantasma | null) {
    const k = dt * 60;
    const s = this.s;
    const head = this.head;
    const vel = this.vel;
    if (this.estat === "absorbit" && this.portal) {
      // Puja en espiral per la columna, es fa petit i s'esvaeix.
      this.t += dt;
      this.angle += dt * (2.2 + this.t * 1.5);
      const r = 0.9 * Math.max(0, 1 - this.t / 3.4);
      head.set(this.portal.x + Math.cos(this.angle) * r, 1.2 + this.t * 2.4, this.portal.z + Math.sin(this.angle) * r);
      this.fade = Math.max(0, 1 - this.t / 3.2);
      this.grup.scale.setScalar(s * (0.35 + 0.65 * this.fade));
      vel.set(0, 0, 0);
    } else if (this.estat === "capturat" && caçador) {
      // El fantasma gran el du agafat, davant seu (cap al jugador), perquè es vegi i no quedi dins la capa.
      let ax = cam.x - caçador.head.x;
      let az = cam.z - caçador.head.z;
      const ah = Math.hypot(ax, az) || 1;
      const davant = 0.9 + 1.2 * caçador.s;
      ax = (ax / ah) * davant;
      az = (az / ah) * davant;
      head.x += (caçador.head.x + ax + Math.sin(t * 5 + this.fase) * 0.2 - head.x) * Math.min(1, 0.25 * k);
      head.y += (caçador.head.y - 0.2 - head.y) * Math.min(1, 0.25 * k);
      head.z += (caçador.head.z + az + Math.cos(t * 4.3 + this.fase) * 0.2 - head.z) * Math.min(1, 0.25 * k);
      vel.set(0, 0, 0);
    } else if (this.estat !== "ocult") {
      let sx: number;
      let sy: number;
      let sz: number;
      let kk = 0.012;
      let maxVel = 0.035;
      if (this.estat === "fuig" && caçador) {
        // Fuig del que el persegueix, en ziga-zaga, sense sortir de la zona.
        let ax = head.x - caçador.head.x;
        let az = head.z - caçador.head.z;
        const h = Math.hypot(ax, az) || 1;
        ax /= h;
        az /= h;
        const lat = Math.sin(t * 2.3 + this.fase) * 0.9;
        sx = head.x + (ax - az * lat) * 7;
        sz = head.z + (az + ax * lat) * 7;
        sy = head.y + Math.sin(t * 3 + this.fase) * 0.8;
        const rr = Math.hypot(sx, sz);
        if (rr > RADI_MAX * 1.1) {
          sx *= (RADI_MAX * 1.1) / rr;
          sz *= (RADI_MAX * 1.1) / rr;
        }
        sy = limita(sy, 1.0, 4.5);
        kk = 0.05;
        maxVel = 0.062;
      } else if (this.estat === "arriba") {
        sx = this.home.x;
        sy = this.home.y;
        sz = this.home.z;
        kk = 0.02;
        maxVel = 0.06;
      } else {
        sx = this.home.x + Math.sin(t * this.sp + this.fase) * 1.4;
        sz = this.home.z + Math.cos(t * this.sp * 0.83 + this.fase * 1.3) * 1.4;
        sy = this.home.y + Math.sin(t * this.sp * 1.7 + this.fase * 0.7) * 0.5;
      }
      vel.x += (sx - head.x) * kk * k;
      vel.y += (sy - head.y) * kk * k;
      vel.z += (sz - head.z) * kk * k;
      vel.multiplyScalar(Math.pow(0.9, k));
      const vl = vel.length();
      if (vl > maxVel) vel.multiplyScalar(maxVel / vl);
      head.addScaledVector(vel, k);
    }
    this.grup.position.copy(head);
    this.cara.rotation.y += angDiff(Math.atan2(cam.x - head.x, cam.z - head.z), this.cara.rotation.y) * 0.1;

    // Cua (Verlet), igual que la dels encaputxats.
    const sw = SEG * s;
    const c = this.cadena;
    const prev = this.prev;
    c[0].copy(head);
    for (let i = 1; i < N; i++) {
      const p = c[i];
      const q = prev[i];
      const vx = (p.x - q.x) * 0.93;
      const vy = (p.y - q.y) * 0.93;
      const vz = (p.z - q.z) * 0.93;
      q.copy(p);
      p.x += vx;
      p.y += vy - 0.0006 * s;
      p.z += vz;
      p.x += (head.x - p.x) * 0.006 * i * 0.35;
      p.y += (head.y - i * sw - p.y) * 0.02;
      p.z += (head.z - p.z) * 0.006 * i * 0.35;
    }
    for (let it = 0; it < 4; it++) {
      c[0].copy(head);
      for (let i = 1; i < N; i++) {
        const a = c[i - 1];
        const b = c[i];
        const ex = b.x - a.x;
        const ey = b.y - a.y;
        const ez = b.z - a.z;
        const d = Math.hypot(ex, ey, ez) || 1e-6;
        const f = sw / d;
        b.set(a.x + ex * f, a.y + ey * f, a.z + ez * f);
      }
    }
    for (let i = 0; i < N; i++) this.offs[i].set((c[i].x - head.x) / s, (c[i].y - (head.y - i * sw)) / s, (c[i].z - head.z) / s);

    // Ulls gairebé sempre tancats: s'obren un instant, i del tot si el persegueixen.
    const per = 6 + (this.id % 5) * 1.1;
    const u = ((t + this.fase) % per) / per;
    let obert = Math.max(0, 1 - Math.abs(u - 0.9) / 0.06);
    obert = obert * obert * (3 - 2 * obert);
    if (this.estat === "fuig" || this.estat === "capturat") obert = 1;
    this.ullL.scale.y = this.ullR.scale.y = 0.12 * (0.08 + 0.92 * obert);
    this.wob *= Math.pow(0.93, k);
    this.mat.uniforms.uWob.value = this.estat === "fuig" || this.estat === "capturat" ? 0.7 : this.wob;
    this.mat.uniforms.uAlpha.value = 0.95 * this.fade;
    this.matUlls.opacity = (0.3 + 0.7 * obert) * this.fade;
    this.matHalo.opacity = 0.2 * this.fade;
    this.grup.visible = this.fade > 0.01;
  }
}

// ───────────────────────────── món ─────────────────────────────

export class MonFantasmes {
  private readonly T: Tres;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly escena: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly fantasmes: Fantasma[] = [];
  private readonly portals: Portal[] = [];
  private readonly esperits: Esperit[] = [];
  private proximCacaT = 4;
  private proximEsperitT = 1;
  private readonly mapAnell: THREE.Texture;
  private readonly mapPunt: THREE.Texture;
  private readonly geo: THREE.BufferGeometry;
  private readonly circle: THREE.BufferGeometry;
  private readonly mapUll: THREE.Texture;
  private readonly mapHalo: THREE.Texture;
  private readonly uTime = { value: 0 };
  private readonly avant: THREE.Vector3;
  private readonly alEsdeveniment?: (e: EsdevenimentFantasma) => void;
  private ultimMs = 0;
  private t = 0;
  private proximCuriosT = 8;
  // Detector de crits: el volum de fons s'aprèn a poc a poc i un crit és molt per sobre i dura.
  private sorollBase = 0.01;
  private fortMs = 0;
  nivellMicro = 0;
  llindarMicro = 0.12;

  constructor(T: Tres, canvas: HTMLCanvasElement, opcions: OpcionsMon) {
    this.T = T;
    this.alEsdeveniment = opcions.alEsdeveniment;
    this.renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setClearColor(0x000000, 0);
    // Els shaders escriuen colors tal com són: sense conversió de color a la sortida.
    this.renderer.outputColorSpace = T.LinearSRGBColorSpace;
    this.escena = new T.Scene();
    this.camera = new T.PerspectiveCamera(60, 1, 0.1, 120);
    this.camera.rotation.order = "YXZ";
    this.camera.position.set(0, ALCADA_CAMERA, 0);
    this.avant = new T.Vector3();

    // Geometria del cos: esfera estirada (cap allargat cap amunt i cua llarga que es va afinant).
    const g = new T.SphereGeometry(0.8, 48, 40);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      if (y > 0) y *= 1.6;
      if (y < 0) {
        y *= TAIL_LEN / 0.8;
        const s = Math.min(-y / TAIL_LEN, 1);
        const k = 1 - 0.82 * Math.pow(s, 0.85);
        x *= k;
        z *= k;
      }
      pos.setXYZ(i, x, y, z);
    }
    this.geo = g;
    this.circle = new T.CircleGeometry(1, 20);
    this.mapUll = this.texturaRadial(["rgba(255,225,205,1)", "rgba(255,80,60,1)", "rgba(225,20,20,0.75)", "rgba(120,0,0,0)"], [0, 0.18, 0.5, 1]);
    this.mapHalo = this.texturaRadial(["rgba(120,220,255,0.9)", "rgba(60,150,255,0.28)", "rgba(20,60,200,0)"], [0, 0.35, 1]);

    // Textura de l'anell (nucli suau, anell brillant i resplendor exterior) i del punt de les partícules.
    this.mapAnell = this.texturaRadial(
      ["rgba(255,255,255,0.16)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.22)", "rgba(255,255,255,1)", "rgba(255,255,255,0.35)", "rgba(255,255,255,0)"],
      [0, 0.6, 0.74, 0.8, 0.88, 1]
    );
    this.mapPunt = this.texturaRadial(["rgba(255,255,255,1)", "rgba(255,255,255,0.45)", "rgba(255,255,255,0)"], [0, 0.3, 1]);
    // Tres portals al voltant del jugador: sempre un a cada banda aproximadament, amb colors barrejats.
    const base = Math.random() * Math.PI * 2;
    const parells: [[number, number, number], [number, number, number]][] = [
      [COLOR_CIAN, COLOR_LILA],
      [COLOR_LILA, COLOR_CIAN],
      [COLOR_CIAN, COLOR_LILA],
    ];
    parells.forEach(([anell, columna], i) => {
      const rumb = base + (i * Math.PI * 2) / parells.length + alea(-0.5, 0.5);
      const r = alea(PORTAL_DIST_MIN, PORTAL_DIST_MAX);
      this.portals.push(
        new Portal(T, Math.sin(rumb) * r, -Math.cos(rumb) * r, anell, columna, this.mapAnell, this.mapPunt, this.uTime, this.escena)
      );
    });

    for (let i = 0; i < opcions.quantitat; i++) {
      const f = new Fantasma(T, i, this.geo, this.circle, this.mapUll, this.mapHalo, this.uTime, this.escena);
      const h = this.triaHome(f);
      f.home.x = h.x;
      f.home.y = h.y;
      f.home.z = h.z;
      f.colloca(h.x, h.y, h.z);
      f.espera = 0.4 + i * 0.55; // surten a poc a poc, no tots alhora
      this.fantasmes.push(f);
    }
    for (let i = 0; i < QUANTITAT_ESPERITS; i++) {
      const e = new Esperit(T, i, this.geo, this.circle, this.mapUll, this.mapHalo, this.uTime, this.escena);
      // Des del principi ja hi són, repartits a l'atzar dins la zona.
      const rumb = Math.random() * Math.PI * 2;
      const r = alea(RADI_MIN, RADI_MAX * 0.85);
      e.home.x = Math.sin(rumb) * r;
      e.home.y = alea(1.2, 3.6);
      e.home.z = -Math.cos(rumb) * r;
      e.colloca(e.home.x, e.home.y, e.home.z);
      e.estat = "deriva";
      e.fade = 1;
      this.esperits.push(e);
    }
  }

  private texturaRadial(colors: string[], parades: number[]): THREE.Texture {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d");
    if (x) {
      const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      colors.forEach((col, i) => gr.addColorStop(parades[i], col));
      x.fillStyle = gr;
      x.fillRect(0, 0, 128, 128);
    }
    return new this.T.CanvasTexture(c);
  }

  /**
   * Tria un punt nou, a la zona al voltant del jugador i lluny dels altres fantasmes. Una part dels
   * punts cauen a prop d'un portal, perquè hi hagi fantasmes il·luminats.
   */
  private triaHome(f: Fantasma): { x: number; y: number; z: number } {
    let millor = { x: 0, y: 3, z: -10, d: -1 };
    for (let intent = 0; intent < 25; intent++) {
      let p: { x: number; y: number; z: number; d: number };
      if (this.portals.length && Math.random() < 0.4) {
        const portal = this.portals[Math.floor(Math.random() * this.portals.length)];
        const a = Math.random() * Math.PI * 2;
        const r = alea(2.5, 6);
        p = { x: portal.x + Math.cos(a) * r, y: alea(1.4, 4.2), z: portal.z + Math.sin(a) * r, d: 0 };
      } else {
        const rumb = Math.random() * Math.PI * 2;
        const r = alea(RADI_MIN, RADI_MAX);
        p = { x: Math.sin(rumb) * r, y: alea(ALCADA_MIN, ALCADA_MAX), z: -Math.cos(rumb) * r, d: 0 };
      }
      let dmin = 1e9;
      for (const o of this.fantasmes) {
        if (o === f) continue;
        dmin = Math.min(dmin, Math.hypot(o.home.x - p.x, o.home.y - p.y, o.home.z - p.z));
      }
      p.d = dmin;
      if (p.d > millor.d) millor = p;
      if (dmin > 5) break;
    }
    return millor;
  }

  /** Un fantasma encaputxat es llança a perseguir un esperit: el vol caçar. */
  private triaCaca() {
    if (this.fantasmes.filter((f) => f.estat === "persegueix" || f.estat === "porta").length >= 2) return;
    const caçadors = this.fantasmes.filter((f) => f.estat === "deriva" && f.fade > 0.9);
    const presa = this.esperits.filter((e) => e.estat === "deriva" && e.fade > 0.9);
    if (!caçadors.length || !presa.length) return;
    let millor: { f: Fantasma; e: Esperit; d: number } | null = null;
    for (const f of caçadors) {
      for (const e of presa) {
        const d = Math.hypot(f.head.x - e.head.x, f.head.z - e.head.z);
        // Millor una presa a mitja distància (uns 18 m): així hi ha persecució de veritat.
        if (d < 45 && (!millor || Math.abs(d - 18) < Math.abs(millor.d - 18))) millor = { f, e, d };
      }
    }
    if (!millor) return;
    const { f, e } = millor;
    f.estat = "persegueix";
    f.victima = e;
    f.t = 0;
    e.estat = "fuig";
    e.perseguidor = f;
    e.t = 0;
    e.wob = 0.8;
    this.alEsdeveniment?.({ tipus: "s-acosta", pan: this.pan(f) });
  }

  /** Esperits: vida pròpia, fugida, captura i absorció; i els caçadors que els segueixen. */
  private actualitzaEsperits(dt: number, cam: THREE.Vector3) {
    // Cada 5 s arriba un esperit de fora de la zona, des d'una banda qualsevol, cap a un punt de dins.
    this.proximEsperitT -= dt;
    if (this.proximEsperitT <= 0) {
      this.proximEsperitT = ESPERIT_CADA_S;
      const e = this.esperits.find((x) => x.estat === "ocult");
      if (e) {
        const rumb = Math.random() * Math.PI * 2;
        const r = alea(ESPERIT_DIST_FORA[0], ESPERIT_DIST_FORA[1]);
        const rh = alea(RADI_MIN, RADI_MAX * 0.8);
        const rumbH = rumb + alea(-0.8, 0.8);
        e.home.x = Math.sin(rumbH) * rh;
        e.home.y = alea(1.2, 3.6);
        e.home.z = -Math.cos(rumbH) * rh;
        e.colloca(Math.sin(rumb) * r, alea(1.5, 4), -Math.cos(rumb) * r);
        e.grup.scale.setScalar(e.s);
        e.estat = "arriba";
        e.fade = 0;
        e.perseguidor = null;
      }
    }
    for (const e of this.esperits) {
      const f = e.perseguidor;
      if (e.estat === "ocult") {
        // Esperant que arribi el seu torn (vegeu més avall).
      } else if (e.estat === "arriba") {
        e.fade = Math.min(1, e.fade + dt);
        if (Math.hypot(e.head.x - e.home.x, e.head.z - e.home.z) < 4) e.estat = "deriva";
      } else if (e.estat === "deriva") {
        e.fade = Math.min(1, e.fade + dt / 2);
      } else if (e.estat === "fuig") {
        e.t += dt;
        if (!f || f.estat !== "persegueix" || f.victima !== e || e.t > 40) {
          e.estat = "deriva"; // el caçador l'ha perdut (flaix, crit...) o es cansa
          e.perseguidor = null;
        } else if (Math.hypot(f.head.x - e.head.x, f.head.y - e.head.y, f.head.z - e.head.z) < 1.4) {
          // Atrapat: el fantasma gran se l'emporta cap al portal més proper.
          e.estat = "capturat";
          // El porta a un portal una mica lluny d'on l'ha atrapat, perquè el trajecte es vegi.
          const lluny = this.portals.filter((p) => p.distancia(f.head.x, f.head.z) > 7);
          e.portal = lluny.length ? lluny[Math.floor(Math.random() * lluny.length)] : this.portalProper(f.head.x, f.head.z);
          f.estat = "porta";
          f.t = 0;
          this.alEsdeveniment?.({ tipus: "enfoca", pan: this.pan(f) });
        }
      } else if (e.estat === "capturat") {
        if (!f || f.estat !== "porta" || f.victima !== e || !e.portal) {
          e.estat = "deriva"; // l'ha deixat anar (el fantasma s'ha dissolt o ha fugit)
          e.perseguidor = null;
        } else if (Math.hypot(f.head.x - e.portal.x, f.head.z - e.portal.z) < 1.8) {
          e.estat = "absorbit";
          e.t = 0;
          f.estat = "deriva";
          f.victima = null;
        }
      } else if (e.estat === "absorbit" && e.t > 3.4) {
        e.estat = "ocult";
        e.fade = 0;
        e.perseguidor = null;
      }
      e.actualitza(dt, this.t, cam, e.perseguidor);
    }
    // Els caçadors: persegueixen l'esperit; un cop capturat, el porten al portal.
    for (const f of this.fantasmes) {
      if (f.estat !== "persegueix" && f.estat !== "porta") continue;
      f.t += dt;
      const v = f.victima;
      const bona = v && v.perseguidor === f && (f.estat === "persegueix" ? v.estat === "fuig" : v.estat === "capturat");
      if (!v || !bona || f.t > 45) {
        f.estat = "deriva";
        f.victima = null;
      } else if (f.estat === "persegueix") {
        f.objectiu.set(v.head.x, v.head.y + 0.3, v.head.z);
      } else if (v.portal) {
        f.objectiu.set(v.portal.x, Math.max(f.head.y, 1.8), v.portal.z);
      }
    }
  }

  /** El primer portal, el «punt de llum», va al lloc que toca per GPS: `est` i `nord` en metres respecte al jugador. */
  fixaPuntLlum(est: number, nord: number) {
    this.portals[0]?.mou(est, -nord);
  }

  /** El «punt de llum» a `dist` m davant del jugador, segons el rumb (graus des del nord). */
  fixaPuntLlumDavant(rumb: number, dist: number) {
    this.portals[0]?.mou(Math.sin(rumb * RAD) * dist, -Math.cos(rumb * RAD) * dist);
  }

  /** Posició actual del punt de llum (est, nord), per no moure'l per un no res. */
  get puntLlum(): { est: number; nord: number } | null {
    const p = this.portals[0];
    return p ? { est: p.x, nord: -p.z } : null;
  }

  /** El portal més proper a un punt. */
  private portalProper(x: number, z: number): Portal {
    let millor = this.portals[0];
    let dmin = 1e9;
    for (const p of this.portals) {
      const d = p.distancia(x, z);
      if (d < dmin) {
        dmin = d;
        millor = p;
      }
    }
    return millor;
  }

  redimensiona(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.fov = (2 * Math.atan(Math.tan((FOV_HORITZONTAL / 2) * RAD) / this.camera.aspect)) / RAD;
    this.camera.updateProjectionMatrix();
  }

  /** Quants fantasmes hi ha ara a la vista o a prop (per al cartell del flaix). */
  get visibles(): number {
    return this.fantasmes.filter((f) => f.fade > 0.2).length;
  }

  /**
   * Un flaix cap on mira la càmera: els fantasmes del con (uns 26°, fins a 34 m) es il·luminen un
   * instant i es dissolen. Retorna quants n'ha captat.
   */
  flaix(): number {
    this.camera.getWorldDirection(this.avant);
    const cam = this.camera.position;
    let captats = 0;
    for (const f of this.fantasmes) {
      if (f.fade < 0.2 || f.estat === "ocult") continue;
      const vx = f.head.x - cam.x;
      const vy = f.head.y - cam.y;
      const vz = f.head.z - cam.z;
      const d = Math.hypot(vx, vy, vz);
      if (d > 34 || d < 0.01) continue;
      const cosA = (vx * this.avant.x + vy * this.avant.y + vz * this.avant.z) / d;
      if (Math.acos(limita(cosA, -1, 1)) < 26 * RAD) {
        f.glow = 2.8;
        f.estat = "dissolt";
        f.duradaDissol = 0.7;
        f.t = 0;
        captats++;
      }
    }
    return captats;
  }

  /** Tots els fantasmes a la vista marxen i es dissolen (algú ha cridat). */
  espantaTots() {
    const cam = this.camera.position;
    for (const f of this.fantasmes) {
      if (f.fade < 0.1 || f.estat === "ocult") continue;
      const dx = f.head.x - cam.x;
      const dz = f.head.z - cam.z;
      const h = Math.hypot(dx, dz) || 1;
      f.objectiu.set(cam.x + (dx / h) * 45, f.head.y + 2, cam.z + (dz / h) * 45);
      f.estat = "fuig";
      f.t = 0;
      f.wob = 0.8;
    }
  }

  private pan(f: Fantasma): number {
    const cam = this.camera.position;
    const rumbF = Math.atan2(f.head.x - cam.x, -(f.head.z - cam.z));
    const rumbC = -this.camera.rotation.y;
    return limita(angDiff(rumbF, rumbC) / (70 * RAD), -1, 1);
  }

  /** Un fantasma tria acostar-se al jugador, a poc a poc. */
  private triaCurios() {
    const cam = this.camera.position;
    this.camera.getWorldDirection(this.avant);
    let tria: Fantasma | null = null;
    let millor = 1e9;
    for (const f of this.fantasmes) {
      if (f.estat !== "deriva" || f.fade < 0.9) continue;
      const d = f.dist;
      if (d < 9 || d > 26) continue;
      // Millor els que el jugador pot veure: els més a prop del centre de la mira, amb una mica d'atzar.
      const cosA = ((f.head.x - cam.x) * this.avant.x + (f.head.z - cam.z) * this.avant.z) / Math.max(0.01, Math.hypot(f.head.x - cam.x, f.head.z - cam.z));
      const puntuacio = -cosA + Math.random() * 0.8;
      if (puntuacio < millor) {
        millor = puntuacio;
        tria = f;
      }
    }
    if (!tria) return;
    const dx = tria.head.x - cam.x;
    const dz = tria.head.z - cam.z;
    const h = Math.hypot(dx, dz) || 1;
    tria.objectiu.set(cam.x + (dx / h) * DIST_CURIOS, alea(1.9, 2.8), cam.z + (dz / h) * DIST_CURIOS);
    tria.estat = "curios";
    tria.t = 0;
    tria.apropDit = false;
  }

  /** Un fotograma. `ara` en ms, `mirada` de la brúixola, `micro` el volum del micròfon (0 si no hi és). */
  actualitza(ara: number, mirada: Mirada, micro: number, microActiu: boolean) {
    const dt = limita((ara - this.ultimMs) / 1000, 0, 0.05);
    this.ultimMs = ara;
    this.t += dt;
    this.uTime.value = this.t;
    this.camera.rotation.set(mirada.elevacio * RAD, -mirada.rumb * RAD, 0);
    this.camera.getWorldDirection(this.avant);
    const cam = this.camera.position;
    for (const portal of this.portals) portal.actualitza(dt, this.t);
    this.proximCacaT -= dt;
    if (this.proximCacaT <= 0) {
      this.proximCacaT = alea(4, 8);
      this.triaCaca();
    }

    // Crit del jugador.
    if (microActiu) {
      this.nivellMicro = micro;
      this.sorollBase += (Math.min(micro, this.sorollBase * 3 + 0.01) - this.sorollBase) * 0.003;
      this.llindarMicro = Math.max(0.12, this.sorollBase * 5);
      this.fortMs = micro > this.llindarMicro ? this.fortMs + dt * 1000 : Math.max(0, this.fortMs - dt * 2000);
      if (this.fortMs > 300) {
        this.fortMs = 0;
        this.espantaTots();
      }
    }

    // De tant en tant, un fantasma curiós s'acosta.
    this.proximCuriosT -= dt;
    if (this.proximCuriosT <= 0) {
      this.proximCuriosT = alea(12, 22);
      this.triaCurios();
    }

    for (const f of this.fantasmes) {
      switch (f.estat) {
        case "ocult":
          f.espera -= dt;
          if (f.espera <= 0) {
            // Surt d'un portal: puja des de sota terra (el terra el talla) fins a una alçada, i després va al seu punt.
            const h = this.triaHome(f);
            f.home.x = h.x;
            f.home.y = h.y;
            f.home.z = h.z;
            const portal = this.portals[Math.floor(Math.random() * this.portals.length)];
            f.colloca(portal.x, -TAIL_LEN * f.s - 0.6, portal.z);
            f.objectiu.set(portal.x, Math.max(h.y, 2.2), portal.z);
            f.estat = "emergeix";
            f.fade = 1;
            f.glow = 1;
            f.t = 0;
            f.mirat = 0;
            f.enfocatDit = false;
          }
          break;
        case "emergeix":
          f.t += dt;
          if (f.head.y > f.objectiu.y - 0.3 || f.t > 7) f.estat = "deriva";
          break;
        case "enfonsa": {
          f.t += dt;
          const pd = f.portalDesti;
          if (!pd || f.t > 18) {
            f.estat = "dissolt";
            f.duradaDissol = 1.4;
            f.t = 0;
            break;
          }
          if (f.fase2 === 0) {
            f.objectiu.set(pd.x, Math.max(f.head.y, 1.8), pd.z);
            if (Math.hypot(f.head.x - pd.x, f.head.z - pd.z) < 1.8) f.fase2 = 1;
          } else {
            f.objectiu.set(pd.x, -TAIL_LEN * f.s - 0.8, pd.z);
            if (f.head.y < -TAIL_LEN * f.s * 0.6) {
              f.fade = 0;
              f.estat = "ocult";
              f.espera = alea(6, 11);
            }
          }
          break;
        }
        case "curios":
          f.t += dt;
          if (!f.apropDit && f.dist < 13) {
            f.apropDit = true;
            this.alEsdeveniment?.({ tipus: "s-acosta", pan: this.pan(f) });
          }
          if (f.t > 9) f.estat = "deriva";
          break;
        case "dissolt":
          f.fade -= dt / f.duradaDissol;
          if (f.fade <= 0) {
            f.fade = 0;
            f.estat = "ocult";
            f.espera = alea(7, 13);
          }
          break;
        case "fuig":
          f.t += dt;
          if (f.t > 0.5) f.fade -= dt / 1.2;
          if (f.fade <= 0) {
            f.fade = 0;
            f.estat = "ocult";
            f.espera = alea(9, 15);
          }
          break;
        case "deriva": {
          // Patrulla: va d'un punt a un altre de la zona, sense aturar-se gaire.
          f.patrulla -= dt;
          if (f.patrulla <= 0 || Math.hypot(f.head.x - f.home.x, f.head.z - f.home.z) < 2.2) {
            const h = this.triaHome(f);
            f.home.x = h.x;
            f.home.y = h.y;
            f.home.z = h.z;
            f.patrulla = alea(14, 26);
          }
          break;
        }
        default:
          break;
      }
      // Llum de vora que dona el portal més proper: com més a prop, més se'n veu el fantasma.
      f.llum = 0.9 * Math.pow(limita(1 - this.portalProper(f.head.x, f.head.z).distancia(f.head.x, f.head.z) / 10, 0, 1), 1.5);
      f.actualitza(dt, this.t, cam);
      f.glow += (1 - f.glow) * Math.min(1, dt * 3);

      // Mirada: si el jugador té el fantasma a la mira, ho nota; si l'hi té fix massa estona, es dissol.
      if (f.fade > 0.6 && (f.estat === "deriva" || f.estat === "curios")) {
        const vx = f.head.x - cam.x;
        const vy = f.head.y - cam.y;
        const vz = f.head.z - cam.z;
        const d = Math.hypot(vx, vy, vz);
        const cosA = (vx * this.avant.x + vy * this.avant.y + vz * this.avant.z) / Math.max(0.01, d);
        if (Math.acos(limita(cosA, -1, 1)) < 9 * RAD && d < 24) {
          f.mirat += dt * 1000;
          if (f.mirat > 800 && !f.enfocatDit && d < 18) {
            f.enfocatDit = true;
            this.alEsdeveniment?.({ tipus: "enfoca", pan: this.pan(f) });
          }
          if (f.mirat > 4500) {
            // Es cansa que el mirin: va al portal més proper i s'hi enfonsa.
            f.estat = "enfonsa";
            f.portalDesti = this.portalProper(f.head.x, f.head.z);
            f.fase2 = 0;
            f.t = 0;
            f.mirat = 0;
          }
        } else {
          f.mirat = Math.max(0, f.mirat - dt * 500);
          if (f.mirat === 0 && f.enfocatDit && f.estat === "deriva") f.enfocatDit = false;
        }
      }
    }

    this.actualitzaEsperits(dt, cam);

    // Els més llunyans primer, perquè els de davant els tapin (els ulls van sense prova de profunditat).
    const ordenats = [...this.fantasmes].sort((a, b) => b.dist - a.dist);
    ordenats.forEach((f, i) => {
      f.cos.renderOrder = i * 3;
      f.halo.renderOrder = i * 3 - 1000;
      f.ullL.renderOrder = f.ullR.renderOrder = i * 3 + 1;
    });
    this.renderer.render(this.escena, this.camera);
  }

  dispose() {
    for (const f of this.fantasmes) {
      this.escena.remove(f.grup);
      f.mat.dispose();
      f.matUlls.dispose();
      f.matHalo.dispose();
    }
    for (const e of this.esperits) {
      this.escena.remove(e.grup);
      e.mat.dispose();
      e.matUlls.dispose();
      e.matHalo.dispose();
    }
    for (const portal of this.portals) portal.dispose(this.escena);
    this.mapAnell.dispose();
    this.mapPunt.dispose();
    this.geo.dispose();
    this.circle.dispose();
    this.mapUll.dispose();
    this.mapHalo.dispose();
    this.renderer.dispose();
  }
}
