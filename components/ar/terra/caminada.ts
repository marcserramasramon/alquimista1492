import type { Object3D } from "three";

/** Ritme de la caminada, en radiants per segon (uns 0,4 passos per segon). */
const RITME = 2.4;

/**
 * Noms dels ossos segons el sistema de la rigging: CC_Base (Character Creator) o mixamorig (Mixamo,
 * també el que fa servir Mesh2Motion). Es busca el primer que existeixi al model.
 */
const NOMS: Record<string, string[]> = {
  cuixaE: ["CC_Base_L_Thigh", "mixamorig:LeftUpLeg"],
  cuixaD: ["CC_Base_R_Thigh", "mixamorig:RightUpLeg"],
  canellaE: ["CC_Base_L_Calf", "mixamorig:LeftLeg"],
  canellaD: ["CC_Base_R_Calf", "mixamorig:RightLeg"],
  braE: ["CC_Base_L_Upperarm", "mixamorig:LeftArm"],
  braD: ["CC_Base_R_Upperarm", "mixamorig:RightArm"],
  esquena1: ["CC_Base_Spine01", "mixamorig:Spine"],
  esquena2: ["CC_Base_Spine02", "mixamorig:Spine1"],
};

/** Prefixos dels noms d'ossos que reconeix l'animació. */
export const PREFIXOS_OSSOS = ["CC_Base_", "mixamorig:"];

/**
 * Caminada del gegant: les cames i els braços es balancegen en contrafase, els genolls es doblegen quan la
 * cama és enrere i el tronc oscil·la una mica. Només gira els ossos (les rotacions són locals; a repòs,
 * tots són identitat). `t` són els segons des de l'inici de l'escena.
 */
export function animaCaminada(ossos: Map<string, Object3D>, t: number): void {
  const fase = t * RITME;
  const s = Math.sin(fase);
  const c = Math.cos(fase);
  const gira = (clau: string, x: number, y = 0, z = 0) => {
    const os = NOMS[clau]?.map((nom) => ossos.get(nom)).find((o) => o !== undefined);
    if (os) os.rotation.set(x, y, z);
  };

  gira("cuixaE", 0.35 * s);
  gira("cuixaD", -0.35 * s);
  gira("canellaE", Math.max(0, -s) * 0.6);
  gira("canellaD", Math.max(0, s) * 0.6);

  gira("braE", -0.25 * s);
  gira("braD", 0.25 * s);

  gira("esquena1", 0.04 * c, 0, 0.05 * s);
  gira("esquena2", 0.03 * c, 0, -0.04 * s);
}
