import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";
import { EQUIP_IDS } from "@/content/public/equips";

const ConsultaSchema = z.object({ teamId: z.string().uuid() });

/**
 * Recorregut d'un equip (només màster): les posicions en ordre i quan ha obert i resolt
 * cada fita. Un equip per consulta perquè cap resposta passi del límit de files de Supabase.
 */
export async function GET(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const validacio = ConsultaSchema.safeParse({ teamId: request.nextUrl.searchParams.get("teamId") });
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }
  const { teamId } = validacio.data;

  const db = getServiceRoleClient();
  const { data: equip } = await db
    .from("v2_teams")
    .select("id, started_at, guardians_at")
    .eq("id", teamId)
    .in("slug", EQUIP_IDS)
    .maybeSingle();
  if (!equip) return NextResponse.json({ error: "Equip no trobat" }, { status: 404 });

  const [{ data: punts, error }, { data: progres }] = await Promise.all([
    db
      .from("v2_ubicacions")
      .select("lat, lng, created_at")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true })
      .limit(1000),
    db.from("v2_progres").select("estacio_id, oberta_at, resolta_at").eq("team_id", teamId),
  ]);
  if (error) {
    console.error("Error llegint el recorregut:", error);
    return NextResponse.json({ error: "No s'ha pogut llegir el recorregut" }, { status: 500 });
  }

  return NextResponse.json({
    iniciAt: equip.started_at,
    guardiansAt: equip.guardians_at,
    punts: (punts ?? []).map((p) => ({ lat: p.lat, lng: p.lng, t: p.created_at })),
    fites: (progres ?? []).map((p) => ({ estacioId: p.estacio_id, obertaAt: p.oberta_at, resoltaAt: p.resolta_at })),
  });
}
