import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { getEstacionsJugables, type Element } from "@/content/public/estacions";

/**
 * Elements que l'AR considera aconseguits per a l'equip: les fites resoltes i les ajudes que el màster ha
 * desbloquejat. Només l'AR ho llegeix; una ajuda desbloquejada no marca la fita com a resolta.
 */
export async function GET(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });

  const db = getServiceRoleClient();
  const [{ data: progres }, { data: ajudes }] = await Promise.all([
    db.from("v2_progres").select("estacio_id, resolta").eq("team_id", sessio.teamId).eq("resolta", true),
    db.from("v2_ajudes").select("element").eq("team_id", sessio.teamId).not("resolta_at", "is", null),
  ]);

  const resoltes = new Set((progres ?? []).map((p) => p.estacio_id));
  const elements = new Set<Element>(
    getEstacionsJugables()
      .filter((e) => e.element && resoltes.has(e.id))
      .map((e) => e.element as Element),
  );
  for (const a of ajudes ?? []) elements.add(a.element as Element);

  return NextResponse.json({ aconseguits: [...elements] });
}
