import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession, signEquipToken, EQUIP_COOKIE_NAME, EQUIP_COOKIE_MAX_AGE } from "@/lib/auth";
import { EQUIP_IDS } from "@/content/public/equips";

/** Quins equips estan lliures (per a la pantalla de les icones). */
export async function GET(request: NextRequest) {
  const db = getServiceRoleClient();
  const { data, error } = await db.from("v2_teams").select("id, slug, claimed_at").in("slug", EQUIP_IDS);
  if (error) {
    console.error("Error llegint equips:", error);
    return NextResponse.json({ error: "No s'han pogut llegir els equips" }, { status: 500 });
  }

  const sessio = await getEquipSession(request);
  const agafats = (data ?? []).filter((e) => e.claimed_at !== null && e.id !== sessio?.teamId);
  const meu = (data ?? []).find((e) => e.id === sessio?.teamId)?.slug ?? null;

  return NextResponse.json({ agafats: agafats.map((e) => e.slug), meu });
}

const AgafarSchema = z.object({ equip: z.enum(EQUIP_IDS) });

/** Aquest mòbil agafa un equip. Si un altre mòbil ja l'ha agafat, 409. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validacio = AgafarSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Equip invàlid" }, { status: 400 });
  }

  if (await getEquipSession(request)) {
    return NextResponse.json({ error: "Aquest mòbil ja té un equip" }, { status: 409 });
  }

  const db = getServiceRoleClient();
  const { data: partida } = await db.from("v2_partida").select("started_at").eq("id", 1).maybeSingle();
  const iniciada = partida?.started_at ?? null;

  // UPDATE atòmic: només guanya el primer mòbil que el troba lliure.
  const { data: equip, error } = await db
    .from("v2_teams")
    .update({
      claimed_at: new Date().toISOString(),
      session_nonce: crypto.randomUUID(),
      // Si la partida ja ha començat (p.ex. el màster ha alliberat l'equip), s'hi entra directament.
      ...(iniciada ? { status: "joc", started_at: iniciada } : {}),
    })
    .eq("slug", validacio.data.equip)
    .is("claimed_at", null)
    .select("id, session_nonce")
    .maybeSingle();

  if (error) {
    console.error("Error agafant equip:", error);
    return NextResponse.json({ error: "No s'ha pogut triar l'equip" }, { status: 500 });
  }
  if (!equip) {
    return NextResponse.json({ error: "Aquest equip ja l'ha triat un altre mòbil" }, { status: 409 });
  }

  const token = await signEquipToken({ teamId: equip.id, nonce: equip.session_nonce });
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
