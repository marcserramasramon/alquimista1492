import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { MINIM_ENTRE_UBICACIONS_MS, UbicacioSchema } from "@/lib/ubicacio";

/** L'equip envia la seva posició. L'equip surt de la cookie, mai del cos de la petició. */
export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validacio = UbicacioSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Ubicació invàlida" }, { status: 400 });
  }

  const { lat, lng, accuracy } = validacio.data;
  const ara = new Date();
  const limit = new Date(ara.getTime() - MINIM_ENTRE_UBICACIONS_MS).toISOString();

  const db = getServiceRoleClient();
  const { data: desada } = await db
    .from("v2_teams")
    .update({ last_lat: lat, last_lng: lng, last_accuracy: accuracy ?? null, last_location_at: ara.toISOString() })
    .eq("id", sessio.teamId)
    .or(`last_location_at.is.null,last_location_at.lt.${limit}`)
    .select("status")
    .maybeSingle();

  // Recorregut per al màster: només les posicions que han passat el límit i un cop començada la partida.
  if (desada && desada.status !== "espera") {
    const { error } = await db.from("v2_ubicacions").insert({
      team_id: sessio.teamId,
      lat,
      lng,
      accuracy: accuracy ?? null,
      created_at: ara.toISOString(),
    });
    if (error) console.error("Error desant el recorregut:", error);
  }

  return NextResponse.json({ ok: true });
}
