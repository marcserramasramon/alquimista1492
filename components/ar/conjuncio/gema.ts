import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * Pedra filosofal en 3D (prototip local, mai publicat). Rèplica de la imatge pedra-filosofal.webp: una cara
 * pentagonal al davant (la «taula»), un anell de cares inclinades al darrere i una punta al fons, tot amb
 * cares planes. El color és blau plata, i com que és metàl·lica reflecteix un entorn de llum.
 *
 * Les posicions són en l'espai de la càmera (x = dreta, y = amunt, z = −endavant), el mateix de projecta()
 * a cel.ts, així la gema encaixa amb el cel dibuixat al canvas 2D.
 */

export interface EstatGema {
  /** Posició en l'espai de la càmera. */
  x: number;
  y: number;
  z: number;
  /** Gir al voltant de l'eix vertical (rad). */
  gir: number;
  escala: number;
  /** 0–1: intensitat del resplendor propi. */
  brillantor: number;
  /** Mida del canvas i projecció (com al canvas 2D). */
  w: number;
  h: number;
  focal: number;
  /** Altura (px) del centre de projecció (el punt de mira). */
  cy: number;
}

export interface Gema {
  /** Dibuixa la gema; amb `null` buida el canvas. */
  pinta: (estat: EstatGema | null) => void;
  destrueix: () => void;
}

const RAD = Math.PI / 180;

function pentagon(r: number, z: number, graus: number): THREE.Vector3[] {
  return [0, 1, 2, 3, 4].map((k) => {
    const a = (90 + graus + k * 72) * RAD;
    return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z);
  });
}

/** Geometria amb cares planes: taula pentagonal, corona (cares inclinades), cintura i pavelló fins a la punta. */
function geometriaGema(): THREE.BufferGeometry {
  const taula = pentagon(0.56, 0.42, 11); // lleugerament girada: les cares de la corona no són planes del tot
  const cintura = pentagon(1, 0, 0);
  const mig = pentagon(0.6, -0.46, 36);
  const punta = new THREE.Vector3(0, 0, -0.92);
  const centreTaula = new THREE.Vector3(0, 0, 0.42);
  const centre = new THREE.Vector3(0, 0, -0.1);

  const posicions: number[] = [];
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    // Ordena els vèrtexs perquè la cara miri cap a fora.
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    const cm = new THREE.Vector3().add(a).add(b).add(c).multiplyScalar(1 / 3).sub(centre);
    const [p, q] = n.dot(cm) < 0 ? [c, b] : [b, c];
    posicions.push(a.x, a.y, a.z, p.x, p.y, p.z, q.x, q.y, q.z);
  };

  for (let k = 0; k < 5; k++) {
    const k1 = (k + 1) % 5;
    const k0 = (k + 4) % 5;
    tri(centreTaula, taula[k], taula[k1]); // taula
    tri(taula[k], cintura[k], cintura[k1]); // corona (cada cara, en dos triangles)
    tri(taula[k], cintura[k1], taula[k1]);
    tri(cintura[k], cintura[k1], mig[k]); // pavelló, part de dalt
    tri(mig[k0], mig[k], cintura[k]);
    tri(mig[k], mig[k1], punta); // pavelló, fins a la punta
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(posicions, 3));
  g.computeVertexNormals();
  return g;
}

export function crearGema(canvas: HTMLCanvasElement): Gema {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const escena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const entorn = pmrem.fromScene(new RoomEnvironment(), 0.04);
  escena.environment = entorn.texture;

  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 200);

  const geometria = geometriaGema();
  const material = new THREE.MeshStandardMaterial({
    color: 0xa6bdf2, // blau plata
    metalness: 0.95,
    roughness: 0.14,
    envMapIntensity: 1.7,
    emissive: 0x2f57ff,
    emissiveIntensity: 0.2,
    flatShading: true,
  });
  const malla = new THREE.Mesh(geometria, material);
  const arestesGeo = new THREE.EdgesGeometry(geometria, 15);
  const arestesMat = new THREE.LineBasicMaterial({ color: 0xe9f1ff, transparent: true, opacity: 0.8 });
  const arestes = new THREE.LineSegments(arestesGeo, arestesMat);

  const grup = new THREE.Group();
  grup.add(malla, arestes);
  escena.add(grup);

  const llumBlava = new THREE.PointLight(0x7ea6ff, 26, 0, 2);
  const llumBlanca = new THREE.PointLight(0xffffff, 18, 0, 2);
  escena.add(llumBlava, llumBlanca);

  let amplada = 0;
  let alcada = 0;

  function pinta(estat: EstatGema | null) {
    if (!estat) {
      renderer.clear();
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (estat.w !== amplada || estat.h !== alcada) {
      amplada = estat.w;
      alcada = estat.h;
      renderer.setPixelRatio(dpr);
      renderer.setSize(amplada, alcada, false);
    }
    // La mateixa projecció que el canvas 2D: focal en píxels i centre de projecció a (w/2, cy).
    camera.fov = (2 * Math.atan(estat.h / 2 / estat.focal)) / RAD;
    camera.aspect = estat.w / estat.h;
    camera.setViewOffset(estat.w, estat.h, 0, estat.h / 2 - estat.cy, estat.w, estat.h);
    camera.updateProjectionMatrix();

    grup.position.set(estat.x, estat.y, estat.z);
    grup.scale.setScalar(estat.escala);
    // De cara, la gema es veu com a la imatge (pentàgon al davant); en girar, apareixen la corona i el pavelló.
    grup.rotation.set(-0.22, estat.gir, 0.06 * Math.sin(estat.gir * 0.7));
    material.emissiveIntensity = 0.15 + 0.5 * estat.brillantor;
    arestesMat.opacity = 0.6 + 0.4 * estat.brillantor;

    // Dues llums que voltegen la gema fan passar els reflexos per les cares.
    const t = estat.gir;
    llumBlava.position.set(estat.x + Math.cos(t * 1.7) * 1.4, estat.y + 0.8, estat.z + Math.sin(t * 1.7) * 1.4 + 0.6);
    llumBlanca.position.set(estat.x - Math.cos(t * 1.1) * 1.6, estat.y - 0.5, estat.z + Math.sin(t * 1.1) * 1.6 + 0.8);

    renderer.render(escena, camera);
  }

  function destrueix() {
    geometria.dispose();
    arestesGeo.dispose();
    material.dispose();
    arestesMat.dispose();
    entorn.dispose();
    pmrem.dispose();
    renderer.dispose();
  }

  return { pinta, destrueix };
}
