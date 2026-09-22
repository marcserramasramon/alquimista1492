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
  await db
    .from("v2_teams")
    .update({
      status: "espera",
      started_at: null,
      finished_at: null,
    })
    .eq("id", validacio.data.teamId);

  return NextResponse.json({ ok: true });
}
