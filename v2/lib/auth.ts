import "server-only";

import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const EQUIP_COOKIE = "v2_equip";
const MASTER_COOKIE = "v2_master";
const EQUIP_DURATION_SECONDS = 8 * 60 * 60; // 8 hores, dura tota la sessió de joc
const MASTER_DURATION_SECONDS = 12 * 60 * 60;

function secret(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable d'entorn ${name}`);
  return new TextEncoder().encode(value);
}

export interface EquipSession {
  teamId: string;
  code: string;
}

/** Signa una cookie de sessió d'equip (1 mòbil = 1 equip). */
export async function signEquipToken(session: EquipSession): Promise<string> {
  return new SignJWT({ teamId: session.teamId, code: session.code })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + EQUIP_DURATION_SECONDS)
    .sign(secret("PASS_SECRET"));
}

/** Llegeix i verifica la sessió de l'equip a partir de la petició. Retorna null si no n'hi ha o no és vàlida. */
export async function getEquipSession(request: NextRequest): Promise<EquipSession | null> {
  const token = request.cookies.get(EQUIP_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret("PASS_SECRET"));
    if (typeof payload.teamId !== "string" || typeof payload.code !== "string") return null;
    return { teamId: payload.teamId, code: payload.code };
  } catch {
    return null;
  }
}

export const EQUIP_COOKIE_NAME = EQUIP_COOKIE;
export const EQUIP_COOKIE_MAX_AGE = EQUIP_DURATION_SECONDS;

export interface MasterSession {
  role: "master";
}

export async function signMasterToken(): Promise<string> {
  return new SignJWT({ role: "master" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + MASTER_DURATION_SECONDS)
    .sign(secret("MASTER_SESSION_SECRET"));
}

export async function getMasterSession(request: NextRequest): Promise<MasterSession | null> {
  const token = request.cookies.get(MASTER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret("MASTER_SESSION_SECRET"));
    if (payload.role !== "master") return null;
    return { role: "master" };
  } catch {
    return null;
  }
}

export const MASTER_COOKIE_NAME = MASTER_COOKIE;
export const MASTER_COOKIE_MAX_AGE = MASTER_DURATION_SECONDS;
