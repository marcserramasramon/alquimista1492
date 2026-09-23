import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";
import { ESPERAR_INICI_MASTER } from "@/lib/partida";

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
  await db.from("v2_ubicacions").delete().eq("team_id", validacio.data.teamId);
  // Si la partida ja corre (o no cal esperar el màster), l'equip hi torna des de zero en joc: no hi hauria cap inici que el tragués de l'espera.
  const { data: partida } = await db.from("v2_partida").select("started_at").eq("id", 1).maybeSingle();
  const iniciada = partida?.started_at ?? (ESPERAR_INICI_MASTER ? null : new Date().toISOString());
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
