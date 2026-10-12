import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { diferenciaRumb } from "@/lib/orientacio";

/**
 * El lleó d'aigua: un lleó animat (esquelet de 27 ossos i un sol cicle de caminar, sense avançar) amb la pell
 * feta d'aigua. Surt del riu, camina cap al jugador, s'atura, rugeix i es desfà en aigua.
 *
 * El clip només mou les potes en el lloc: el moviment pel món (posició, gir, parades) el dicta aquest codi,
 * amb la velocitat dels passos lligada a la del cos perquè no rellisquin. El cap, el pit i la cua es mouen per
 * damunt del clip amb ossos procedurals (respiració, rugit, cua).
 */

export type EsdevenimentLleo = "rugit" | "desfer";

/** El que el lleó necessita del món on viu. */
export interface MonLleo {
  /** Direcció del riu (cap a on corre, unitari): el lleó hi puja de cara al jugador. */
  dirX: number;
  dirZ: number;
  gotes(x: number, y: number, z: number, n: number, vx: number, vy: number, vz: number, dispersio: number): void;
  esdeveniment(e: EsdevenimentLleo): void;
  /** Volum (0-1) de les passes pel riu; es crida cada quadre mentre camina. */
  passes(volum: number): void;
}

const URL_MODEL = "/models/lleo-aigua.glb";
/** Quantes vegades més gran que un lleó de debò (1,3 m) és aquest. */
const K = 8;
/** Alçada total del lleó (m). */
const ALCADA = 1.3 * K;
const DIST_INICI = 70;
const DIST_PARADA = 24;
const VELOCITAT = 6;
/** Velocitat (m/s) a què el cicle del clip, a velocitat 1, no fa rellisar els peus. */
const VELOCITAT_CICLE = 1.5 * K;
/** Quant el model està girat respecte de +z (rad), perquè miri cap on toca. */
const GIR_MODEL = 0;
/** Signe de «cap amunt» en l'eix X dels ossos del cap i el pit. */
const AMUNT = -1;

const MOSTRA_PLENA = 1.15;

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
const alea = (a: number, b: number) => a + Math.random() * (b - a);

const VERTEX = /* glsl */ `
  #include <common>
  #include <skinning_pars_vertex>
  varying vec3 vNorm;
  varying vec3 vMon;
  void main() {
    #include <beginnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <begin_vertex>
    #include <skinning_vertex>
    vec4 w = modelMatrix * vec4(transformed, 1.0);
    vMon = w.xyz;
    vNorm = normalize(mat3(modelMatrix) * objectNormal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uShow;
  uniform float uBaseY;
  uniform float uAlt;
  uniform float uEsc;
  varying vec3 vNorm;
  varying vec3 vMon;

  float hash3(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x),
                   mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x),
                   mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  // L'aigua del cos: corrents que baixen, una mica remolinats.
  float aiguaCos(vec3 p) {
    p.y += uTime * 1.3;
    p.xz += vec2(sin(p.y * 1.7 + uTime), cos(p.y * 1.3 - uTime)) * 0.12;
    return noise3(p * 4.0) * 0.6 + noise3(p * 9.0 + 3.1) * 0.4;
  }

  void main() {
    // Desfeta/forma: de baix a dalt, amb soroll perquè s'esfilagarsi.
    float h01 = clamp((vMon.y - uBaseY) / uAlt, 0.0, 1.0);
    vec3 q = vMon / uEsc;
    float llindar = h01 * 0.78 + noise3(q * 12.0 + 11.0) * 0.22;
    if (llindar > uShow) discard;
    float vora = 1.0 - smoothstep(0.0, 0.09, uShow - llindar);

    vec3 v = normalize(cameraPosition - vMon);
    float e = 0.05;
    float f0 = aiguaCos(q);
    vec3 g = vec3(aiguaCos(q + vec3(e, 0.0, 0.0)) - f0, aiguaCos(q + vec3(0.0, e, 0.0)) - f0, aiguaCos(q + vec3(0.0, 0.0, e)) - f0) / e;
    vec3 n = normalize(normalize(vNorm) - 0.22 * g);

    float fons = clamp(0.35 + f0 * 0.6 + n.y * 0.2, 0.0, 1.0);
    vec3 col = mix(vec3(0.03, 0.2, 0.34), vec3(0.2, 0.64, 0.72), fons);
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.4);
    vec3 cel = mix(vec3(0.55, 0.74, 0.9), vec3(0.88, 0.95, 1.0), clamp(n.x * 0.5 + 0.5, 0.0, 1.0));
    col = mix(col, cel, fresnel * 0.8);
    vec3 sol = normalize(vec3(0.4, 0.7, 0.3));
    float brillant = pow(max(dot(reflect(-sol, n), v), 0.0), 40.0);
    col += vec3(1.0, 0.97, 0.88) * brillant * 0.9;

    // Escuma: ratlles clares que baixen pel cos.
    float ratlla = noise3(vec3(q.x * 3.0, q.y * 6.0 + uTime * 3.4, q.z * 3.0));
    float escuma = smoothstep(0.68, 0.86, ratlla) * (0.35 + 0.65 * (1.0 - h01));
    col = mix(col, vec3(0.95, 0.98, 1.0), escuma * 0.85);
    col = mix(col, vec3(0.92, 0.99, 1.0), vora);

    float alfa = clamp(0.68 + fresnel * 0.3 + escuma * 0.25 + vora, 0.0, 0.96);
    gl_FragColor = vec4(col, alfa);
  }
`;

