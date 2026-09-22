import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getMasterSession } from "@/lib/auth";
import { getEstacionsJugables } from "@/content/public/estacions";

function generaCodi(): string {
  const alfabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sense 0/O/1/I per evitar confusions
  let codi = "";
  for (let i = 0; i < 6; i++) codi += alfabet[Math.floor(Math.random() * alfabet.length)];
  return codi;
}

export async function GET(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const db = getServiceRoleClient();
  const { data: equips, error: equipsError } = await db
    .from("v2_teams")
    .select("id, code, name, status, started_at, finished_at, last_lat, last_lng, last_location_at")
    .order("created_at", { ascending: true });

  if (equipsError) {
    console.error("Error llegint equips:", equipsError);
    return NextResponse.json({ error: "No s'ha pogut llegir els equips" }, { status: 500 });
  }

  const { data: progres } = await db.from("v2_progres").select("team_id, estacio_id, resolta");

  const total = getEstacionsJugables().filter((e) => e.disponible).length;

  const resultat = (equips ?? []).map((e) => {
    const resoltes = (progres ?? []).filter((p) => p.team_id === e.id && p.resolta).length;
    return { ...e, resoltes, total };
  });

  const { data: ubicacioMaster } = await db
    .from("v2_master_location")
    .select("lat, lng, sharing, updated_at")
    .eq("id", 1)
    .maybeSingle();

  return NextResponse.json({ equips: resultat, master: ubicacioMaster ?? null });
}

const NouEquipSchema = z.object({ nom: z.string().trim().min(1).max(60) });

export async function POST(request: NextRequest) {
  const sessio = await getMasterSession(request);
  if (!sessio) return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const validacio = NouEquipSchema.safeParse(body);
  if (!validacio.success) {
    return NextResponse.json({ error: "Nom invàlid" }, { status: 400 });
  }

  const db = getServiceRoleClient();

  for (let intent = 0; intent < 5; intent++) {
    const codi = generaCodi();
    const { data, error } = await db
      .from("v2_teams")
      .insert({ code: codi, name: validacio.data.nom })
      .select("id, code, name, status")
      .single();

    if (!error && data) {
      return NextResponse.json({ equip: data });
    }
    console.error("Error creant equip:", error);
    // Codi duplicat (molt improbable): torna-ho a provar amb un altre.
  }

  return NextResponse.json({ error: "No s'ha pogut crear l'equip" }, { status: 500 });
}
