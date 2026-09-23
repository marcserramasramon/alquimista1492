import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";

const GuardiansSchema = z.object({ teamId: z.string().uuid(), consagrar: z.boolean() });

/**
 * El LED del Gresol s'ha encès: Fra Francesc consagra l'equip com a Guardians del Secret
 * i el mòbil de l'equip passa a la pantalla final. `consagrar: false` ho desfà (toc per error).
 */
export async function POST(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = GuardiansSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const { teamId, consagrar } = validacio.data;
  const ara = new Date().toISOString();
  const { data, error } = await getServiceRoleClient()
    .from("v2_teams")
    .update({ guardians_at: consagrar ? ara : null, finished_at: consagrar ? ara : null })
    .eq("id", teamId)
    .not("claimed_at", "is", null)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("Error consagrant l'equip:", error);
    return NextResponse.json({ error: "No s'ha pogut desar" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Equip no trobat" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
