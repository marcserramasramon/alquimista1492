import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getEquipSession } from "@/lib/auth";
import { getEstacio } from "@/content/public/estacions";
import { getSolucioPublica } from "@/content/private/solucions";

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

  const solucioPublica = getSolucioPublica(estacioId);
  return NextResponse.json({ estacio, joc: solucioPublica });
}
