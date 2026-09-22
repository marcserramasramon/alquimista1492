import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { signEquipToken, EQUIP_COOKIE_NAME, EQUIP_COOKIE_MAX_AGE } from "@/lib/auth";

const EntrarSchema = z.object({
  codi: z.string().trim().length(6),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validacio = EntrarSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Codi invàlid" }, { status: 400 });
  }

  const codi = validacio.data.codi.toUpperCase();
  const db = getServiceRoleClient();

  const { data: equip, error } = await db
    .from("v2_teams")
    .select("id, code, status")
    .eq("code", codi)
    .maybeSingle();

  if (error || !equip) {
    return NextResponse.json({ error: "Aquest codi d'equip no existeix" }, { status: 404 });
  }

  if (equip.status === "espera") {
    await db
      .from("v2_teams")
      .update({ status: "joc", started_at: new Date().toISOString() })
      .eq("id", equip.id);
  }

  const token = await signEquipToken({ teamId: equip.id, code: equip.code });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(EQUIP_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: EQUIP_COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
