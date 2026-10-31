import "server-only";

/**
 * Posicions de les cinc estrelles de «La Conjunció dels Astres» (l'AR final) — NOMÉS des de codi de servidor.
 *
 * Les estrelles són un pentagrama sobre el Pla del Masset: l'azimut de cada una és el de la seva fita des del
 * centre del Gresol, i l'elevació és ELEVACIO_PENTAGRAMA. Els càlculs usen les coordenades públiques de les
 * fites, però la posició final (i la tolerància de lock) només viu aquí. El client rep una estrella només quan
 * el mòbil és a prop (ver app/api/conjuncio).
 */

import { ELEMENTS, ESTACIONS, type Element } from "@/content/public/estacions";
import { ELEVACIO_PENTAGRAMA, codisDesDir, dirDesAzEl, dirDesCodis, errorAngular, type V3 } from "@/lib/conjuncio/cel";

/** Mateix ordre que els canals de l'AR (aigua, foc, terra, aire, ànima). */
export const ORDRE_ESTRELLES: Element[] = ["aigua", "foc", "terra", "aire", "anima"];

/** Àrea gran (graus) dins la qual el servidor deixa veure una estrella al client. */
export const AREA_ESTRELLA_GRAUS = 20;
/** Tolerància (graus) per fer lock amb el mòbil. */
export const TOLERANCIA_LOCK_MOBIL_GRAUS = 3;
/** Tolerància (graus) per fer lock amb els dials: més estricta, perquè s'ha d'afinar a mà. */
export const TOLERANCIA_LOCK_DIALS_GRAUS = 0.5;

const CENTRE = ESTACIONS.find((e) => e.id === "gresol")!;

function azimutFita(element: Element): number {
  const fita = ESTACIONS.find((e) => e.element === element)!;
  const nord = (fita.latitud - CENTRE.latitud) * 111_200;
  const est = (fita.longitud - CENTRE.longitud) * 111_320 * Math.cos((CENTRE.latitud * Math.PI) / 180);
  return ((Math.atan2(est, nord) * 180) / Math.PI + 360) % 360;
}

/**
 * Direcció de cada estrella, arrodonida als dos números (X, Z) com al prototip: així el lock i el dibuix
 * es basen exactament en la mateixa posició.
 */
export const ESTRELLES_DIR: V3[] = ORDRE_ESTRELLES.map((element) => {
  const [x, z] = codisDesDir(dirDesAzEl(azimutFita(element), ELEVACIO_PENTAGRAMA));
  return dirDesCodis(x, z);
});

/** Índex de l'estrella més propera a `aim` dins de `area` graus, o -1 si no n'hi ha cap. */
export function estrellaProperaA(aim: V3, area: number): number {
  let millor = -1;
  let millorErr = area;
  ESTRELLES_DIR.forEach((d, i) => {
    const e = errorAngular(aim, d);
    if (e <= millorErr) {
      millor = i;
      millorErr = e;
    }
  });
  return millor;
}
