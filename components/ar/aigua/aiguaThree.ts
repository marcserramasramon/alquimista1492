import * as THREE from "three";
import type { Mirada } from "@/lib/orientacio";

/**
 * Ràpids de riu en 3D (three.js): un terra d'aigua amb ones que es mouen en un sentit fix, roques
 * de debò que trenquen el corrent amb escuma al voltant i gotes que esquitxen. La càmera de three.js
 * s'orienta amb la brúixola i la inclinació del mòbil (ulls a 1,5 m), de manera que l'aigua queda
 * ancorada al món i es pot mirar al voltant. Es dibuixa en un canvas fora de pantalla perquè qui l'usa
 * hi pugui retallar les persones. Res d'aquí és una solució ni toca la partida.
 *
 * Món: x = est, y = amunt, z = sud (la càmera mira cap a -z = nord amb el rumb a 0).
 */

const RAD = Math.PI / 180;
const ALCADA_ULLS = 1.5;
export const FOV_HORITZONTAL = 52;

/** Costat del pla d'aigua (m) i subdivisions: prou fi per a les ones, prou lleuger per a un mòbil. */
const COSTAT = 70;
const SUBDIVISIONS = 150;
const ROQUES = 12;
const GOTES_MAX = 180;

// Les ones es calculen igual al vèrtex (relleu) i al fragment (normal i escuma).
const COMU = /* glsl */ `
  uniform float uTime;
  uniform vec2 uFlow;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  // x = al llarg del corrent, y = de través.
  vec2 flowCoords(vec2 p) {
    return vec2(dot(p, uFlow), dot(p, vec2(-uFlow.y, uFlow.x)));
  }
  float waveHeight(vec2 p) {
    vec2 q = flowCoords(p);
    float t = uTime;
    float h = 0.11 * sin(q.x * 2.1 - t * 3.2 + 1.6 * sin(q.y * 1.2 + t * 0.5));
    h += 0.06 * sin(q.x * 4.3 - t * 5.6 + q.y * 2.3);
    h += 0.10 * (noise(vec2(q.x * 1.3 - t * 3.8, q.y * 2.2)) - 0.5);
    return h;
  }
`;

const VERTEX = /* glsl */ `
  ${COMU}
  varying vec3 vPos;
  void main() {
    vec3 p = position;
    p.y = waveHeight(p.xz);
    vPos = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  ${COMU}
  uniform vec4 uRoques[${ROQUES}];
  varying vec3 vPos;

  void main() {
    vec2 p = vPos.xz;
    float h = vPos.y;
    vec2 q = flowCoords(p);
    float t = uTime;

    // Normal de les ones per diferències finites.
    float e = 0.09;
    float hx = waveHeight(p + vec2(e, 0.0));
    float hz = waveHeight(p + vec2(0.0, e));
    vec3 n = normalize(vec3((h - hx) / e * 1.5, 1.0, (h - hz) / e * 1.5));
    vec3 v = normalize(cameraPosition - vPos);

    // Escuma: crestes de les ones i ratlles que corren amb el corrent.
    float ratlla = noise(vec2(q.x * 0.6 - t * 4.5, q.y * 5.0)) * noise(vec2(q.x * 1.7 - t * 5.5 + 7.0, q.y * 9.0));
    float escuma = smoothstep(0.0, 0.17, h) * smoothstep(0.3, 0.6, ratlla * 2.3);
    escuma += smoothstep(0.58, 0.85, ratlla * 2.3) * 0.45;

    // Escuma al voltant de cada roca i una estela cap aigües avall.
    vec2 perp = vec2(-uFlow.y, uFlow.x);
    for (int i = 0; i < ${ROQUES}; i++) {
      vec4 r = uRoques[i];
      vec2 rel = p - r.xy;
      float dist = length(rel);
      float anell = 1.0 - smoothstep(0.0, 0.5, dist - r.z);
      float llarg = dot(rel, uFlow);
      float ample = dot(rel, perp);
      float estela = step(0.0, llarg) * exp(-llarg * 0.17) * (1.0 - smoothstep(r.z * 0.7, r.z * 1.5 + llarg * 0.22, abs(ample)));
      float soroll = 0.55 + 0.9 * noise(vec2(llarg * 1.3 - t * 5.0, ample * 4.5 + float(i)));
      escuma = max(escuma, max(anell * 0.85, estela * 0.9) * clamp(soroll, 0.0, 1.0));
    }
    escuma = clamp(escuma, 0.0, 1.0);

    // Color: fosc al fons dels sots, més clar a les crestes, i el reflex del cel segons l'angle.
    float fons = 0.5 + 4.0 * h + 0.3 * noise(q * 0.8);
    vec3 aigua = mix(vec3(0.04, 0.22, 0.36), vec3(0.16, 0.58, 0.64), clamp(fons, 0.0, 1.0));
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.5);
    vec3 cel = mix(vec3(0.55, 0.74, 0.9), vec3(0.85, 0.93, 1.0), clamp(n.x * 0.5 + 0.5, 0.0, 1.0));
    vec3 col = mix(aigua, cel, fresnel * 0.75);
    vec3 sol = normalize(vec3(0.4, 0.7, 0.3));
    float brillant = pow(max(dot(reflect(-sol, n), v), 0.0), 60.0);
    col += vec3(1.0, 0.97, 0.88) * brillant * 0.9;
    col = mix(col, vec3(0.95, 0.98, 1.0), escuma);

    // Transparent: es veu el terra a través; s'esvaeix cap a la vora del pla.
    float alfa = clamp(0.5 + fresnel * 0.3 + escuma * 0.45 + brillant * 0.3, 0.0, 0.95);
    float dist = length(p);
    alfa *= 1.0 - smoothstep(${((COSTAT / 2) * 0.62).toFixed(1)}, ${((COSTAT / 2) * 0.95).toFixed(1)}, dist);
    gl_FragColor = vec4(col, alfa);
  }
`;

