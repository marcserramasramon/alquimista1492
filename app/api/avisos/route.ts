import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { MAX_TEXT_AVIS } from "@/content/public/avisos";

/**
 * Avís que l'equip de la cookie envia al màster (botó "?" del mapa).
 * Direcció única: no hi ha GET, l'equip no rep resposta dins l'app.
 */
const EnviarSchema = z.object({ text: z.string().trim().min(1).max(MAX_TEXT_AVIS) });

export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = EnviarSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Escriviu un missatge" }, { status: 400 });
  }

  const db = getServiceRoleClient();
  const { error } = await db.from("v2_avisos").insert({ team_id: sessio.teamId, text: validacio.data.text });

  if (error) {
    console.error("Error enviant l'avís al màster:", error);
    return NextResponse.json({ error: "No s'ha pogut enviar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
