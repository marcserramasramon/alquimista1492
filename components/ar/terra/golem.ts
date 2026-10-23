import type * as THREE from "three";

type Tres = typeof THREE;

/**
 * Gegant de pedra com el de la imatge de referència: un cos de pedres planes i arrodonides apilades, uns
 * braços que pengen, un cap de pedra amb dos ulls ambre que brillen i unes arrels fines. Es construeix a
 * partir de primitives, sense models externs. Unitats en metres: la base és a y = 0, la figura mira cap a +z
 * i fa uns 6 m d'alçada.
 */

/** Generador pseudoaleatori determinista: el gegant és sempre igual. */
function llavor(valor: number): () => number {
  let s = valor >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Una pedra aixafada de radi `r` i alçada `alcada`, a la posició indicada. */
function pedra(T: Tres, geometria: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, r: number, alcada: number, rnd: () => number): THREE.Mesh {
  const m = new T.Mesh(geometria, material);
  m.scale.set(r, alcada, r * (0.8 + 0.4 * rnd()));
  m.position.set(x, y, z);
  m.rotation.set(rnd() * 0.4, rnd() * Math.PI * 2, rnd() * 0.4);
  return m;
}

/** Construeix el gegant. `T` és el mòdul de Three.js ja carregat. */
export function construirGolem(T: Tres): THREE.Group {
  const rnd = llavor(1472);
  const grup = new T.Group();

  const geometriaPedra = new T.SphereGeometry(1, 10, 7);
  const materialPedra = new T.MeshStandardMaterial({ color: 0x6f675c, roughness: 0.95, metalness: 0 });
  const materialArrel = new T.MeshStandardMaterial({ color: 0x3b3224, roughness: 1 });
  const materialOll = new T.MeshBasicMaterial({ color: 0xffb040 });

  // Cames: dues columnes de pedres apilades.
  for (const sx of [-0.9, 0.9]) {
    for (const y of [0.5, 1.3, 2.1, 2.9]) {
      grup.add(pedra(T, geometriaPedra, materialPedra, sx + (rnd() - 0.5) * 0.3, y, (rnd() - 0.5) * 0.3, 0.75, 0.42, rnd));
    }
  }

  // Malucs i pelvis.
  for (let i = 0; i < 5; i++) {
    grup.add(pedra(T, geometriaPedra, materialPedra, -1.2 + i * 0.6, 3.5, (rnd() - 0.5) * 0.3, 0.55, 0.38, rnd));
  }

  // Tronc: dues files de pedres grans, com el pit de la imatge.
  for (const y of [4.2, 5.0]) {
    for (let i = 0; i < 5; i++) {
      grup.add(pedra(T, geometriaPedra, materialPedra, -1.2 + i * 0.6, y, 0.45 + (rnd() - 0.5) * 0.2, 0.62, 0.5, rnd));
    }
  }

  // Braços: pedres que baixen i s'obren cap a fora.
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      grup.add(pedra(T, geometriaPedra, materialPedra, sx * (1.9 + i * 0.12), 4.3 - i * 0.7, 0.1 + (rnd() - 0.5) * 0.2, 0.55, 0.4, rnd));
    }
  }

  // Cap: una pedra gran amb dues obertures on van els ulls.
  grup.add(pedra(T, geometriaPedra, materialPedra, 0, 5.9, 0, 0.9, 0.85, rnd));
  for (const sx of [-0.35, 0.35]) {
    const oll = new T.Mesh(new T.SphereGeometry(0.12, 10, 8), materialOll);
    oll.position.set(sx, 5.95, 0.85);
    grup.add(oll);
  }

  // Llum ambre dels ulls, que il·lumina les pedres de prop.
  const llum = new T.PointLight(0xffb040, 2.2, 9, 1.6);
  llum.position.set(0, 5.95, 1.1);
  grup.add(llum);

  // Arrels fines que pengen del cos.
  for (const [inici, fi] of [
    [new T.Vector3(0.8, 5.5, 0.5), new T.Vector3(2.4, 2.8, -0.2)],
    [new T.Vector3(-0.9, 4.8, 0.4), new T.Vector3(-2.2, 2.2, 0.1)],
    [new T.Vector3(0.2, 3.9, 0.7), new T.Vector3(1.0, 0.6, 1.1)],
  ] as const) {
    const corba = new T.CatmullRomCurve3([inici, inici.clone().lerp(fi, 0.5).add(new T.Vector3(0.3, 0, 0.2)), fi]);
    grup.add(new T.Mesh(new T.TubeGeometry(corba, 12, 0.03, 5, false), materialArrel));
  }

  return grup;
}
