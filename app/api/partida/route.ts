import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";

/** Estat lleuger per a la pantalla d'espera: quin equip som i si la partida ja ha començat. */
export async function GET(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });
  }

  const { data: equip } = await getServiceRoleClient()
    .from("v2_teams")
    .select("slug, status")
    .eq("id", sessio.teamId)
    .maybeSingle();
  if (!equip) {
    return NextResponse.json({ error: "Equip no trobat" }, { status: 404 });
  }

  return NextResponse.json({ equip: equip.slug, iniciada: equip.status !== "espera" });
}