function alea(a: number, b: number) {
  return a + Math.random() * (b - a);
}

/** Una gota: centre blanc i vora blavosa que s'esvaeix. */
function crearTexturaGota(): THREE.CanvasTexture {
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
  return new THREE.CanvasTexture(c);
}

interface Gota {
  vida: number;
  edat: number;
  vx: number;
  vy: number;
  vz: number;
}

export class AiguaThree {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly escena = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
  private readonly uniformes = {
    uTime: { value: 0 },
    uFlow: { value: new THREE.Vector2(1, 0) },
    uRoques: { value: Array.from({ length: ROQUES }, () => new THREE.Vector4(1e4, 1e4, 0.1, 0)) },
  };
  private readonly liberables: { dispose(): void }[] = [];
  private readonly roques: { x: number; z: number; r: number }[] = [];
  private readonly gotes: Gota[] = [];
  private readonly gotesPos: Float32Array;
  private readonly gotesAttr: THREE.BufferAttribute;
  private readonly gotesGeo: THREE.BufferGeometry;
  private flux: number | null = null;
  private fx = 1;
  private fz = 0;
  private w = 0;
  private h = 0;

  /** Llança si el mòbil no pot crear un context WebGL. */
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    this.canvas = this.renderer.domElement;
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);
    this.camera.rotation.order = "YXZ";
    this.camera.position.set(0, ALCADA_ULLS, 0);

    // Llum de les roques.
    this.escena.add(new THREE.HemisphereLight(0xcfe6ff, 0x39484c, 1.6));
    const sol = new THREE.DirectionalLight(0xfff1d6, 1.8);
    sol.position.set(4, 7, 3);
    this.escena.add(sol);

    // Aigua.
    const geoAigua = new THREE.PlaneGeometry(COSTAT, COSTAT, SUBDIVISIONS, SUBDIVISIONS);
    geoAigua.rotateX(-Math.PI / 2);
    const matAigua = new THREE.ShaderMaterial({
      uniforms: this.uniformes,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
    });
    const aigua = new THREE.Mesh(geoAigua, matAigua);
    aigua.frustumCulled = false;
    aigua.renderOrder = 2;
    this.escena.add(aigua);
    this.liberables.push(geoAigua, matAigua);

    // Roques, mig enfonsades a l'aigua.
    const matRoca = new THREE.MeshLambertMaterial({ color: 0x66767b, flatShading: true });
    this.liberables.push(matRoca);
    for (let i = 0; i < ROQUES; i++) {
      const dist = i < 3 ? alea(2, 4.5) : alea(3.5, 16);
      const angle = Math.random() * Math.PI * 2;
      const r = alea(0.3, 0.7) * (0.7 + dist / 16);
      const x = Math.sin(angle) * dist;
      const z = -Math.cos(angle) * dist;
      this.roques.push({ x, z, r });
      this.uniformes.uRoques.value[i].set(x, z, r * 0.9, 0);
      const geo = new THREE.IcosahedronGeometry(r, 2);
      const pos = geo.attributes.position;
      for (let k = 0; k < pos.count; k++) {
        const f = 1 + alea(-0.13, 0.13);
        pos.setXYZ(k, pos.getX(k) * f * 1.15, pos.getY(k) * f * 0.8, pos.getZ(k) * f);
      }
      geo.computeVertexNormals();
      const roca = new THREE.Mesh(geo, matRoca);
      roca.position.set(x, r * 0.15, z);
      roca.rotation.y = Math.random() * Math.PI;
      this.escena.add(roca);
      this.liberables.push(geo);
    }

    // Gotes (punts additius).
    this.gotesPos = new Float32Array(GOTES_MAX * 3).fill(1e4);
    this.gotesAttr = new THREE.BufferAttribute(this.gotesPos, 3);
    this.gotesGeo = new THREE.BufferGeometry();
    this.gotesGeo.setAttribute("position", this.gotesAttr);
    const textura = crearTexturaGota();
    const matGota = new THREE.PointsMaterial({
      map: textura,
      size: 0.16,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const punts = new THREE.Points(this.gotesGeo, matGota);
    punts.frustumCulled = false;
    punts.renderOrder = 3;
    this.escena.add(punts);
    this.liberables.push(this.gotesGeo, matGota, textura);
  }

  /** Mida del dibuix en píxels (el canvas fora de pantalla). */
  redimensiona(w: number, h: number) {
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.fov = (2 * Math.atan(Math.tan((FOV_HORITZONTAL / 2) * RAD) / this.camera.aspect)) / RAD;
    this.camera.updateProjectionMatrix();
  }

  private actualitzaGotes(dt: number) {
    // Les roques esquitxen de tant en tant, cap amunt i una mica aigües avall.
    for (const roca of this.roques) {
      if (Math.random() < dt * 3.5 && this.gotes.length < GOTES_MAX - 3) {
        for (let k = 0; k < 3; k++) {
          const i = this.gotes.length;
          this.gotes.push({
            vida: alea(0.5, 1),
            edat: 0,
            vx: alea(-0.6, 0.6) + this.fx * 1.2,
            vy: alea(1.6, 3.4),
            vz: alea(-0.6, 0.6) + this.fz * 1.2,
          });
          this.gotesPos[i * 3] = roca.x + alea(-roca.r, roca.r) * 0.6;
          this.gotesPos[i * 3 + 1] = roca.r * 0.8;
          this.gotesPos[i * 3 + 2] = roca.z + alea(-roca.r, roca.r) * 0.6;
        }
      }
    }
    for (let i = this.gotes.length - 1; i >= 0; i--) {
      const g = this.gotes[i];
      g.edat += dt;
      g.vy -= dt * 6;
      this.gotesPos[i * 3] += g.vx * dt;
      this.gotesPos[i * 3 + 1] += g.vy * dt;
      this.gotesPos[i * 3 + 2] += g.vz * dt;
      if (g.edat >= g.vida || this.gotesPos[i * 3 + 1] < 0) {
        // Es retira posant l'última gota al seu lloc.
        const ultima = this.gotes.length - 1;
        this.gotes[i] = this.gotes[ultima];
        this.gotesPos.copyWithin(i * 3, ultima * 3, ultima * 3 + 3);
        this.gotesPos.fill(1e4, ultima * 3, ultima * 3 + 3);
        this.gotes.pop();
      }
    }
    this.gotesGeo.setDrawRange(0, Math.max(this.gotes.length, 1));
    this.gotesAttr.needsUpdate = true;
  }

  /** Avança la simulació `dt` segons i dibuixa amb la mirada donada al canvas fora de pantalla. */
  pinta(dt: number, mirada: Mirada) {
    if (this.flux === null) {
      // El corrent va d'esquerra a dreta de la pantalla segons la primera lectura.
      this.flux = (mirada.rumb + 90) * RAD;
      this.fx = Math.sin(this.flux);
      this.fz = -Math.cos(this.flux);
      this.uniformes.uFlow.value.set(this.fx, this.fz);
    }
    this.uniformes.uTime.value += dt;
    this.actualitzaGotes(dt);
    this.camera.rotation.y = -mirada.rumb * RAD;
    this.camera.rotation.x = mirada.elevacio * RAD;
    this.renderer.render(this.escena, this.camera);
  }

  dispose() {
    for (const o of this.liberables) o.dispose();
    this.renderer.dispose();
  }
}
