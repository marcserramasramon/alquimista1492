import "server-only";

import { getServiceRoleClient } from "@/lib/supabase";
import type { Estacio } from "@/content/public/estacions";

export type Obertura = "gps" | "qr" | "codi";

/** Només les fites elementals s'han d'obrir arribant-hi; el Gresol s'obre amb els cinc fragments. */
export function necessitaObertura(estacio: Estacio): boolean {
  return estacio.tipus === "text";
}

/** Una fita resolta abans que existís l'obertura també compta com a oberta. */
export function estaOberta(progres: { oberta_at?: string | null; resolta?: boolean } | null | undefined): boolean {
  return Boolean(progres?.oberta_at || progres?.resolta);
}

export async function fitaOberta(teamId: string, estacio: Estacio): Promise<boolean> {
  if (!necessitaObertura(estacio)) return true;
  const { data } = await getServiceRoleClient()
    .from("v2_progres")
    .select("oberta_at, resolta")
    .eq("team_id", teamId)
    .eq("estacio_id", estacio.id)
    .maybeSingle();
  return estaOberta(data);
}

/** Obre la fita per a l'equip. Si ja era oberta, no canvia ni quan ni com. */
export async function obrirFita(teamId: string, estacioId: string, obertura: Obertura): Promise<void> {
  const db = getServiceRoleClient();
  const { data: existent } = await db
    .from("v2_progres")
    .select("id, oberta_at")
    .eq("team_id", teamId)
    .eq("estacio_id", estacioId)
    .maybeSingle();

  const ara = new Date().toISOString();
  if (existent) {
    if (existent.oberta_at) return;
    await db.from("v2_progres").update({ oberta_at: ara, obertura }).eq("id", existent.id);
  } else {
    await db.from("v2_progres").insert({ team_id: teamId, estacio_id: estacioId, oberta_at: ara, obertura });
  }
}
