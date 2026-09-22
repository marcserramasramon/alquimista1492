import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { COARTADA_TEXT } from "@/content/public/coartada";

export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal entrar amb el codi d'equip" }, { status: 401 });
  }

  const db = getServiceRoleClient();
  await db
    .from("v2_teams")
    .update({ coartada_revelada_at: new Date().toISOString() })
    .eq("id", sessio.teamId)
    .is("coartada_revelada_at", null);

  return NextResponse.json({ text: COARTADA_TEXT });
}
