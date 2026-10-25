import "server-only";

import { NextResponse } from "next/server";
import { EQUIP_COOKIE_NAME } from "@/lib/auth";

/**
 * Aquest mòbil surt del seu equip: només s'esborra la cookie. L'equip no canvia a la BD
 * (els altres mòbils seguen dins), i aquest mòbil pot tornar a entrar escanejant el QR.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(EQUIP_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
