import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getEquipSession } from "@/lib/auth";
import { getEstacio, getPasPrevi } from "@/content/public/estacions";
import { getSolucio } from "@/content/private/solucions";
import { getServiceRoleClient } from "@/lib/supabase";
import { estaOberta, necessitaObertura } from "@/lib/obertura";

export async function GET(request: NextRequest, { params }: { params: Promise<{ estacioId: string }> }) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });
  }
  if (sessio.status === "espera") {
    return NextResponse.json({ error: "La partida encara no ha començat" }, { status: 403 });
  }

  const { estacioId } = await params;
  const estacio = getEstacio(estacioId);
  const pas = estacio ? undefined : getPasPrevi(estacioId);
  if ((!estacio && !pas) || !(estacio ?? pas)!.disponible) {
    return NextResponse.json({ error: "Estació no disponible" }, { status: 404 });
  }

  const { data: progres } = await getServiceRoleClient()
    .from("v2_progres")
    .select("pistes_usades, resolta, oberta_at")
    .eq("team_id", sessio.teamId)
    .eq("estacio_id", estacioId)
    .maybeSingle();

  // Un pas previ no té enigma ni pistes: només cal haver-hi arribat per veure'n el text.
  if (pas) {
    if (!estaOberta(progres)) {
      return NextResponse.json(
        { error: "Aquest punt encara és tancat. Aneu-hi i escanegeu el QR del cartell.", tancada: true },
        { status: 403 }
      );
    }
    return NextResponse.json({
      estacio: { ...pas, pasPrevi: true },
      pistesDesbloquejades: [],
      resolta: false,
    });
  }

  // Fins que l'equip no hi arriba (GPS o QR del cartell), la prova no s'envia.
  if (necessitaObertura(estacio!) && !estaOberta(progres)) {
    return NextResponse.json(
      { error: "Aquesta fita encara és tancada. Aneu-hi i escanegeu el QR del cartell.", tancada: true },
      { status: 403 }
    );
  }
  const pistes = getSolucio(estacioId)?.pistes ?? [];
  const pistesDesbloquejades = pistes.slice(0, progres?.pistes_usades ?? 0);

  return NextResponse.json({ estacio, pistesDesbloquejades, resolta: progres?.resolta ?? false });
}
