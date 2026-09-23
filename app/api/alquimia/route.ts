import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { combinar } from "@/content/private/alquimia";

const MesclaSchema = z.object({
  a: z.string().trim().min(1).max(40),
  b: z.string().trim().min(1).max(40),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validacio = MesclaSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Petició invàlida" }, { status: 400 });
  }
  return NextResponse.json({ resultat: combinar(validacio.data.a, validacio.data.b) });
}
