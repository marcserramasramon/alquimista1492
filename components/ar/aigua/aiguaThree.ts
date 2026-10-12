import * as THREE from "three";
import type { Mirada } from "@/lib/orientacio";

/**
 * Ràpids de riu en 3D (three.js): una cinta d'aigua estreta (uns 3 m d'ample) amb ones, escuma a les
 * crestes i a les vores i gotes que esquitxen. El riu va en la direcció d'un rumb donat (el del carrer,
 * si l'extra el té configurat) i passa pels peus del jugador. La càmera de three.js
 * s'orienta amb la brúixola i la inclinació del mòbil (ulls a 1,5 m), de manera que l'aigua queda
 * ancorada al món i es pot mirar al voltant. Es dibuixa en un canvas fora de pantalla perquè qui l'usa
 * hi pugui retallar les persones. Res d'aquí és una solució ni toca la partida.
 *
 * Món: x = est, y = amunt, z = sud (la càmera mira cap a -z = nord amb el rumb a 0).
 */

const RAD = Math.PI / 180;
const ALCADA_ULLS = 1.5;
export const FOV_HORITZONTAL = 52;

/** Ample per defecte del riu (m), llargada de la cinta i marge de malla a cada costat. */
export const AMPLE_RIU = 3;
const LLARG = 60;
const MARGE = 0.9;
const GOTES_MAX = 180;

// Les ones es calculen igual al vèrtex (relleu) i al fragment (normal i escuma).
const COMU = /* glsl */ `
  uniform float uTime;
  uniform vec2 uFlow;
  uniform float uAmple;

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
  // 1 dins del riu, 0 fora, amb una vora suau; i s'apaga als extrems de la cinta.
  float riu(vec2 q) {
    float vora = 1.0 - smoothstep(uAmple * 0.5 - 0.3, uAmple * 0.5 + 0.1, abs(q.y));
    float cap = 1.0 - smoothstep(${(LLARG / 2 * 0.7).toFixed(1)}, ${(LLARG / 2 * 0.97).toFixed(1)}, abs(q.x));
    return vora * cap;
  }
  float waveHeight(vec2 p) {
    vec2 q = flowCoords(p);
    float t = uTime;
    float h = 0.11 * sin(q.x * 2.1 - t * 3.2 + 1.6 * sin(q.y * 1.2 + t * 0.5));
    h += 0.06 * sin(q.x * 4.3 - t * 5.6 + q.y * 2.3);
    h += 0.10 * (noise(vec2(q.x * 1.3 - t * 3.8, q.y * 2.2)) - 0.5);
    return h * riu(q);
  }
`;

const VERTEX = /* glsl */ `
  ${COMU}
  varying vec3 vPos;
  void main() {
    vec3 p = (modelMatrix * vec4(position, 1.0)).xyz;
    p.y = waveHeight(p.xz);
    vPos = p;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  ${COMU}
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

    // Escuma a les vores del riu, on l'aigua es trenca contra la riba.
    float vora = smoothstep(uAmple * 0.5 - 0.7, uAmple * 0.5 - 0.05, abs(q.y));
    escuma = max(escuma, vora * smoothstep(0.25, 0.6, noise(vec2(q.x * 1.6 - t * 4.0, q.y * 6.0)) + 0.25));
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
    float alfa = clamp(0.55 + fresnel * 0.3 + escuma * 0.45 + brillant * 0.3, 0.0, 0.95);
    alfa *= riu(q);
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
    uAmple: { value: AMPLE_RIU },
  };
  private readonly liberables: { dispose(): void }[] = [];
  private readonly gotes: Gota[] = [];
  private readonly gotesPos: Float32Array;
  private readonly gotesAttr: THREE.BufferAttribute;
  private readonly gotesGeo: THREE.BufferGeometry;
  private readonly aigua: THREE.Mesh;
  private flux: number | null = null;
  private fx = 1;
  private fz = 0;
  private w = 0;
  private h = 0;

  /**
   * `rumbRiu`: cap a on corre el riu (graus des del nord, sentit horari), p. ex. el del carrer; sense
   * ell, corre cap on mira el jugador en la primera lectura. `ample`: ample del riu (m).
   * Llança si el mòbil no pot crear un context WebGL.
   */
  constructor(private readonly rumbRiu: number | null = null, ample: number = AMPLE_RIU) {
    this.uniformes.uAmple.value = ample;
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    this.canvas = this.renderer.domElement;
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);
    this.camera.rotation.order = "YXZ";
    this.camera.position.set(0, ALCADA_ULLS, 0);

    // Aigua.
    const amplada = this.uniformes.uAmple.value + 2 * MARGE;
    const geoAigua = new THREE.PlaneGeometry(amplada, LLARG, Math.round(amplada / 0.17), Math.round(LLARG / 0.33));
    geoAigua.rotateX(-Math.PI / 2);
    const matAigua = new THREE.ShaderMaterial({
      uniforms: this.uniformes,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
    });
    const aigua = new THREE.Mesh(geoAigua, matAigua);
    this.aigua = aigua;
    aigua.frustumCulled = false;
    aigua.renderOrder = 2;
    this.escena.add(aigua);
    this.liberables.push(geoAigua, matAigua);

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
    // De tant en tant, una esquitxada en un punt del riu (a prop del jugador, on es veu).
    if (Math.random() < dt * 9 && this.gotes.length < GOTES_MAX - 4) {
      const llarg = alea(-3, 14);
      const ample = alea(-0.5, 0.5) * this.uniformes.uAmple.value;
      const cx = this.fx * llarg - this.fz * ample;
      const cz = this.fz * llarg + this.fx * ample;
      for (let k = 0; k < 4; k++) {
        const i = this.gotes.length;
        this.gotes.push({
          vida: alea(0.5, 1),
          edat: 0,
          vx: alea(-0.6, 0.6) + this.fx * 1.5,
          vy: alea(1.6, 3.4),
          vz: alea(-0.6, 0.6) + this.fz * 1.5,
        });
        this.gotesPos[i * 3] = cx + alea(-0.2, 0.2);
        this.gotesPos[i * 3 + 1] = 0.05;
        this.gotesPos[i * 3 + 2] = cz + alea(-0.2, 0.2);
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
      // Amb el rumb del carrer, el riu hi va al llarg; sinó, cap endavant de la primera mirada.
      this.flux = (this.rumbRiu ?? mirada.rumb) * RAD;
      this.fx = Math.sin(this.flux);
      this.fz = -Math.cos(this.flux);
      this.uniformes.uFlow.value.set(this.fx, this.fz);
      // La cinta (llarga en local z) s'orienta cap al corrent.
      this.aigua.rotation.y = Math.atan2(this.fx, this.fz);
      this.aigua.updateMatrixWorld();
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
