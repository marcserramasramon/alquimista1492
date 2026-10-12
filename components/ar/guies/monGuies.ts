import type * as THREE from "three";

/**
 * Món de les ànimes guia: esperits petits de boira lluminosa (cos allargat amb cua que s'arrossega,
 * ulls vermells gairebé sempre tancats) que surten per darrere dels jugadors i volen en línia recta cap on
 * van, es difuminen lluny i tornen a sortir. Escena pròpia, independent de la dels fantasmes de la
 * fita d'Ànima (components/ar/fantasmes/mon.ts), de la qual només copia l'aspecte dels esperits.
 *
 * Unitats en metres; el món és fix al voltant de l'usuari (nord = -Z, est = +X) i la càmera és a
 * 1,5 m d'alçada.
 */

type Tres = typeof THREE;

export interface Mirada {
  rumb: number;
  elevacio: number;
}

export interface OpcionsGuies {
  /** Rumb del camí, en graus des del nord. */
  rumb: number;
  /** Ànimes que hi ha alhora. */
  quantitat: number;
}

const RAD = Math.PI / 180;
const TAIL_LEN = 3.8;
const N = 11;
const SEG = TAIL_LEN / (N - 1);
const NECK = 0.55;
const ALCADA_CAMERA = 1.5;
const FOV_HORITZONTAL = 52;
/** A quina distància del jugador (m) es difuminen. */
const DIST_FINAL = 34;
/** Velocitat (m per fotograma a 60 fps) amb què volen: ~1,8 m/s, una mica més que un pas tranquil. */
const VEL_MAX = 0.03;

