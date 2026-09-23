import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";

/**
 * Estat lleuger de la partida per a l'equip: si ha començat, quan s'acaba el temps
 * i si Fra Francesc ja l'ha consagrat com a Guardians del Secret.
 */
export async function GET(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });
  }

  const db = getServiceRoleClient();
  const { data: equip } = await db
    .from("v2_teams")
    .select("slug, status, guardians_at")
    .eq("id", sessio.teamId)
    .maybeSingle();
  if (!equip) {
    return NextResponse.json({ error: "Equip no trobat" }, { status: 404 });
  }

  const { data: partida } = await db.from("v2_partida").select("ends_at").eq("id", 1).maybeSingle();

  return NextResponse.json({
    equip: equip.slug,
    iniciada: equip.status !== "espera",
    acabaAt: equip.status !== "espera" ? (partida?.ends_at ?? null) : null,
    guardians: equip.guardians_at !== null,
    // Per corregir el rellotge del mòbil al compte enrere.
    ara: new Date().toISOString(),
  });
}
