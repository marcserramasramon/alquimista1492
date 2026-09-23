import "server-only";

import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getServiceRoleClient } from "@/lib/supabase";

const EQUIP_COOKIE = "v2_equip";
const MASTER_COOKIE = "v2_master";
const EQUIP_DURATION_SECONDS = 8 * 60 * 60; // 8 hores, dura tota la sessió de joc
const MASTER_DURATION_SECONDS = 12 * 60 * 60;

function secret(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable d'entorn ${name}`);
  return new TextEncoder().encode(value);
}

export type EstatEquip = "espera" | "joc" | "final";

export interface EquipSession {
  teamId: string;
  /** Estat actual de l'equip a la BD ("espera" fins que el màster inicia la partida). */
  status: EstatEquip;
}

/**
 * Signa una cookie de sessió d'equip (1 mòbil = 1 equip). El `nonce` és el
 * `session_nonce` de l'equip en el moment d'agafar-lo: si el màster l'allibera,
 * canvia i aquesta cookie deixa de valer.
 */
export async function signEquipToken(session: { teamId: string; nonce: string }): Promise<string> {
  return new SignJWT({ teamId: session.teamId, nonce: session.nonce })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + EQUIP_DURATION_SECONDS)
    .sign(secret("PASS_SECRET"));
}

/** Llegeix i verifica la sessió de l'equip a partir de la petició. Retorna null si no n'hi ha o no és vàlida. */
export async function getEquipSession(request: NextRequest): Promise<EquipSession | null> {
  return verifyEquipToken(request.cookies.get(EQUIP_COOKIE)?.value);
}

/** Com getEquipSession, però per a Server Components (llegeix les cookies de next/headers). */
export async function getEquipSessionFromCookies(): Promise<EquipSession | null> {
  const cookieStore = await cookies();
  return verifyEquipToken(cookieStore.get(EQUIP_COOKIE)?.value);
}

async function verifyEquipToken(token: string | undefined): Promise<EquipSession | null> {
  if (!token) return null;
  let teamId: string;
  let nonce: string;
  try {
    const { payload } = await jwtVerify(token, secret("PASS_SECRET"));
    if (typeof payload.teamId !== "string" || typeof payload.nonce !== "string") return null;
    teamId = payload.teamId;
    nonce = payload.nonce;
  } catch {
    return null;
  }

  // La cookie només val mentre l'equip continuï agafat per aquest mateix mòbil.
  const { data: equip, error } = await getServiceRoleClient()
    .from("v2_teams")
    .select("status, session_nonce")
    .eq("id", teamId)
    .maybeSingle();
  if (error) {
    // Error de BD puntual: no es fa fora l'equip per això (la signatura ja és vàlida).
    console.error("Error verificant la sessió d'equip:", error);
    return { teamId, status: "joc" };
  }
  if (!equip || equip.session_nonce !== nonce) return null;
  return { teamId, status: equip.status as EstatEquip };
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
  return verifyMasterToken(request.cookies.get(MASTER_COOKIE)?.value);
}

/** Com getMasterSession, però per a Server Components. */
export async function getMasterSessionFromCookies(): Promise<MasterSession | null> {
  const cookieStore = await cookies();
  return verifyMasterToken(cookieStore.get(MASTER_COOKIE)?.value);
}

async function verifyMasterToken(token: string | undefined): Promise<MasterSession | null> {
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
