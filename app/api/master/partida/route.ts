import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";
import { EQUIP_IDS } from "@/content/public/equips";
import { DURADA_MAXIMA_MIN, DURADA_MINIMA_MIN } from "@/lib/partida";

const PartidaSchema = z.discriminatedUnion("accio", [
  z.object({
    accio: z.literal("iniciar"),
    durada: z.number().int().min(DURADA_MINIMA_MIN).max(DURADA_MAXIMA_MIN),
  }),
  z.object({ accio: z.literal("ajustar"), minuts: z.number().int().min(-60).max(60).refine((m) => m !== 0) }),
  z.object({ accio: z.literal("acabar") }),
  z.object({ accio: z.literal("reiniciar") }),
]);

/**
 * iniciar: arrenca el compte enrere amb la durada triada i treu tots els equips de l'espera alhora.
 * ajustar: afegeix o treu minuts al temps que queda.
 * acabar: s'acaba el temps ara mateix.
 * reiniciar: torna a l'estat inicial (sense inici, equips lliures, sense progrés ni missatges).
 */
export async function POST(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = PartidaSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const db = getServiceRoleClient();
  const peticio = validacio.data;

  if (peticio.accio === "iniciar") {
    // Només la primera pulsació compta: un segon toc no reinicia el cronòmetre.
    const ara = new Date();
    const fi = new Date(ara.getTime() + peticio.durada * 60_000);
    const { data: iniciada, error } = await db
      .from("v2_partida")
      .update({ started_at: ara.toISOString(), duration_minutes: peticio.durada, ends_at: fi.toISOString() })
      .eq("id", 1)
      .is("started_at", null)
      .select("started_at")
      .maybeSingle();
    if (error) {
      console.error("Error iniciant la partida:", error);
      return NextResponse.json({ error: "No s'ha pogut iniciar la partida" }, { status: 500 });
    }
    if (!iniciada) {
      return NextResponse.json({ error: "La partida ja ha començat" }, { status: 409 });
    }

    const { error: errorEquips } = await db
      .from("v2_teams")
      .update({ status: "joc", started_at: ara.toISOString() })
      .in("slug", EQUIP_IDS)
      .not("claimed_at", "is", null)
      .eq("status", "espera");
    if (errorEquips) console.error("Error posant els equips en joc:", errorEquips);

    return NextResponse.json({ ok: true, startedAt: ara.toISOString(), endsAt: fi.toISOString() });
  }

  if (peticio.accio === "ajustar" || peticio.accio === "acabar") {
    const { data: partida } = await db.from("v2_partida").select("started_at, ends_at").eq("id", 1).maybeSingle();
    if (!partida?.started_at || !partida.ends_at) {
      return NextResponse.json({ error: "La partida encara no ha començat" }, { status: 409 });
    }
    const ara = Date.now();
    let fi: number;
    if (peticio.accio === "acabar") {
      fi = ara;
    } else {
      // Si el temps ja s'havia acabat, afegir minuts compta des d'ara (i no des de l'hora vella).
      const base = peticio.minuts > 0 ? Math.max(new Date(partida.ends_at).getTime(), ara) : new Date(partida.ends_at).getTime();
      fi = Math.max(base + peticio.minuts * 60_000, ara);
    }
    const endsAt = new Date(fi).toISOString();
    const { error } = await db.from("v2_partida").update({ ends_at: endsAt }).eq("id", 1);
    if (error) {
      console.error("Error ajustant el temps:", error);
      return NextResponse.json({ error: "No s'ha pogut canviar el temps" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, endsAt });
  }

  const { data: equips } = await db.from("v2_teams").select("id").in("slug", EQUIP_IDS);
  const ids = (equips ?? []).map((e) => e.id);
  await db.from("v2_progres").delete().in("team_id", ids);
  await db.from("v2_missatges").delete().in("team_id", ids);
  await db
    .from("v2_teams")
    .update({
      status: "espera",
      started_at: null,
      finished_at: null,
      guardians_at: null,
      claimed_at: null,
      session_nonce: null,
      last_lat: null,
      last_lng: null,
      last_location_at: null,
    })
    .in("id", ids);
  await db.from("v2_partida").update({ started_at: null, duration_minutes: null, ends_at: null }).eq("id", 1);

  return NextResponse.json({ ok: true });
}
