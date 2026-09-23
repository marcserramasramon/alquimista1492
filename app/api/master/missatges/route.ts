import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";
import { EQUIP_IDS } from "@/content/public/equips";
import { MAX_TEXT_LLIURE, TITOL_TEXT_LLIURE, getMissatgeMaster } from "@/content/public/missatgesMaster";

/** Quants missatges recents retorna el GET (per veure al panell si els equips els han llegit). */
const RECENTS = 20;

/** Últims missatges enviats, amb l'estat de lectura de cada equip. */
export async function GET(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const db = getServiceRoleClient();
  const { data, error } = await db
    .from("v2_missatges")
    .select("id, team_id, titol, text, created_at, llegit_at")
    .order("created_at", { ascending: false })
    .limit(RECENTS);

  if (error) {
    console.error("Error llegint missatges:", error);
    return NextResponse.json({ error: "No s'han pogut llegir els missatges" }, { status: 500 });
  }
  return NextResponse.json({ missatges: data ?? [] });
}

const EnviarSchema = z
  .object({
    /** Un equip concret o "tots". */
    desti: z.union([z.literal("tots"), z.string().uuid()]),
    /** Id d'un missatge preconfigurat... */
    clau: z.string().min(1).max(60).optional(),
    /** ...o text lliure del màster. */
    text: z.string().trim().min(1).max(MAX_TEXT_LLIURE).optional(),
  })
  .refine((d) => (d.clau === undefined) !== (d.text === undefined), {
    message: "Cal un missatge preconfigurat o un text lliure, no tots dos",
  });

/** Envia un missatge a un equip o a tots (una fila per equip). */
export async function POST(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = EnviarSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }
  const { desti, clau, text } = validacio.data;

  let contingut: { clau: string | null; titol: string; text: string };
  if (clau !== undefined) {
    const preconfigurat = getMissatgeMaster(clau);
    if (!preconfigurat) return NextResponse.json({ error: "Missatge desconegut" }, { status: 400 });
    contingut = { clau: preconfigurat.id, titol: preconfigurat.titol, text: preconfigurat.text };
  } else {
    contingut = { clau: null, titol: TITOL_TEXT_LLIURE, text: text! };
  }

  const db = getServiceRoleClient();

  let teamIds: string[];
  if (desti === "tots") {
    // "Tots" vol dir els equips que tenen un mòbil: els lliures no el llegirien mai.
    const { data: equips, error } = await db
      .from("v2_teams")
      .select("id")
      .in("slug", EQUIP_IDS)
      .not("claimed_at", "is", null);
    if (error) {
      console.error("Error llegint equips:", error);
      return NextResponse.json({ error: "No s'han pogut llegir els equips" }, { status: 500 });
    }
    teamIds = (equips ?? []).map((e) => e.id);
  } else {
    const { data: equip } = await db.from("v2_teams").select("id").eq("id", desti).maybeSingle();
    if (!equip) return NextResponse.json({ error: "Equip no trobat" }, { status: 404 });
    teamIds = [equip.id];
  }

  if (teamIds.length === 0) {
    return NextResponse.json({ error: "No hi ha cap equip" }, { status: 400 });
  }

  const { error } = await db.from("v2_missatges").insert(teamIds.map((team_id) => ({ team_id, ...contingut })));
  if (error) {
    console.error("Error enviant missatge:", error);
    return NextResponse.json({ error: "No s'ha pogut enviar el missatge" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, enviats: teamIds.length });
}
