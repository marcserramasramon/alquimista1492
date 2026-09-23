import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";
import { EQUIP_IDS } from "@/content/public/equips";

const PartidaSchema = z.object({ accio: z.enum(["iniciar", "reiniciar"]) });

/**
 * iniciar: arrenca el cronòmetre global i treu tots els equips de l'espera alhora.
 * reiniciar: torna a l'estat inicial (sense inici, equips lliures, sense progrés ni missatges).
 */
export async function POST(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = PartidaSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const db = getServiceRoleClient();

  if (validacio.data.accio === "iniciar") {
    // Només la primera pulsació compta: un segon toc no reinicia el cronòmetre.
    const ara = new Date().toISOString();
    const { data: iniciada, error } = await db
      .from("v2_partida")
      .update({ started_at: ara })
      .eq("id", 1)
      .is("started_at", null)
      .select("started_at")
      .maybeSingle();
    if (error) {
      console.error("Error iniciant la partida:", error);
      return NextResponse.json({ error: "No s'ha pogut iniciar la partida" }, { status: 500 });
    }
    if (!iniciada) {
      return NextResponse.json({ error: "La partida ja ha començat" }, { status: 409 });
    }

    const { error: errorEquips } = await db
      .from("v2_teams")
      .update({ status: "joc", started_at: ara })
      .in("slug", EQUIP_IDS)
      .not("claimed_at", "is", null)
      .eq("status", "espera");
    if (errorEquips) console.error("Error posant els equips en joc:", errorEquips);

    return NextResponse.json({ ok: true, startedAt: ara });
  }

  const { data: equips } = await db.from("v2_teams").select("id").in("slug", EQUIP_IDS);
  const ids = (equips ?? []).map((e) => e.id);
  await db.from("v2_progres").delete().in("team_id", ids);
  await db.from("v2_missatges").delete().in("team_id", ids);
  await db
    .from("v2_teams")
    .update({
      status: "espera",
      started_at: null,
      finished_at: null,
      claimed_at: null,
      session_nonce: null,
      last_lat: null,
      last_lng: null,
      last_location_at: null,
    })
    .in("id", ids);
  await db.from("v2_partida").update({ started_at: null }).eq("id", 1);

  return NextResponse.json({ ok: true });
}
