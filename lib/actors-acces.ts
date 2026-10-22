import "server-only";

import { createHash } from "crypto";

/** Nom de la cookie que guarda que la persona ja ha posat la contrasenya de la pàgina d'actors. */
export const COOKIE_ACTORS = "actors-acces";

/**
 * Testimoni que es guarda a la cookie després d'entrar la contrasenya. No és la contrasenya:
 * és un resum amb sal, que només es pot calcular amb ACTORS_PASSWORD. Sense la variable
 * d'entorn no hi ha cap testimoni vàlid, i per tant la pàgina queda tancada.
 */
export function fitxaAcces(): string | null {
  const contrasenya = process.env.ACTORS_PASSWORD;
  if (!contrasenya) return null;
  return createHash("sha256").update(`actors:${contrasenya}`).digest("hex");
}
