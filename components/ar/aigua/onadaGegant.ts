import * as THREE from "three";

/**
 * Una onada gegant: una paret d'aigua amb el perfil d'una onada que es trenca (esquena tendra, cresta i llavi
 * d'escuma que es corba endavant). És una sola malla fina de 80 x 48 quadrats: cada vèrtex es col·loca sobre un
 * perfil de 9 punts que es recalcula a cada quadre a partir de l'alçada i del grau de corba, i el color
 * d'aigua, l'escuma i la transparència es calculen al fragment.
 *
 * Espai local: x = a través de l'onada, y = amunt, z = cap on viatja (cap al jugador). L'origen és la cresta.
 */

const AMPLE = 46;
const PUNTS = 9;

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPerfil[${PUNTS}];
  varying vec3 vMon;
  varying float vS;
  varying float vAcross;

  // Catmull-Rom sobre els punts del perfil: s va de 0 (cua) a 1 (final del llavi).
  vec2 perfil(float s) {
    float f = s * float(${PUNTS - 1});
    int i = int(floor(min(f, float(${PUNTS - 1}) - 0.001)));
    float t = f - float(i);
    vec2 p0 = uPerfil[max(i - 1, 0)];
    vec2 p1 = uPerfil[i];
    vec2 p2 = uPerfil[i + 1];
    vec2 p3 = uPerfil[min(i + 2, ${PUNTS - 1})];
    return 0.5 * ((2.0 * p1) + (-p0 + p2) * t + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t * t + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t * t * t);
  }

  void main() {
    float s = position.y + 0.5;
    float a = position.x * ${AMPLE.toFixed(1)};
    vec2 pf = perfil(s);
    // Als extrems l'onada s'abaixa i s'obre cap endavant, com una badia; la cresta no és uniforme.
    float vora = 1.0 - smoothstep(0.55, 1.0, abs(position.x) * 2.0);
    float irreg = 0.9 + 0.1 * sin(a * 0.37 + uTime * 1.2) + 0.05 * sin(a * 0.91 - uTime * 2.3);
    float y = pf.y * irreg * mix(0.2, 1.0, vora);
    y += 0.45 * sin(a * 1.3 + s * 9.0 - uTime * 3.0) * vora * smoothstep(0.0, 0.25, s);
    float z = pf.x * mix(0.6, 1.0, vora) + a * a * 0.006;
    vec4 w = modelMatrix * vec4(a, y, z, 1.0);
    vMon = w.xyz;
    vS = s;
    vAcross = a;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uAlt;
  uniform float uOpac;
  varying vec3 vMon;
  varying float vS;
  varying float vAcross;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec3 n = normalize(cross(dFdx(vMon), dFdy(vMon)));
    vec3 v = normalize(cameraPosition - vMon);
    if (dot(n, v) < 0.0) n = -n;

    float alt = clamp(vMon.y / max(uAlt, 0.001), 0.0, 1.0);
    // Corrents que cauen per la cara de l'onada.
    float r = noise(vec2(vAcross * 0.45, vMon.y * 0.5 + uTime * 2.6)) * 0.6 + noise(vec2(vAcross * 1.4 + 5.0, vMon.y * 1.3 + uTime * 4.0)) * 0.4;
    vec3 fosc = vec3(0.02, 0.17, 0.3);
    vec3 clar = vec3(0.16, 0.6, 0.68);
    vec3 col = mix(fosc, clar, clamp(alt * 0.55 + r * 0.4, 0.0, 1.0));

    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.6);
    vec3 cel = mix(vec3(0.55, 0.74, 0.9), vec3(0.88, 0.95, 1.0), clamp(n.x * 0.5 + 0.5, 0.0, 1.0));
    col = mix(col, cel, fresnel * 0.3);
    // Llum a través de l'aigua fina de la cresta.
    col += vec3(0.1, 0.35, 0.3) * smoothstep(0.55, 1.0, alt) * 0.6;
    vec3 sol = normalize(vec3(0.4, 0.7, 0.3));
    col += vec3(1.0, 0.97, 0.88) * pow(max(dot(reflect(-sol, n), v), 0.0), 50.0) * 0.8;

    // Escuma: el llavi i la cresta, i regalims que baixen per la cara.
    float lavi = smoothstep(0.45, 0.52, vS) * (1.0 - smoothstep(0.7, 0.92, vS));
    float regalims = smoothstep(0.55, 0.85, noise(vec2(vAcross * 0.9, vMon.y * 0.9 + uTime * 3.0)));
    float escuma = clamp(lavi * (0.4 + 0.5 * r) + regalims * 0.14 * smoothstep(0.3, 0.9, alt) + smoothstep(0.9, 1.0, alt) * 0.3, 0.0, 1.0);
    col = mix(col, vec3(0.96, 0.99, 1.0), escuma);

    float alfa = clamp(0.74 + fresnel * 0.2 + escuma * 0.22, 0.0, 0.97) * uOpac;
    if (alfa < 0.02) discard;
    gl_FragColor = vec4(col, alfa);
  }
