import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { getSolucio } from "@/content/private/solucions";

const PistaSchema = z.object({
  estacioId: z.string().min(1),
  /** 0 = Pista 1, 1 = Pista 2, 2 = Resposta. */
  nivell: z.number().int().min(0),
});

export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal entrar amb el codi d'equip" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validacio = PistaSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const { estacioId, nivell } = validacio.data;
  const solucio = getSolucio(estacioId);
  if (!solucio || solucio.pistes.length === 0) {
    return NextResponse.json({ error: "No hi ha pistes per a aquesta estació" }, { status: 404 });
  }

  const db = getServiceRoleClient();
  const { data: existent } = await db
    .from("v2_progres")
    .select("id, pistes_usades")
    .eq("team_id", sessio.teamId)
    .eq("estacio_id", estacioId)
    .maybeSingle();

  const usadesActuals = existent?.pistes_usades ?? 0;

  if (nivell >= solucio.pistes.length) {
    return NextResponse.json({ error: "Aquesta pista no existeix" }, { status: 400 });
  }
  if (nivell > usadesActuals) {
    return NextResponse.json({ error: "Primer heu de demanar la pista anterior" }, { status: 409 });
  }

  // Demanar un nivell ja desbloquejat (doble toc, recàrrega) no en gasta cap més.
  if (nivell === usadesActuals) {
    if (existent) {
      await db
        .from("v2_progres")
        .update({ pistes_usades: usadesActuals + 1 })
        .eq("id", existent.id);
    } else {
      await db.from("v2_progres").insert({
        team_id: sessio.teamId,
        estacio_id: estacioId,
        pistes_usades: 1,
      });
    }
  }

  return NextResponse.json({ pista: solucio.pistes[nivell], nivell });
}
