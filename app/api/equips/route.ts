import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession, signEquipToken, EQUIP_COOKIE_NAME, EQUIP_COOKIE_MAX_AGE } from "@/lib/auth";
import { EQUIP_IDS } from "@/content/public/equips";
import { ESPERAR_INICI_MASTER } from "@/lib/partida";

/** Quins equips ja tenen algun mòbil (per a la pantalla de les icones). */
export async function GET(request: NextRequest) {
  const db = getServiceRoleClient();
  const { data, error } = await db.from("v2_teams").select("id, slug, claimed_at").in("slug", EQUIP_IDS);
  if (error) {
    console.error("Error llegint equips:", error);
    return NextResponse.json({ error: "No s'han pogut llegir els equips" }, { status: 500 });
  }

  const sessio = await getEquipSession(request);
  const ambJugadors = (data ?? []).filter((e) => e.claimed_at !== null);
  const meu = (data ?? []).find((e) => e.id === sessio?.teamId)?.slug ?? null;

  return NextResponse.json({ ambJugadors: ambJugadors.map((e) => e.slug), meu });
}

const AgafarSchema = z.object({ equip: z.enum(EQUIP_IDS) });

/**
 * Aquest mòbil entra en un equip. El primer mòbil l'agafa (i genera el `session_nonce`);
 * els següents s'hi uneixen amb el mateix nonce, així ningú fa fora ningú.
 */
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
  const ara = new Date().toISOString();
  // Si la partida ja ha començat (p.ex. el màster ha alliberat l'equip), s'hi entra directament.
  // Sense esperar el màster, l'equip comença a jugar ara mateix.
  const iniciada = partida?.started_at ?? (ESPERAR_INICI_MASTER ? null : ara);

  // UPDATE atòmic: només el primer mòbil que el troba lliure genera el nonce.
  const { data: agafat, error } = await db
    .from("v2_teams")
    .update({
      claimed_at: ara,
      session_nonce: crypto.randomUUID(),
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

  // Ja tenia jugadors: aquest mòbil s'hi afegeix amb el nonce que ja hi ha.
  let equip = agafat;
  if (!equip) {
    const { data: existent, error: errorLectura } = await db
      .from("v2_teams")
      .select("id, session_nonce")
      .eq("slug", validacio.data.equip)
      .not("claimed_at", "is", null)
      .not("session_nonce", "is", null)
      .maybeSingle();
    if (errorLectura) {
      console.error("Error unint-se a l'equip:", errorLectura);
      return NextResponse.json({ error: "No s'ha pogut triar l'equip" }, { status: 500 });
    }
    equip = existent;
  }
  if (!equip?.session_nonce) {
    return NextResponse.json({ error: "No s'ha pogut triar l'equip. Torna-ho a provar." }, { status: 409 });
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
