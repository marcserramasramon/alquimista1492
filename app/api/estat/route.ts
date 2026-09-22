import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { getEstacionsOrdenades, getEstacionsJugables } from "@/content/public/estacions";
import { MAXIMA_EDAT_UBICACIO_MASTER_MS } from "@/lib/ubicacio";

export async function GET(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal entrar amb el codi d'equip" }, { status: 401 });
  }

  const db = getServiceRoleClient();

  const { data: equip } = await db
    .from("v2_teams")
    .select("id, name, status, started_at")
    .eq("id", sessio.teamId)
    .single();

  if (!equip) {
    return NextResponse.json({ error: "Equip no trobat" }, { status: 404 });
  }

  const { data: progres } = await db
    .from("v2_progres")
    .select("estacio_id, resolta, intents, pistes_usades")
    .eq("team_id", sessio.teamId);

  const progresPerEstacio = new Map((progres ?? []).map((p) => [p.estacio_id, p]));
  const jugables = getEstacionsJugables();
  const totesResoltes = jugables.every((e) => progresPerEstacio.get(e.id)?.resolta);

  // Posició del màster: només si la comparteix i és recent.
  const { data: ubicacioMaster } = await db
    .from("v2_master_location")
    .select("lat, lng, sharing, updated_at")
    .eq("id", 1)
    .maybeSingle();
  const masterVisible =
    ubicacioMaster?.sharing &&
    ubicacioMaster.lat !== null &&
    ubicacioMaster.lng !== null &&
    ubicacioMaster.updated_at &&
    Date.now() - new Date(ubicacioMaster.updated_at).getTime() < MAXIMA_EDAT_UBICACIO_MASTER_MS;

  return NextResponse.json({
    master: masterVisible ? { lat: ubicacioMaster.lat, lng: ubicacioMaster.lng } : null,
    equip,
    estacions: getEstacionsOrdenades().map((e) => ({
      ...e,
      progres: progresPerEstacio.get(e.id) ?? { resolta: false, intents: 0, pistes_usades: 0 },
    })),
    totesResoltes,
  });
}
