import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { distanciaMetres, MINIM_ENTRE_UBICACIONS_MS, UbicacioSchema } from "@/lib/ubicacio";
import { MISSATGES_MASTER } from "@/content/public/missatgesMaster";

const MISSATGES_GEOFENCE = MISSATGES_MASTER.filter((m) => m.geofence);

/** Envia els missatges amb `geofence` que l'equip encara no hagi rebut i als quals s'hagi acostat prou. */
async function dispararMissatgesGeofence(
  db: ReturnType<typeof getServiceRoleClient>,
  teamId: string,
  posicio: { lat: number; lng: number }
) {
  for (const missatge of MISSATGES_GEOFENCE) {
    const { lat, lng, radiMetres } = missatge.geofence!;
    if (distanciaMetres(posicio, { lat, lng }) > radiMetres) continue;
    const { data: ja_enviat } = await db
      .from("v2_missatges")
      .select("id")
      .eq("team_id", teamId)
      .eq("clau", missatge.id)
      .limit(1)
      .maybeSingle();
    if (ja_enviat) continue;
    const { error } = await db
      .from("v2_missatges")
      .insert({ team_id: teamId, clau: missatge.id, titol: missatge.titol, text: missatge.text });
    if (error) console.error("Error enviant missatge per geofence:", error);
  }
}

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

  // Missatges automàtics per proximitat: només en joc (no abans de començar ni al final).
  if (desada && desada.status === "joc" && MISSATGES_GEOFENCE.length > 0) {
    await dispararMissatgesGeofence(db, sessio.teamId, { lat, lng });
  }

  return NextResponse.json({ ok: true });
}
