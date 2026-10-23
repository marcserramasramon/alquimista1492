import type * as THREE from "three";

/** Ritme de la caminada, en radiants per segon (uns 0,4 passos per segon). */
const RITME = 2.4;

/**
 * Caminada del gegant: les cames i els braços es balancegen en contrafase, els genolls es doblegen quan la
 * cama és enrere i el tronc oscil·la una mica. Només gira els ossos (les rotacions són locals; a repòs,
 * tots són identitat). `t` són els segons des de l'inici de l'escena.
 */
export function animaCaminada(ossos: Map<string, THREE.Object3D>, t: number): void {
  const fase = t * RITME;
  const s = Math.sin(fase);
  const c = Math.cos(fase);
  const gira = (nom: string, x: number, y = 0, z = 0) => {
    const os = ossos.get(nom);
    if (os) os.rotation.set(x, y, z);
  };

  gira("CC_Base_L_Thigh", 0.35 * s);
  gira("CC_Base_R_Thigh", -0.35 * s);
  gira("CC_Base_L_Calf", Math.max(0, -s) * 0.6);
  gira("CC_Base_R_Calf", Math.max(0, s) * 0.6);

  gira("CC_Base_L_Upperarm", -0.25 * s);
  gira("CC_Base_R_Upperarm", 0.25 * s);

  gira("CC_Base_Spine01", 0.04 * c, 0, 0.05 * s);
  gira("CC_Base_Spine02", 0.03 * c, 0, -0.04 * s);
}
