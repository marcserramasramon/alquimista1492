import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { MINIM_ENTRE_UBICACIONS_MS, UbicacioSchema } from "@/lib/ubicacio";

/** L'equip envia la seva posició. L'equip surt de la cookie, mai del cos de la petició. */
export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal entrar amb el codi d'equip" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validacio = UbicacioSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Ubicació invàlida" }, { status: 400 });
  }

  const { lat, lng, accuracy } = validacio.data;
  const ara = new Date();
  const limit = new Date(ara.getTime() - MINIM_ENTRE_UBICACIONS_MS).toISOString();

  await getServiceRoleClient()
    .from("v2_teams")
    .update({ last_lat: lat, last_lng: lng, last_accuracy: accuracy ?? null, last_location_at: ara.toISOString() })
    .eq("id", sessio.teamId)
    .or(`last_location_at.is.null,last_location_at.lt.${limit}`);

  return NextResponse.json({ ok: true });
}
