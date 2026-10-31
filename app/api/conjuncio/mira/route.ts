import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEquipSession } from "@/lib/auth";
import { AREA_ESTRELLA_GRAUS, ESTRELLES_DIR, estrellaProperaA } from "@/content/private/conjuncio";
import { type V3 } from "@/lib/conjuncio/cel";

const MiraSchema = z.object({
  aim: z.tuple([z.number().finite(), z.number().finite(), z.number().finite()]),
});

/**
 * Rep cap on apunta l'equip (un vector) i retorna només l'estrella més propera, si és dins de l'àrea gran.
 * Les altres estrelles no surten mai del servidor des d'aquí.
 */
export async function POST(request: NextRequest) {
  const sessio = await getEquipSession(request);
  if (!sessio) {
    return NextResponse.json({ error: "Cal triar un equip" }, { status: 401 });
  }
  if (sessio.status === "espera") {
    return NextResponse.json({ error: "La partida encara no ha començat" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validacio = MiraSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const aim = normalitza(validacio.data.aim);
  if (!aim) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const i = estrellaProperaA(aim, AREA_ESTRELLA_GRAUS);
  return NextResponse.json({ estrella: i >= 0 ? { i, dir: ESTRELLES_DIR[i] } : null });
}

/** Vector unitari, o null si és el vector zero. */
function normalitza(v: V3): V3 | null {
  const l = Math.hypot(v[0], v[1], v[2]);
  if (l === 0) return null;
  return [v[0] / l, v[1] / l, v[2] / l];
}
