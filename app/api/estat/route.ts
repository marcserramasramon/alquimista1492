import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { getEstacionsOrdenades, getEstacionsJugables, getPassosPrevis, getPasPreviPerEstacio } from "@/content/public/estacions";
import { getMissatgeMaster } from "@/content/public/missatgesMaster";
import { EQUIP_IDS } from "@/content/public/equips";
import { MAXIMA_EDAT_UBICACIO_MS } from "@/lib/ubicacio";
import { estaOberta, necessitaObertura } from "@/lib/obertura";

export async function GET(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });
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
    .select("estacio_id, resolta, intents, pistes_usades, oberta_at")
    .eq("team_id", sessio.teamId);

  const progresPerEstacio = new Map((progres ?? []).map((p) => [p.estacio_id, p]));
  const jugables = getEstacionsJugables();
  const totesResoltes = jugables.every((e) => progresPerEstacio.get(e.id)?.resolta);

  // Posició del màster: només si la comparteix i és recent.
  const { data: ubicacioMaster } = await db
    .from("v2_master_location")
    .select("lat, lng, sharing, equips_sharing, updated_at")
    .eq("id", 1)
    .maybeSingle();
  const masterVisible =
    ubicacioMaster?.sharing &&
    ubicacioMaster.lat !== null &&
    ubicacioMaster.lng !== null &&
    ubicacioMaster.updated_at &&
    Date.now() - new Date(ubicacioMaster.updated_at).getTime() < MAXIMA_EDAT_UBICACIO_MS;

  // Posicions dels altres equips: només si el màster ho ha activat (interruptor global).
  let altresEquips: { id: string; name: string; lat: number; lng: number }[] = [];
  if (ubicacioMaster?.equips_sharing) {
    const { data: equipsAltres } = await db
      .from("v2_teams")
      .select("id, name, last_lat, last_lng, last_location_at")
      .neq("id", sessio.teamId)
      .in("slug", EQUIP_IDS);
    const ara = Date.now();
    altresEquips = (equipsAltres ?? []).flatMap((e) =>
      e.last_lat !== null &&
      e.last_lng !== null &&
      e.last_location_at &&
      ara - new Date(e.last_location_at).getTime() < MAXIMA_EDAT_UBICACIO_MS
        ? [{ id: e.id, name: e.name, lat: e.last_lat, lng: e.last_lng }]
        : []
    );
  }

  // Una estació amb pas previ no es revela (no surt al mapa) fins que l'equip l'obre.
  const estacionsAmbPasTancat = getEstacionsOrdenades()
    .map((e) => ({ e, pas: getPasPreviPerEstacio(e.id) }))
    .filter(({ pas }) => pas && !estaOberta(progresPerEstacio.get(pas.id) ?? null));

  const idsAmagats = new Set(estacionsAmbPasTancat.map(({ e }) => e.id));

  // Missatges amb vídeo (geofence) ja acceptats: el mapa hi dibuixa una petita insígnia
  // perquè l'equip els pugui tornar a veure quan vulgui.
  const { data: missatgesLlegits } = await db
    .from("v2_missatges")
    .select("clau")
    .eq("team_id", sessio.teamId)
    .not("clau", "is", null)
    .not("llegit_at", "is", null);
  const videosVistos = [...new Set((missatgesLlegits ?? []).map((m) => m.clau as string))].filter(
    (clau) => getMissatgeMaster(clau)?.video
  );

  return NextResponse.json({
    master: masterVisible ? { lat: ubicacioMaster.lat, lng: ubicacioMaster.lng } : null,
    altresEquips,
    equip,
    estacions: [
      ...getEstacionsOrdenades()
        .filter((e) => !idsAmagats.has(e.id))
        .map((e) => {
          const { oberta_at, ...progres } = progresPerEstacio.get(e.id) ?? {
            resolta: false,
            intents: 0,
            pistes_usades: 0,
            oberta_at: null,
          };
          return {
            ...e,
            oberta: !necessitaObertura(e) || estaOberta({ oberta_at, resolta: progres.resolta }),
            progres,
          };
        }),
      ...getPassosPrevis().map((p) => {
        const oberta = estaOberta(progresPerEstacio.get(p.id) ?? null);
        return {
          id: p.id,
          nom: p.nom,
          entrada: p.entrada,
          situacio: p.situacio,
          imatge: p.imatge,
          latitud: p.latitud,
          longitud: p.longitud,
          tipus: "pas" as const,
          disponible: p.disponible,
          element: p.element,
          // El mapa hi dibuixa una línia discontínua fins que es resol la fita que desbloqueja.
          desbloqueja: p.desbloqueja,
          oberta,
          progres: { resolta: oberta },
        };
      }),
    ],
    totesResoltes,
    videosVistos,
  });
}
