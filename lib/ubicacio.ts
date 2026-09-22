import { z } from "zod";

/** Cada quant s'envia la posició (equips i màster). Fix de moment; configurable més endavant. */
export const INTERVAL_UBICACIO_MS = 30_000;

/** El servidor ignora posicions que arribin més de pressa que això (defensa contra clients que no respectin l'interval). */
export const MINIM_ENTRE_UBICACIONS_MS = 10_000;

/** Una posició del màster més antiga que això no s'ensenya als equips (mòbil sense bateria, sense cobertura...). */
export const MAXIMA_EDAT_UBICACIO_MASTER_MS = 10 * 60_000;

/** A menys d'aquesta distància d'una fita, la fita s'obre sola. */
export const RADI_OBERTURA_M = 20;

/** Distància en metres entre dos punts (fórmula del semiverset). */
export function distanciaMetres(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6_371_000;
  const rad = (graus: number) => (graus * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const UbicacioSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(100_000).optional(),
});

export type Ubicacio = z.infer<typeof UbicacioSchema>;

/** Decisió de l'equip a la pantalla de consentiment, desada en aquest mòbil. */
const CLAU_CONSENTIMENT = "ubicacio-consentiment";

export type DecisioUbicacio = "si" | "no";

export function llegirDecisioUbicacio(): DecisioUbicacio | null {
  try {
    const valor = window.localStorage.getItem(CLAU_CONSENTIMENT);
    return valor === "si" || valor === "no" ? valor : null;
  } catch {
    return null;
  }
}

export function desarDecisioUbicacio(decisio: DecisioUbicacio) {
  try {
    window.localStorage.setItem(CLAU_CONSENTIMENT, decisio);
  } catch {
    // Navegació privada o emmagatzematge bloquejat: es tornarà a preguntar.
  }
}
