import type * as THREE from "three";

/**
 * Món de les ànimes: onze fantasmes encaputxats que suren al voltant del jugador, dins de la zona de
 * la fita (sense cap direcció concreta), sobre la càmera. Ve del projecte «Fantasmes vius»
 * (O:\PROJECTES AI\ghost): el cos de capa amb caputxa de cara negra i ulls vermells gairebé
 * sempre tancats, la cua llarga amb física i el to misteriós: observen de lluny, algun s'acosta
 * a poc a poc, es dissolen si se'ls mira fix o amb un flaix, i marxen si es crida.
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

type Estat = "ocult" | "apareix" | "deriva" | "curios" | "dissolt" | "fuig";

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
    this.home.x = x;
    this.home.y = y;
    this.home.z = z;
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
      if (this.estat === "curios" || this.estat === "fuig") {
        sx = this.objectiu.x;
        sy = this.objectiu.y;
        sz = this.objectiu.z;
      } else {
        const R = 1.2;
        sx = this.home.x + Math.sin(t * this.sp + this.fase) * R;
        sz = this.home.z + Math.cos(t * this.sp * 0.83 + this.fase * 1.3) * R;
        sy = this.home.y + Math.sin(t * this.sp * 1.7 + this.fase * 0.7) * 0.4 + Math.sin(t * 1.9 + this.fase) * 0.08 * s;
      }
      const kk = 0.012 * k * (this.estat === "fuig" ? 3 : this.estat === "curios" ? 1.4 : 1);
      vel.x += (sx - head.x) * kk;
      vel.y += (sy - head.y) * kk;
      vel.z += (sz - head.z) * kk;
      vel.multiplyScalar(Math.pow(0.9, k));
      const maxVel = this.estat === "fuig" ? 0.3 : this.estat === "curios" ? 0.06 : 0.04;
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
    u.uGlow.value = this.glow;
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

// ───────────────────────────── món ─────────────────────────────

export class MonFantasmes {
  private readonly T: Tres;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly escena: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly fantasmes: Fantasma[] = [];
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

    for (let i = 0; i < opcions.quantitat; i++) {
      const f = new Fantasma(T, i, this.geo, this.circle, this.mapUll, this.mapHalo, this.uTime, this.escena);
      this.collocaNou(f);
      f.espera = 0.4 + i * 0.55; // surten a poc a poc, no tots alhora
      this.fantasmes.push(f);
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

  /** Tria un punt nou, a la zona al voltant del jugador i lluny dels altres fantasmes. */
  private collocaNou(f: Fantasma) {
    let millor = { x: 0, y: 3, z: -10, d: -1 };
    for (let intent = 0; intent < 25; intent++) {
      const rumb = Math.random() * Math.PI * 2;
      const r = alea(RADI_MIN, RADI_MAX);
      const p = { x: Math.sin(rumb) * r, y: alea(ALCADA_MIN, ALCADA_MAX), z: -Math.cos(rumb) * r, d: 0 };
      let dmin = 1e9;
      for (const o of this.fantasmes) {
        if (o === f) continue;
        dmin = Math.min(dmin, Math.hypot(o.home.x - p.x, o.home.y - p.y, o.home.z - p.z));
      }
      p.d = dmin;
      if (p.d > millor.d) millor = p;
      if (dmin > 5) break;
    }
    f.colloca(millor.x, millor.y, millor.z);
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
            this.collocaNou(f);
            f.estat = "apareix";
            f.fade = 0;
            f.glow = 1;
            f.mirat = 0;
            f.enfocatDit = false;
          }
          break;
        case "apareix":
          f.fade = Math.min(1, f.fade + dt / 2.4);
          if (f.fade >= 1) f.estat = "deriva";
          break;
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
        default:
          break;
      }
      f.actualitza(dt, this.t, cam);
      f.glow += (1 - f.glow) * Math.min(1, dt * 3);

      // Mirada: si el jugador té el fantasma a la mira, ho nota; si l'hi té fix massa estona, es dissol.
      if (f.fade > 0.6 && f.estat !== "ocult" && f.estat !== "fuig" && f.estat !== "dissolt") {
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
            f.estat = "dissolt";
            f.duradaDissol = 1.4;
            f.t = 0;
            f.mirat = 0;
          }
        } else {
          f.mirat = Math.max(0, f.mirat - dt * 500);
          if (f.mirat === 0 && f.enfocatDit && f.estat === "deriva") f.enfocatDit = false;
        }
      }
    }

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
    this.geo.dispose();
    this.circle.dispose();
    this.mapUll.dispose();
    this.mapHalo.dispose();
    this.renderer.dispose();
  }
}
