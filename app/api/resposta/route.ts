import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";
import { getEstacio } from "@/content/public/estacions";
import { getSolucio, comparaResposta } from "@/content/private/solucions";

const RespostaSchema = z.object({
  estacioId: z.string().min(1),
  resposta: z.string().trim().min(1).max(100),
});

export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal entrar amb el codi d'equip" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validacio = RespostaSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const { estacioId, resposta } = validacio.data;

  const estacio = getEstacio(estacioId);
  const solucio = getSolucio(estacioId);
  if (!estacio || !estacio.disponible || !solucio) {
    return NextResponse.json({ error: "Aquesta estació encara no està disponible" }, { status: 404 });
  }

  const correcte = comparaResposta(solucio, resposta);

  const db = getServiceRoleClient();

  const { data: existent } = await db
    .from("v2_progres")
    .select("id, intents, resolta")
    .eq("team_id", sessio.teamId)
    .eq("estacio_id", estacioId)
    .maybeSingle();

  const araIso = new Date().toISOString();

  if (existent) {
    await db
      .from("v2_progres")
      .update({
        intents: existent.intents + 1,
        resolta: existent.resolta || correcte,
        resolta_at: existent.resolta ? undefined : correcte ? araIso : undefined,
      })
      .eq("id", existent.id);
  } else {
    await db.from("v2_progres").insert({
      team_id: sessio.teamId,
      estacio_id: estacioId,
      intents: 1,
      resolta: correcte,
      resolta_at: correcte ? araIso : null,
    });
  }

  return NextResponse.json({
    correcte,
    missatge: correcte ? "Resposta correcta!" : "Encara no ho és. Torneu-ho a provar.",
  });
}
