import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";

const AlliberarSchema = z.object({ teamId: z.string().uuid() });

/**
 * Deixa lliure la icona d'un equip (mòbil sense bateria, icona triada per error...).
 * El mòbil que el tenia en perd l'accés; el progrés es conserva.
 */
export async function POST(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = AlliberarSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const { error } = await getServiceRoleClient()
    .from("v2_teams")
    .update({ claimed_at: null, session_nonce: null })
    .eq("id", validacio.data.teamId);
  if (error) {
    console.error("Error alliberant equip:", error);
    return NextResponse.json({ error: "No s'ha pogut alliberar l'equip" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
