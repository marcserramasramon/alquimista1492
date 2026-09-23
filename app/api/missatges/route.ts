import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";

/**
 * Missatges del màster per a l'equip de la cookie.
 *
 * Endpoint propi i lleuger (en lloc de /api/estat) perquè el pop-up ha de
 * sortir a qualsevol pantalla de joc, i només el hub consulta /api/estat.
 */
export async function GET(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });

  const db = getServiceRoleClient();
  const { data, error } = await db
    .from("v2_missatges")
    .select("id, titol, text, created_at")
    .eq("team_id", sessio.teamId)
    .is("llegit_at", null)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error llegint missatges de l'equip:", error);
    return NextResponse.json({ error: "No s'han pogut llegir els missatges" }, { status: 500 });
  }
  return NextResponse.json({ missatges: data ?? [] });
}

const LlegitSchema = z.object({ id: z.string().uuid() });

/** Marca un missatge com a llegit (botó "D'acord"). Només si és d'aquest equip. */
export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = LlegitSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const db = getServiceRoleClient();
  const { error } = await db
    .from("v2_missatges")
    .update({ llegit_at: new Date().toISOString() })
    .eq("id", validacio.data.id)
    .eq("team_id", sessio.teamId)
    .is("llegit_at", null);

  if (error) {
    console.error("Error marcant missatge com a llegit:", error);
    return NextResponse.json({ error: "No s'ha pogut desar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
