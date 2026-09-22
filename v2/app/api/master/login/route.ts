import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signMasterToken, MASTER_COOKIE_NAME, MASTER_COOKIE_MAX_AGE } from "@/lib/auth";

const LoginSchema = z.object({ pin: z.string().min(4).max(12) });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validacio = LoginSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "PIN invàlid" }, { status: 400 });
  }

  const correcte = process.env.MASTER_PIN;
  if (!correcte || validacio.data.pin !== correcte) {
    return NextResponse.json({ error: "PIN incorrecte" }, { status: 401 });
  }

  const token = await signMasterToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(MASTER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MASTER_COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
