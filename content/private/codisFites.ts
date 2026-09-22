import "server-only";

/**
 * Codis dels QR de les fites — NOMÉS accessible des de codi de servidor.
 *
 * Cada cartell físic porta un QR amb `{APP_URL}/s/{estacioId}?c={codi}` i,
 * a sota, el codi escrit perquè es pugui entrar a mà. Qui té el codi pot
 * obrir la fita sense ser-hi, per això no s'envia mai al client.
 * Sense 0/O/1/I per evitar confusions en teclejar-lo.
 */
export const CODIS_FITES: Record<string, string> = {
  "font-ferro": "LXR4A",
  "planes-bones": "TMQ7K",
  foc: "FWZ3E",
  aire: "PHN8S",
  anima: "GVD5C",
};

/** Normalitza el que ha escanejat o teclejat l'equip: majúscules i sense espais. */
export function normalitzaCodi(codi: string): string {
  return codi.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Accepta el codi sol o l'URL sencera del QR (`...?c=CODI`). */
function extreuCodi(text: string): string {
  try {
    return new URL(text).searchParams.get("c") ?? text;
  } catch {
    return text;
  }
}

/** Id de la fita a què correspon el codi, o null si no n'és de cap. */
export function getEstacioPerCodi(codi: string): string | null {
  const net = normalitzaCodi(extreuCodi(codi.trim()));
  const trobada = Object.entries(CODIS_FITES).find(([, c]) => c === net);
  return trobada ? trobada[0] : null;
}
