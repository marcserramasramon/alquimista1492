import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";
import { UbicacioSchema } from "@/lib/ubicacio";

/** O bé la posició del màster, o bé l'interruptor de compartir-la. */
const MasterUbicacioSchema = z.union([UbicacioSchema, z.object({ sharing: z.boolean() })]);

export async function POST(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = MasterUbicacioSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }

  const dades = validacio.data;
  const canvis =
    "sharing" in dades
      ? { sharing: dades.sharing }
      : { lat: dades.lat, lng: dades.lng, accuracy: dades.accuracy ?? null, updated_at: new Date().toISOString() };

  const { error } = await getServiceRoleClient().from("v2_master_location").update(canvis).eq("id", 1);
  if (error) {
    console.error("Error desant la ubicació del màster:", error);
    return NextResponse.json({ error: "No s'ha pogut desar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
