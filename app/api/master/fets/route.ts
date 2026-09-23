import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";
import { getEstacionsJugables } from "@/content/public/estacions";
import { EQUIP_IDS } from "@/content/public/equips";
import type { FetPartida } from "@/components/vistes/PanellFetsMaster";

/** Els últims que es retornen, del més nou al més vell. */
const MAX_FETS = 40;

/**
 * Què ha passat a la partida en curs, deduït del progrés que ja es desa: equips que arriben
 * a una fita, que la resolen, que ja tenen tots els fragments i que són consagrats.
 */
export async function GET(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const db = getServiceRoleClient();
  const { data: partida } = await db.from("v2_partida").select("started_at").eq("id", 1).maybeSingle();
  if (!partida?.started_at) return NextResponse.json({ fets: [] });

  const { data: equips, error } = await db.from("v2_teams").select("id, guardians_at").in("slug", EQUIP_IDS);
  if (error) {
    console.error("Error llegint els equips:", error);
    return NextResponse.json({ error: "No s'han pogut llegir els fets" }, { status: 500 });
  }
  const ids = (equips ?? []).map((e) => e.id);
  const { data: progres } = await db
    .from("v2_progres")
    .select("team_id, estacio_id, oberta_at, resolta_at")
    .in("team_id", ids);

  const jugables = new Set(getEstacionsJugables().filter((e) => e.disponible).map((e) => e.id));
  const fets: FetPartida[] = [];

  for (const equip of equips ?? []) {
    const seves = (progres ?? []).filter((p) => p.team_id === equip.id);
    for (const p of seves) {
      const base = { teamId: equip.id, estacioId: p.estacio_id };
      if (p.oberta_at) fets.push({ ...base, id: `arriba:${equip.id}:${p.estacio_id}:${p.oberta_at}`, tipus: "arriba", t: p.oberta_at });
      if (p.resolta_at) fets.push({ ...base, id: `resol:${equip.id}:${p.estacio_id}:${p.resolta_at}`, tipus: "resol", t: p.resolta_at });
    }
    const resoltes = seves.filter((p) => p.resolta_at && jugables.has(p.estacio_id));
    if (jugables.size > 0 && resoltes.length >= jugables.size) {
      const ultima = resoltes.map((p) => p.resolta_at as string).sort().at(-1)!;
      fets.push({ id: `fragments:${equip.id}:${ultima}`, tipus: "fragments", teamId: equip.id, t: ultima });
    }
    if (equip.guardians_at) {
      fets.push({ id: `guardians:${equip.id}:${equip.guardians_at}`, tipus: "guardians", teamId: equip.id, t: equip.guardians_at });
    }
  }

  // Un reinici d'equip no esborra l'hora d'inici: només compta el que ha passat en aquesta partida.
  const inici = Date.parse(partida.started_at);
  const recents = fets
    .filter((f) => Date.parse(f.t) >= inici)
    .sort((a, b) => Date.parse(b.t) - Date.parse(a.t) || a.id.localeCompare(b.id))
    .slice(0, MAX_FETS);

  return NextResponse.json({ fets: recents });
}
