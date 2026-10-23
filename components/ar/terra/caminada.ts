import type { Object3D } from "three";

/** Ritme de la caminada, en radiants per segon (uns 0,4 passos per segon). */
const RITME = 2.4;

/**
 * Noms dels ossos segons la rigging: CC_Base (Character Creator), mixamorig (Mixamo) o Mesh2Motion,
 * Es busca el primer nom que existeixi al model.
 */
const NOMS: Record<string, string[]> = {
  cuixaE: ["CC_Base_L_Thigh", "mixamorig:LeftUpLeg", "thigh_l"],
  cuixaD: ["CC_Base_R_Thigh", "mixamorig:RightUpLeg", "thigh_r"],
  canellaE: ["CC_Base_L_Calf", "mixamorig:LeftLeg", "calf_l"],
  canellaD: ["CC_Base_R_Calf", "mixamorig:RightLeg", "calf_r"],
  braE: ["CC_Base_L_Upperarm", "mixamorig:LeftArm", "upperarm_l"],
  braD: ["CC_Base_R_Upperarm", "mixamorig:RightArm", "upperarm_r"],
  esquena1: ["CC_Base_Spine01", "mixamorig:Spine", "spine_01"],
  esquena2: ["CC_Base_Spine02", "mixamorig:Spine1", "spine_02"],
};




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
