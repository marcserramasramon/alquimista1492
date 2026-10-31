import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEquipSession } from "@/lib/auth";
import {
  ESTRELLES_DIR,
  TOLERANCIA_LOCK_DIALS_GRAUS,
  TOLERANCIA_LOCK_MOBIL_GRAUS,
} from "@/content/private/conjuncio";
import { errorAngular, type V3 } from "@/lib/conjuncio/cel";

const LockSchema = z.object({
  i: z.number().int().min(0).max(4),
  aim: z.tuple([z.number().finite(), z.number().finite(), z.number().finite()]),
  mode: z.enum(["mobil", "dials"]),
});

/**
 * Comprova que l'equip apunta a l'estrella `i` dins la tolerància del mode. Només si és correcte, retorna la
 * direcció de l'estrella (aleshores ja és visible per a l'equip).
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
  const validacio = LockSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const { i, mode } = validacio.data;
  const aim = normalitza(validacio.data.aim);
  if (!aim) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const tolerancia = mode === "mobil" ? TOLERANCIA_LOCK_MOBIL_GRAUS : TOLERANCIA_LOCK_DIALS_GRAUS;
  const correcte = errorAngular(aim, ESTRELLES_DIR[i]) <= tolerancia;
  return NextResponse.json(correcte ? { ok: true, dir: ESTRELLES_DIR[i] } : { ok: false });
}

/** Vector unitari, o null si és el vector zero. */
function normalitza(v: V3): V3 | null {
  const l = Math.hypot(v[0], v[1], v[2]);
  if (l === 0) return null;
  return [v[0] / l, v[1] / l, v[2] / l];
}
