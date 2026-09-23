import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";

const ResetSchema = z.object({ teamId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = ResetSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const db = getServiceRoleClient();
  await db.from("v2_progres").delete().eq("team_id", validacio.data.teamId);
  // Si la partida ja corre, l'equip hi torna des de zero (no a l'espera: ja no hi hauria cap inici que l'en tragués).
  const { data: partida } = await db.from("v2_partida").select("started_at").eq("id", 1).maybeSingle();
  const iniciada = partida?.started_at ?? null;
  await db
    .from("v2_teams")
    .update({
      status: iniciada ? "joc" : "espera",
      started_at: iniciada,
      finished_at: null,
      guardians_at: null,
    })
    .eq("id", validacio.data.teamId);

  return NextResponse.json({ ok: true });
}
