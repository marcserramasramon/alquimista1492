import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";

/** Ajudes pendents (les que el màster encara no ha desbloquejat). */
export async function GET(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const { data, error } = await getServiceRoleClient()
    .from("v2_ajudes")
    .select("id, team_id, element, created_at")
    .is("resolta_at", null)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Error llegint les ajudes:", error);
    return NextResponse.json({ error: "No s'han pogut llegir les ajudes" }, { status: 500 });
  }
  return NextResponse.json({ ajudes: data ?? [] });
}

const DesbloquejaSchema = z.object({ id: z.string().uuid() });

/**
 * Desbloqueja una ajuda: a l'AR, l'element queda com aconseguit per a l'equip (logo triable, estrelles i
 * conjuració). No es marca la fita com a resolta, així que no s'activen els àudios ni els vídeos de la fita.
 */
export async function POST(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = DesbloquejaSchema.safeParse(body);
  if (!validacio.success) return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });

  const db = getServiceRoleClient();
  const { data: ajuda, error: errLectura } = await db
    .from("v2_ajudes")
    .select("id")
    .eq("id", validacio.data.id)
    .maybeSingle();
  if (errLectura || !ajuda) return NextResponse.json({ error: "Ajuda no trobada" }, { status: 404 });

  // Només queda com a desbloquejada per a l'AR: no es marca cap fita com a resolta (no sonen els àudios ni els vídeos).
  const ara = new Date().toISOString();
  const { error: errAjuda } = await db.from("v2_ajudes").update({ resolta_at: ara }).eq("id", ajuda.id);
  if (errAjuda) {
    console.error("Error desbloquejant l'ajuda:", errAjuda);
    return NextResponse.json({ error: "No s'ha pogut desbloquejar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
