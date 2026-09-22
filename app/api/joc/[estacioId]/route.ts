import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getEquipSession } from "@/lib/auth";
import { getEstacio } from "@/content/public/estacions";
import { getSolucio } from "@/content/private/solucions";
import { getServiceRoleClient } from "@/lib/supabase";

export async function GET(request: NextRequest, { params }: { params: Promise<{ estacioId: string }> }) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal entrar amb el codi d'equip" }, { status: 401 });
  }

  const { estacioId } = await params;
  const estacio = getEstacio(estacioId);
  if (!estacio || !estacio.disponible) {
    return NextResponse.json({ error: "Estació no disponible" }, { status: 404 });
  }

  // Només les pistes que l'equip ja ha desbloquejat (mai les següents).
  const { data: progres } = await getServiceRoleClient()
    .from("v2_progres")
    .select("pistes_usades")
    .eq("team_id", sessio.teamId)
    .eq("estacio_id", estacioId)
    .maybeSingle();
  const pistes = getSolucio(estacioId)?.pistes ?? [];
  const pistesDesbloquejades = pistes.slice(0, progres?.pistes_usades ?? 0);

  return NextResponse.json({ estacio, pistesDesbloquejades });
}
