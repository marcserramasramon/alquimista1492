import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { getEstacionsJugables } from "@/content/public/estacions";
import { REVELACIO_FINAL } from "@/content/public/historia";

export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal entrar amb el codi d'equip" }, { status: 401 });
  }

  const db = getServiceRoleClient();

  const { data: progres } = await db
    .from("v2_progres")
    .select("estacio_id, resolta")
    .eq("team_id", sessio.teamId);

  const resoltes = new Set((progres ?? []).filter((p) => p.resolta).map((p) => p.estacio_id));
  const jugables = getEstacionsJugables();
  const falten = jugables.filter((e) => e.disponible && !resoltes.has(e.id));

  if (falten.length > 0) {
    return NextResponse.json(
      { error: "Encara falten estacions per resoldre", falten: falten.map((e) => e.nom) },
      { status: 409 }
    );
  }

  const ara = new Date().toISOString();
  await db
    .from("v2_teams")
    .update({ campanes_fetes_at: ara, status: "final", finished_at: ara })
    .eq("id", sessio.teamId);

  return NextResponse.json({ ok: true, revelacio: REVELACIO_FINAL });
}
