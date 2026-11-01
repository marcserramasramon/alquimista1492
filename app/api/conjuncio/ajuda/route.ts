import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getEquipSession } from "@/lib/auth";

const AjudaSchema = z.object({
  element: z.enum(["aigua", "terra", "foc", "aire", "anima"]),
});

/**
 * L'equip demana al màster l'ajuda d'un element que encara no té. Una sola petició per element: si ja n'hi
 * ha una (pendent o resolta), es torna el mateix resultat sense crear-ne una altra.
 */
export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });
  if (sessio.status === "espera") {
    return NextResponse.json({ error: "La partida encara no ha començat" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validacio = AjudaSchema.safeParse(body);
  if (!validacio.success) return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });

  const { error } = await getServiceRoleClient()
    .from("v2_ajudes")
    .insert({ team_id: sessio.teamId, element: validacio.data.element });
  // 23505: ja s'havia demanat per a aquest element.
  if (error && error.code !== "23505") {
    console.error("Error demanant l'ajuda:", error);
    return NextResponse.json({ error: "No s'ha pogut enviar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
