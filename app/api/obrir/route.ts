import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEquipSession } from "@/lib/auth";
import { getEstacio, getPasPrevi } from "@/content/public/estacions";
import { getEstacioPerCodi } from "@/content/private/codisFites";
import { necessitaObertura, obrirFita } from "@/lib/obertura";
import { RADI_OBERTURA_M, distanciaMetres } from "@/lib/ubicacio";

/**
 * Obre una fita de dues maneres:
 * - GPS: el mòbil diu on és i el servidor comprova que és dins el radi de la fita.
 * - Codi: el del QR del cartell, escanejat o entrat a mà. El codi ja diu quina fita és.
 */
const ObrirSchema = z.union([
  z.object({
    estacioId: z.string().min(1).max(50),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  z.object({
    codi: z.string().trim().min(1).max(300),
    via: z.enum(["qr", "codi"]),
  }),
]);

export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });
  }
  if (sessio.status === "espera") {
    return NextResponse.json({ error: "La partida encara no ha començat" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validacio = ObrirSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }
  const dades = validacio.data;

  if ("codi" in dades) {
    const id = getEstacioPerCodi(dades.codi);
    const desti = id ? getEstacio(id) ?? getPasPrevi(id) : undefined;
    if (!desti || !desti.disponible) {
      return NextResponse.json({ error: "Aquest codi no és de cap fita. Reviseu-lo." }, { status: 404 });
    }
    await obrirFita(sessio.teamId, desti.id, dades.via);
    return NextResponse.json({ estacioId: desti.id });
  }

  const estacio = getEstacio(dades.estacioId);
  const pas = estacio ? undefined : getPasPrevi(dades.estacioId);
  const desti = estacio ?? pas;
  if (!desti || !desti.disponible || (estacio && !necessitaObertura(estacio))) {
    return NextResponse.json({ error: "Estació no disponible" }, { status: 404 });
  }
  const distancia = distanciaMetres(dades, { lat: desti.latitud, lng: desti.longitud });
  if (distancia > RADI_OBERTURA_M) {
    return NextResponse.json(
      { error: "Encara no sou a la fita", distancia: Math.round(distancia) },
      { status: 403 }
    );
  }
  await obrirFita(sessio.teamId, desti.id, "gps");
  return NextResponse.json({ estacioId: desti.id });
}