const alea = (a: number, b: number) => a + Math.random() * (b - a);
const angDiff = (a: number, b: number) => ((a - b + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

const VERTEX = `
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

const FRAGMENT = `
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

// ocult: espera per sortir; vola: va cap al final del camí i es difumina lluny.
type Estat = "ocult" | "vola";

class Guia {
  readonly grup: THREE.Group;
  readonly cara: THREE.Group;
  readonly mat: THREE.ShaderMaterial;
  readonly matUlls: THREE.MeshBasicMaterial;
  readonly matHalo: THREE.SpriteMaterial;
  readonly ullL: THREE.Mesh;
  readonly ullR: THREE.Mesh;
  readonly halo: THREE.Sprite;
  readonly offs: THREE.Vector3[];
  readonly cadena: THREE.Vector3[];
  readonly prev: THREE.Vector3[];
  readonly head: THREE.Vector3;
  readonly vel: THREE.Vector3;
  /** Punt cap al qual vola. */
  readonly objectiu = { x: 0, y: 2, z: 0 };
  readonly s: number;
  readonly fase = Math.random() * 100;
  readonly id: number;
  estat: Estat = "ocult";
  fade = 0;
  t = 0;
  espera = 0;

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
    this.s = alea(0.38, 0.5); // petites, però prou perquè es vegin a uns quants metres
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
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
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
    // Ulls vermells, ovals i gairebé sempre tancats.
    this.cara = new T.Group();
    this.cara.rotation.order = "YXZ";
    this.matUlls = new T.MeshBasicMaterial({ map: mapUll, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: T.AdditiveBlending });
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

  /** Posa l'ànima a un punt (amb la cua penjant recta). */
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

  /** Mou, aplica la física de la cua i dibuixa. `cam` és la posició de la càmera. */
  actualitza(dt: number, t: number, cam: THREE.Vector3) {
    const k = dt * 60;
    const s = this.s;
    const head = this.head;
    const vel = this.vel;
    if (this.estat === "vola") {
      const kk = 0.012;
      vel.x += (this.objectiu.x - head.x) * kk * k;
      vel.y += (this.objectiu.y - head.y) * kk * k;
      vel.z += (this.objectiu.z - head.z) * kk * k;
      vel.multiplyScalar(Math.pow(0.9, k));
      const vl = vel.length();
      if (vl > VEL_MAX) vel.multiplyScalar(VEL_MAX / vl);
      head.addScaledVector(vel, k);
    }
    this.grup.position.copy(head);
    this.cara.rotation.y += angDiff(Math.atan2(cam.x - head.x, cam.z - head.z), this.cara.rotation.y) * 0.1;

    // Cua (Verlet).
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

    // Ulls gairebé sempre tancats: s'obren un instant cada pocs segons.
    const per = 6 + (this.id % 5) * 1.1;
    const u = ((t + this.fase) % per) / per;
    let obert = Math.max(0, 1 - Math.abs(u - 0.9) / 0.06);
    obert = obert * obert * (3 - 2 * obert);
    this.ullL.scale.y = this.ullR.scale.y = 0.12 * (0.08 + 0.92 * obert);
    this.mat.uniforms.uWob.value = 0.25;
    this.mat.uniforms.uAlpha.value = 0.95 * this.fade;
    this.matUlls.opacity = (0.3 + 0.7 * obert) * this.fade;
    this.matHalo.opacity = 0.2 * this.fade;
    this.grup.visible = this.fade > 0.01;
  }
}

export class MonGuies {
  private readonly T: Tres;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly escena: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly guies: Guia[] = [];
  private readonly geo: THREE.BufferGeometry;
  private readonly circle: THREE.BufferGeometry;
  private readonly mapUll: THREE.Texture;
  private readonly mapHalo: THREE.Texture;
  private readonly uTime = { value: 0 };
  /** Direcció unitària del camí en el pla XZ del món. Nord = -Z, est = +X: un rumb r apunta a (sin r, -cos r). */
  private readonly dir: { x: number; z: number };
  private ultimMs = 0;
  private t = 0;

  constructor(T: Tres, canvas: HTMLCanvasElement, opcions: OpcionsGuies) {
    this.T = T;
    this.dir = { x: Math.sin(opcions.rumb * RAD), z: -Math.cos(opcions.rumb * RAD) };
    this.renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setClearColor(0x000000, 0);
    // Els shaders escriuen colors tal com són: sense conversió de color a la sortida.
    this.renderer.outputColorSpace = T.LinearSRGBColorSpace;
    this.escena = new T.Scene();
    this.camera = new T.PerspectiveCamera(60, 1, 0.1, 120);
    this.camera.rotation.order = "YXZ";
    this.camera.position.set(0, ALCADA_CAMERA, 0);

    // Cos: esfera estirada (cap allargat cap amunt i cua llarga que es va afinant).
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
      const e = new Guia(T, i, this.geo, this.circle, this.mapUll, this.mapHalo, this.uTime, this.escena);
      e.espera = 0.4 + i * 1.5; // surten a poc a poc, un darrere l'altre
      this.guies.push(e);
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

  redimensiona(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.fov = (2 * Math.atan(Math.tan((FOV_HORITZONTAL / 2) * RAD) / this.camera.aspect)) / RAD;
    this.camera.updateProjectionMatrix();
  }

  /** Surt una ànima per darrere del jugador, a un costat i a l'alçada de la vista, i vola camí avall: el
   * supera i continua, de manera que en girar-se se li veuen els ulls (miren sempre cap a la càmera). */
  private surt(e: Guia) {
    const d = this.dir;
    const davant = -alea(3.5, 8);
    const lateral = alea(1.2, 3.5) * (Math.random() < 0.5 ? -1 : 1);
    const x = d.x * davant - d.z * lateral;
    const z = d.z * davant + d.x * lateral;
    const y = alea(1.3, 2.6);
    e.colloca(x, y, z);
    e.objectiu.x = x + d.x * 80;
    e.objectiu.y = y + alea(-0.3, 0.5);
    e.objectiu.z = z + d.z * 80;
    e.estat = "vola";
    e.fade = 0;
    e.t = 0;
  }

  /** Un fotograma. `ara` en ms, `mirada` de la brúixola o de l'arrossegament. */
  actualitza(ara: number, mirada: Mirada) {
    const dt = Math.min(Math.max((ara - this.ultimMs) / 1000, 0), 0.05);
    this.ultimMs = ara;
    this.t += dt;
    this.uTime.value = this.t;
    this.camera.rotation.set(mirada.elevacio * RAD, -mirada.rumb * RAD, 0);
    const cam = this.camera.position;
    for (const e of this.guies) {
      if (e.estat === "ocult") {
        e.espera -= dt;
        if (e.espera <= 0) this.surt(e);
      } else {
        e.t += dt;
        if (e.t < 1.6) e.fade = Math.min(1, e.t / 1.6);
        else if (Math.hypot(e.head.x, e.head.z) > DIST_FINAL) e.fade -= dt / 1.6;
        if (e.t >= 1.6 && e.fade <= 0) {
          e.fade = 0;
          e.estat = "ocult";
          e.espera = alea(0.4, 2);
        }
      }
      e.actualitza(dt, this.t, cam);
    }
    this.renderer.render(this.escena, this.camera);
  }

  dispose() {
    for (const e of this.guies) {
      this.escena.remove(e.grup);
      e.mat.dispose();
      e.matUlls.dispose();
      e.matHalo.dispose();
    }
    this.geo.dispose();
    this.circle.dispose();
    this.mapUll.dispose();
    this.mapHalo.dispose();
    this.renderer.dispose();
  }
}
