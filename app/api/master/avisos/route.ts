import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";

/** Quants avisos recents retorna el GET (panell del màster). */
const RECENTS = 20;

/** Avisos que els equips han enviat al màster (botó "?" del mapa). */
export async function GET(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const db = getServiceRoleClient();
  const { data, error } = await db
    .from("v2_avisos")
    .select("id, team_id, text, created_at, llegit_at")
    .order("created_at", { ascending: false })
    .limit(RECENTS);

  if (error) {
    console.error("Error llegint els avisos:", error);
    return NextResponse.json({ error: "No s'han pogut llegir els avisos" }, { status: 500 });
  }
  return NextResponse.json({ avisos: data ?? [] });
}

const LlegitSchema = z.object({ id: z.string().uuid() });

/** Marca un avís com a llegit (el màster ja l'ha vist). */
export async function POST(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = LlegitSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const db = getServiceRoleClient();
  const { error } = await db
    .from("v2_avisos")
    .update({ llegit_at: new Date().toISOString() })
    .eq("id", validacio.data.id)
    .is("llegit_at", null);

  if (error) {
    console.error("Error marcant l'avís com a llegit:", error);
    return NextResponse.json({ error: "No s'ha pogut desar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