`;

export interface EstatOnada {
  /** Posició de la cresta (m) i cap a on viatja (rumb en radians de three.js: +z local cap a (sin, cos)). */
  x: number;
  z: number;
  yaw: number;
  /** Alçada de la cresta (m), grau de corba del llavi (0-1) i opacitat (0-1). */
  alt: number;
  corba: number;
  opacitat: number;
}

export class OnadaGegant {
  readonly malla: THREE.Mesh;
  private readonly geo: THREE.PlaneGeometry;
  private readonly mat: THREE.ShaderMaterial;
  private readonly perfil = Array.from({ length: PUNTS }, () => new THREE.Vector2());

  constructor(uTime: { value: number }) {
    this.geo = new THREE.PlaneGeometry(1, 1, 80, 48);
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime,
        uPerfil: { value: this.perfil },
        uAlt: { value: 1 },
        uOpac: { value: 0 },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    });
    this.malla = new THREE.Mesh(this.geo, this.mat);
    this.malla.frustumCulled = false;
    this.malla.renderOrder = 2;
    this.malla.visible = false;
  }

  posa(e: EstatOnada | null) {
    if (!e || e.opacitat < 0.01 || e.alt < 0.05) {
      this.malla.visible = false;
      return;
    }
    this.malla.visible = true;
    this.malla.position.set(e.x, 0, e.z);
    this.malla.rotation.y = e.yaw;
    this.mat.uniforms.uAlt.value = e.alt;
    this.mat.uniforms.uOpac.value = e.opacitat;

    // Perfil (z cap endavant, y amunt): esquena llarga, cresta, i cara del davant que es corba en un llavi.
    const H = e.alt;
    const C = e.corba;
    const B = H * 1.5;
    const davant = [
      // cara gairebé vertical (corba 0) → llavi que es corba cap endavant (corba 1)
      [0.1, 0.8, 0.2, 0.975],
      [0.15, 0.5, 0.33, 0.86],
      [0.17, 0.22, 0.36, 0.66],
      [0.2, 0.0, 0.26, 0.52],
    ];
    const punts: [number, number][] = [
      [-B, 0],
      [-0.68 * B, 0.14 * H],
      [-0.38 * B, 0.42 * H],
      [-0.14 * B, 0.78 * H],
      [0, H],
      ...davant.map(([vz, vy, cz, cy]): [number, number] => [(vz + (cz - vz) * C) * H, (vy + (cy - vy) * C) * H]),
    ];
    for (let i = 0; i < PUNTS; i++) this.perfil[i].set(punts[i][0], punts[i][1]);
  }

  dispose() {
    this.malla.parent?.remove(this.malla);
    this.geo.dispose();
    this.mat.dispose();
  }
}
