import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";
import { getEstacionsJugables } from "@/content/public/estacions";
import { EQUIPS, EQUIP_IDS } from "@/content/public/equips";

export async function GET(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const db = getServiceRoleClient();
  const { data: equips, error: equipsError } = await db
    .from("v2_teams")
    .select("id, slug, status, claimed_at, started_at, finished_at, guardians_at, last_lat, last_lng, last_location_at")
    .in("slug", EQUIP_IDS);

  if (equipsError) {
    console.error("Error llegint equips:", equipsError);
    return NextResponse.json({ error: "No s'ha pogut llegir els equips" }, { status: 500 });
  }

  const { data: progres } = await db.from("v2_progres").select("team_id, estacio_id, resolta, pistes_usades");

  const total = getEstacionsJugables().filter((e) => e.disponible).length;

  // En l'ordre de content/public/equips.ts, amb el nom d'allà.
  const resultat = EQUIPS.flatMap((def) => {
    const e = (equips ?? []).find((x) => x.slug === def.id);
    if (!e) return [];
    const { claimed_at, ...resta } = e;
    const seu = (progres ?? []).filter((p) => p.team_id === e.id);
    const resoltes = seu.filter((p) => p.resolta).length;
    const pistes = seu.reduce((suma, p) => suma + (p.pistes_usades ?? 0), 0);
    return [{ ...resta, name: def.nom, imatge: def.imatge, agafat: claimed_at !== null, resoltes, total, pistes }];
  });

  const { data: partida } = await db
    .from("v2_partida")
    .select("started_at, duration_minutes, ends_at")
    .eq("id", 1)
    .maybeSingle();

  const { data: ubicacioMaster } = await db
    .from("v2_master_location")
    .select("lat, lng, sharing, updated_at")
    .eq("id", 1)
    .maybeSingle();

  return NextResponse.json({
    equips: resultat,
    master: ubicacioMaster ?? null,
    partidaIniciadaAt: partida?.started_at ?? null,
    partidaAcabaAt: partida?.ends_at ?? null,
    durada: partida?.duration_minutes ?? null,
    // Per corregir el rellotge del mòbil al compte enrere.
    ara: new Date().toISOString(),
  });
}