type Fase = "pausa" | "avis" | "camina" | "para" | "rugeix" | "desfa" | "fi";

export class LleoAigua {
  readonly arrel = new THREE.Group();
  private readonly mixer: THREE.AnimationMixer;
  private readonly accio: THREE.AnimationAction;
  private readonly material: THREE.ShaderMaterial;
  private readonly ossos: Record<string, THREE.Object3D | undefined> = {};
  private readonly base = new Map<THREE.Object3D, THREE.Quaternion>();
  private readonly onades: { malla: THREE.Mesh; edat: number }[] = [];
  private readonly lliberables: { dispose(): void }[] = [];
  private fase: Fase = "pausa";
  private tFase = 0;
  private temps = 0;
  private dist = DIST_INICI;
  private yaw = 0;
  private enfonsat = 0;
  private pas = 0;
  private rugitDit = false;
  /** Costats des d'on vindrà, en graus respecte de l'eix del riu: primer l'eix i després l'oposat, un cop cadascun. */
  private readonly ordre = [0, 180];
  private torn = 0;
  private mirat = 0;
  /** Direcció (unitària) i rumb en graus des d'on arriba en aquest torn. */
  private dx = 0;
  private dz = -1;
  private rumbTorn = 0;
  private passosSonant = false;
  private acumulat = 0;
  private escala = 1;
  private readonly v3 = new THREE.Vector3();

