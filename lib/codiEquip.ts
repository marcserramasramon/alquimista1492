import "server-only";

import { createHmac } from "node:crypto";
import { EQUIPS, type EquipId } from "@/content/public/equips";

/** 32 caràcters: sense I, O, 0 ni 1, perquè no es confonguin en escriure'l a mà. */
const ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const LLARGADA_CODI_EQUIP = 8;
export const PATRO_CODI_EQUIP = /^[A-HJ-NP-Z2-9]{8}$/;

/**
 * Codi d'entrada d'un equip (el que va al QR i el que es pot escriure a mà).
 * És determinista: HMAC del `slug` amb `PASS_SECRET`, així no cal guardar-lo a la BD.
 * Per invalidar tots els codis de cop, es canvia el secret.
 */
function codiDeSlug(slug: string): string {
  const secret = process.env.PASS_SECRET;
  if (!secret) throw new Error("Falta la variable d'entorn PASS_SECRET");
  const bytes = createHmac("sha256", secret).update(`equip-codi:${slug}`).digest();
  // 256 és múltiple de 32: cap caràcter surt més probable que els altres.
  return Array.from(bytes.subarray(0, LLARGADA_CODI_EQUIP), (b) => ALFABET[b % ALFABET.length]).join("");
}

/** Tots els equips amb el seu codi (per al màster). */
export function codisEquips(): { equip: EquipId; codi: string }[] {
  return EQUIPS.map((e) => ({ equip: e.id, codi: codiDeSlug(e.id) }));
}

/** Retorna l'equip que correspon al codi, o null si no n'hi ha cap. */
export function equipPerCodi(codi: string): EquipId | null {
  const net = codi.trim().toUpperCase();
  if (!PATRO_CODI_EQUIP.test(net)) return null;
  return codisEquips().find((c) => c.codi === net)?.equip ?? null;
}
