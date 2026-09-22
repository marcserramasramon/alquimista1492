import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { NomEquipSchema } from "@/lib/nomEquip";

export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal entrar amb el codi d'equip" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validacio = NomEquipSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json(
      { error: validacio.error.issues[0]?.message ?? "Nom invàlid" },
      { status: 400 },
    );
  }

  const nom = validacio.data.nom;
  const db = getServiceRoleClient();
  const { error } = await db.from("v2_teams").update({ name: nom }).eq("id", sessio.teamId);
  if (error) {
    return NextResponse.json({ error: "No s'ha pogut desar el nom" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, nom });
}