  private constructor(
    gltf: { scene: THREE.Group; animations: THREE.AnimationClip[] },
    uTime: { value: number },
    private readonly mon: MonLleo,
  ) {
    const model = gltf.scene;
    this.arrel.add(model);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime,
        uShow: { value: 0 },
        uBaseY: { value: 0 },
        uAlt: { value: ALCADA },
        uEsc: { value: K },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: true,
    });
    this.lliberables.push(this.material);
    model.traverse((o) => {
      const malla = o as THREE.SkinnedMesh;
      if (malla.isMesh) {
        malla.material = this.material;
        malla.frustumCulled = false;
        malla.renderOrder = 1;
      }
      if (o.name) this.ossos[o.name] = o;
    });

    // Mida: alçada ALCADA, peus a terra i centrat.
    this.arrel.updateMatrixWorld(true);
    const caixa = new THREE.Box3().setFromObject(model, true);
    const mida = caixa.getSize(new THREE.Vector3());
    const centre = caixa.getCenter(new THREE.Vector3());
    model.position.set(-centre.x, -caixa.min.y, -centre.z);
    this.escala = ALCADA / Math.max(1e-6, mida.y);
    this.arrel.scale.setScalar(this.escala);

    for (const nom of ["Hips", "chest", "head", "tail1", "tail2", "tail3"]) {
      const os = this.ossos[nom];
      if (os) this.base.set(os, os.quaternion.clone());
    }

    this.mixer = new THREE.AnimationMixer(model);
    this.accio = this.mixer.clipAction(gltf.animations[0]);
    this.accio.play();
    this.accio.setEffectiveWeight(0);

    // Onades: dos anells blancs que s'obren sobre l'aigua.
    const geoAnell = new THREE.RingGeometry(0.86, 1, 48);
    geoAnell.rotateX(-Math.PI / 2);
    this.lliberables.push(geoAnell);
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xeaf8ff, transparent: true, depthWrite: false, opacity: 0 });
      const malla = new THREE.Mesh(geoAnell, mat);
      malla.renderOrder = 3;
      malla.visible = false;
      malla.frustumCulled = false;
      this.onades.push({ malla, edat: 99 });
      this.lliberables.push(mat);
    }

    this.arrel.visible = false;
    this.material.uniforms.uShow.value = 0;
  }

  static async carrega(uTime: { value: number }, mon: MonLleo): Promise<LleoAigua> {
    const gltf = await new GLTFLoader().loadAsync(URL_MODEL);
    return new LleoAigua(gltf, uTime, mon);
  }

  /** Les onades han d'estar a l'escena, no dins del lleó (que es gira i s'escala). */
  afegeixA(escena: THREE.Scene) {
    escena.add(this.arrel);
    for (const o of this.onades) escena.add(o.malla);
  }

  private onada(x: number, z: number) {
    const lliure = this.onades.find((o) => o.edat > 2.2) ?? this.onades[0];
    lliure.edat = 0;
    lliure.malla.position.set(x, 0.05, z);
    lliure.malla.visible = true;
  }

  private canviaFase(f: Fase) {
    this.fase = f;
    this.tFase = 0;
  }

  private rumbCapAlJugador() {
    return Math.atan2(-this.dx, -this.dz) + GIR_MODEL;
  }

  /** Tria el costat del torn i en dóna l'avís (la vora blava) fins que el jugador hi mira. */
  private iniciaTorn() {
    if (this.torn >= this.ordre.length) {
      this.canviaFase("fi");
      return;
    }
    const r = Math.atan2(this.mon.dirX, -this.mon.dirZ) + (this.ordre[this.torn] * Math.PI) / 180;
    this.dx = Math.sin(r);
    this.dz = -Math.cos(r);
    this.rumbTorn = ((((r * 180) / Math.PI) % 360) + 360) % 360;
    this.mirat = 0;
    this.canviaFase("avis");
  }

  /**
   * Cap a on s'ha de mirar per veure'l (rumb) i amb quina força s'il·lumina la vora de la pantalla: des de
   * l'avís fins que es desfà del tot. Null quan no hi ha res a indicar.
   */
  get guia(): { rumb: number; intensitat: number } | null {
    if (this.fase === "pausa" || this.fase === "fi") return null;
    const intensitat = this.fase === "desfa" ? 1 - ease(this.tFase / 4.2) : 1;
    return intensitat > 0.02 ? { rumb: this.rumbTorn, intensitat } : null;
  }

  private reinicia() {
    this.dist = DIST_INICI;
    this.yaw = this.rumbCapAlJugador();
    this.enfonsat = 0;
    this.pas = 0;
    this.rugitDit = false;
    this.arrel.visible = true;
    this.material.uniforms.uShow.value = 0;
    this.onada(this.dx * this.dist, this.dz * this.dist);
    this.canviaFase("camina");
  }

  /** Passos que esquitxen: unes gotes al terra, amb la velocitat del lleó. */
  private esquitxaPeus(x: number, z: number) {
    const cap = this.yaw - GIR_MODEL;
    const costat = (Math.random() < 0.5 ? -0.22 : 0.22) * K;
    const lx = Math.cos(cap) * costat;
    const lz = -Math.sin(cap) * costat;
    this.mon.gotes(x + lx + Math.sin(cap) * alea(-0.3, 0.4) * K, 0.05, z + lz + Math.cos(cap) * alea(-0.3, 0.4) * K, 14, 0, alea(2.5, 4.5), 0, 2.2);
  }

  actualitza(dt: number, rumbMirada: number) {
    this.temps += dt;
    this.tFase += dt;
    const t = this.tFase;
    let pesCamina = 0;
    let velocitatClip = 1;
    let show = Number(this.material.uniforms.uShow.value);
    let rugit = 0;
    let anticip = 0;
    let volumPassos = 0;

    switch (this.fase) {
      case "pausa":
        if (t > (this.temps < 4 ? 1.2 : 3.2)) this.iniciaTorn();
        break;

      case "avis":
        // Espera que el jugador giri cap al costat i hi miri un moment: llavors surt.
        if (t > 2.5 && Math.abs(diferenciaRumb(this.rumbTorn, rumbMirada)) < 24) this.mirat += dt;
        else this.mirat = Math.max(0, this.mirat - dt);
        if (this.mirat > 0.7) {
          this.torn++;
          this.reinicia();
        }
        break;

      case "fi":
        break;

      case "camina": {
        const queda = this.dist - DIST_PARADA;
        const v = VELOCITAT * Math.max(0.3, Math.min(1, queda / 1.5));
        this.dist -= v * dt;
        velocitatClip = v / VELOCITAT_CICLE;
        pesCamina = 1;
        volumPassos = 0.15 + 0.85 * ease(1 - queda / (DIST_INICI - DIST_PARADA));
        show = Math.min(MOSTRA_PLENA, (t / 1.5) * MOSTRA_PLENA);
        this.pas += dt * velocitatClip * 4;
        if (this.pas >= 1) {
          this.pas -= 1;
          this.esquitxaPeus(this.dx * this.dist, this.dz * this.dist);
        }
        if (this.dist <= DIST_PARADA) this.canviaFase("para");
        break;
      }

      case "para":
        pesCamina = 1 - ease(t / 0.6);
        volumPassos = 0.6 * pesCamina;
        velocitatClip = 0.4 + 0.2 * pesCamina;
        if (t > 0.7) this.canviaFase("rugeix");
        break;

      case "rugeix": {
        // Agafa aire (0-0.35), rugeix (0.3-2.6, el que dura el so) i s'afluixa (2.5-3.2).
        anticip = ease(t / 0.35) * (1 - ease((t - 0.35) / 0.2));
        rugit = ease((t - 0.3) / 0.2) * (1 - ease((t - 2.5) / 0.7));
        if (t >= 0.3 && !this.rugitDit) {
          this.rugitDit = true;
          this.mon.esdeveniment("rugit");
        }
        if (t > 0.4 && t < 2.5) {
          this.acumulat += dt * 110;
          const n = Math.floor(this.acumulat);
          this.acumulat -= n;
          const boca = this.ossos.headend;
          if (boca && n > 0) {
            boca.getWorldPosition(this.v3);
            const cap = this.yaw - GIR_MODEL;
            this.mon.gotes(this.v3.x, this.v3.y, this.v3.z, n, Math.sin(cap) * 9, alea(0.5, 3), Math.cos(cap) * 9, 3);
          }
        }
        if (t > 3.2) {
          this.canviaFase("desfa");
          this.mon.esdeveniment("desfer");
          this.onada(this.dx * this.dist, this.dz * this.dist);
        }
        break;
      }

      case "desfa": {
        const d = ease(t / 4.2);
        show = MOSTRA_PLENA * (1 - d);
        this.enfonsat = d * 0.45 * K;
        // Gotes que cauen del cos que es deshà.
        this.acumulat += dt * 200 * (1 - d * 0.6);
        const n = Math.floor(this.acumulat);
        this.acumulat -= n;
        if (n > 0 && show > 0.05) {
          const alt = Math.min(1, show / MOSTRA_PLENA) * ALCADA;
          this.mon.gotes(
            this.dx * this.dist + alea(-0.45, 0.45) * K,
            alea(0.1, Math.max(0.2, alt)),
            this.dz * this.dist + alea(-0.45, 0.45) * K,
            n,
            0,
            alea(-0.5, 1.5),
            0,
            2,
          );
        }
        if (t > 3.0 && t - dt <= 3.0) this.onada(this.dx * this.dist, this.dz * this.dist);
        if (t > 4.4) {
          this.arrel.visible = false;
          this.canviaFase("pausa");
        }
        break;
      }
    }

    if (volumPassos > 0 || this.passosSonant) this.mon.passes(volumPassos);
    this.passosSonant = volumPassos > 0;

    // Clip: pes i velocitat dels passos.
    this.accio.setEffectiveWeight(pesCamina);
    this.accio.timeScale = velocitatClip;

    // Ossos: desfà el que s'hi va posar l'últim quadre, deixa que el clip els mogui i torna-hi a posar el gest.
    for (const [os, q] of this.base) os.quaternion.copy(q);
    this.mixer.update(dt);
    for (const [os, q] of this.base) q.copy(os.quaternion);
    this.posa(rugit, anticip, pesCamina);

    const tot = this.arrel;
    tot.position.set(this.dx * this.dist, -this.enfonsat, this.dz * this.dist);
    tot.rotation.y = this.yaw;
    tot.scale.setScalar(this.escala * (1 + 0.025 * Math.sin(this.temps * 41) * rugit));
    this.material.uniforms.uShow.value = show;
    this.material.uniforms.uBaseY.value = tot.position.y;

    for (const o of this.onades) {
      o.edat += dt;
      const vida = o.edat / 2.2;
      o.malla.visible = vida < 1;
      if (vida < 1) {
        o.malla.scale.setScalar((0.4 + vida * 2.6) * K);
        (o.malla.material as THREE.MeshBasicMaterial).opacity = (1 - vida) * 0.7;
      }
    }
  }

  /** Gest per damunt del clip: respiració, rugit i cua. */
  private posa(rugit: number, anticip: number, pesCamina: number) {
    const t = this.temps;
    const pit = this.ossos.chest;
    const cap = this.ossos.head;
    pit?.rotateX(AMUNT * (0.02 * Math.sin(t * 2.3) + 0.2 * rugit - 0.07 * anticip));
    cap?.rotateX(AMUNT * (0.5 * rugit - 0.18 * anticip));
    cap?.rotateZ(Math.sin(t * 47) * 0.035 * rugit);
    const cua = 1 - 0.55 * pesCamina;
    this.ossos.tail1?.rotateZ(0.22 * Math.sin(t * 3.1) * cua);
    this.ossos.tail2?.rotateZ(0.3 * Math.sin(t * 3.1 - 0.7) * cua);
    this.ossos.tail3?.rotateZ(0.42 * Math.sin(t * 3.1 - 1.4) * cua);
  }

  dispose() {
    this.mixer.stopAllAction();
    this.arrel.parent?.remove(this.arrel);
    for (const o of this.onades) o.malla.parent?.remove(o.malla);
    for (const l of this.lliberables) l.dispose();
    this.arrel.traverse((o) => {
      const malla = o as THREE.Mesh;
      if (malla.isMesh) malla.geometry.dispose();
    });
  }
}
