"use client";

import { useState } from "react";
import { MAX_TEXT_LLIURE, MISSATGES_MASTER, TITOL_TEXT_LLIURE } from "@/content/public/missatgesMaster";

export type DestiMissatge = "tots" | string;

export type EnviamentMissatge = { desti: DestiMissatge } & ({ clau: string } | { text: string });

export interface ResultatEnviament {
  ok: boolean;
  /** Quants equips l'han rebut. */
  enviats?: number;
  error?: string;
}

/** Un missatge enviat, tal com el retorna GET /api/master/missatges (una fila per equip). */
export interface MissatgeEnviat {
  id: string;
  team_id: string;
  titol: string;
  created_at: string;
  llegit_at: string | null;
}

export interface PanellMissatgesMasterProps {
  equips: { id: string; name: string }[] | null;
  /** Últims enviats, del més nou al més vell. */
  recents: MissatgeEnviat[];
  onEnviar: (enviament: EnviamentMissatge) => Promise<ResultatEnviament>;
  /** Només per a la galeria: estat de partida. */
  inicial?: { desti?: DestiMissatge; clau?: string | null; lliure?: string; resultat?: ResultatEnviament };
}

const LLIURE = "__lliure__";

/** Agrupa les files d'un mateix enviament (a "tots" es desa una fila per equip, amb la mateixa hora). */
function agrupar(recents: MissatgeEnviat[]) {
  const grups = new Map<string, { titol: string; created_at: string; files: MissatgeEnviat[] }>();
  for (const m of recents) {
    const clau = `${m.created_at}|${m.titol}`;
    const grup = grups.get(clau) ?? { titol: m.titol, created_at: m.created_at, files: [] };
    grup.files.push(m);
    grups.set(clau, grup);
  }
  return [...grups.values()].slice(0, 6);
}

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" });
}

/** Panell del màster per enviar un missatge (preconfigurat o lliure) a un equip o a tots. Pensat per al polze. */
export function PanellMissatgesMaster({ equips, recents, onEnviar, inicial }: PanellMissatgesMasterProps) {
  const [desti, setDesti] = useState<DestiMissatge>(inicial?.desti ?? "tots");
  const [clau, setClau] = useState<string | null>(inicial?.clau ?? null);
  const [lliure, setLliure] = useState(inicial?.lliure ?? "");
  const [enviant, setEnviant] = useState(false);
  const [resultat, setResultat] = useState<ResultatEnviament | null>(inicial?.resultat ?? null);

  const nomEquip = (id: string) => equips?.find((e) => e.id === id)?.name ?? "equip";
  const nomDesti = desti === "tots" ? "tots els equips" : nomEquip(desti);
  const seleccionat = clau && clau !== LLIURE ? MISSATGES_MASTER.find((m) => m.id === clau) : undefined;
  const textLliure = lliure.trim();
  const potEnviar = !enviant && (seleccionat !== undefined || (clau === LLIURE && textLliure.length > 0));

  function triar<T>(setter: (v: T) => void) {
    return (valor: T) => {
      setter(valor);
      setResultat(null);
    };
  }
  const triarDesti = triar(setDesti);
  const triarClau = triar(setClau);

  async function enviar() {
    if (!potEnviar) return;
    setEnviant(true);
    setResultat(null);
    try {
      const r = await onEnviar(seleccionat ? { desti, clau: seleccionat.id } : { desti, text: textLliure });
      setResultat(r);
      if (r.ok) {
        setClau(null);
        setLliure("");
      }
    } finally {
      setEnviant(false);
    }
  }

  const opcioDesti = (id: DestiMissatge, nom: string) => (
    <button
      key={id}
      type="button"
      aria-pressed={desti === id}
      onClick={() => triarDesti(id)}
      className={`min-h-12 max-w-full truncate rounded-xl border-[3px] border-ink px-4 text-lg font-extrabold transition-colors ${
        desti === id ? "bg-ink text-paper" : "bg-[#fffdf7] text-ink"
      }`}
    >
      {nom}
    </button>
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="etiqueta text-base">missatges als equips</h2>

      <div className="targeta flex flex-col gap-5 p-4">
        <div className="flex flex-col gap-2">
          <p className="text-lg font-extrabold">A qui?</p>
          <div className="flex flex-wrap gap-2">
            {opcioDesti("tots", "📣 Tots")}
            {equips?.map((e) => opcioDesti(e.id, e.name))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-lg font-extrabold">Què?</p>
          <div className="grid grid-cols-2 gap-2">
            {MISSATGES_MASTER.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={clau === m.id}
                onClick={() => triarClau(m.id)}
                className={`min-h-14 rounded-xl border-[3px] border-ink px-3 py-2 text-left text-base font-extrabold leading-tight transition-colors ${
                  clau === m.id ? "bg-gold text-ink" : "bg-[#fffdf7] text-ink"
                }`}
              >
                {m.titol}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={clau === LLIURE}
              onClick={() => triarClau(LLIURE)}
              className={`col-span-2 min-h-14 rounded-xl border-[3px] border-dashed border-ink px-3 py-2 text-base font-extrabold transition-colors ${
                clau === LLIURE ? "bg-gold text-ink" : "bg-[#fffdf7] text-ink"
              }`}
            >
              ✍️ Escriure un text lliure
            </button>
          </div>
        </div>

        {seleccionat && (
          <div className="rounded-xl border-2 border-ink/40 bg-paper p-3">
            <p className="etiqueta">el veuran així</p>
            <p className="mt-1 font-display text-2xl font-extrabold leading-tight">{seleccionat.titol}</p>
            <p className="mt-1 text-lg">{seleccionat.text}</p>
          </div>
        )}

        {clau === LLIURE && (
          <label className="flex flex-col gap-1">
            <span className="etiqueta">títol: {TITOL_TEXT_LLIURE.toLowerCase()}</span>
            <textarea
              value={lliure}
              onChange={(e) => {
                setLliure(e.target.value);
                setResultat(null);
              }}
              maxLength={MAX_TEXT_LLIURE}
              rows={3}
              placeholder="Escriu el missatge..."
              className="camp resize-none text-lg"
            />
            <span className="self-end text-sm text-ink-soft">
              {lliure.length}/{MAX_TEXT_LLIURE}
            </span>
          </label>
        )}

        <button type="button" onClick={enviar} disabled={!potEnviar} className="btn btn-fosc">
          {enviant ? "Enviant..." : `✉️ Enviar a ${nomDesti}`}
        </button>

        {resultat && (
          <p
            role="status"
            className={`animate-entrar rounded-xl border-[3px] p-3 text-lg font-extrabold ${
              resultat.ok ? "border-ok bg-ok text-white" : "border-blood bg-[#fffdf7] text-blood"
            }`}
          >
            {resultat.ok
              ? `✓ Enviat${resultat.enviats && resultat.enviats > 1 ? ` a ${resultat.enviats} equips` : ""}. Els sortirà a la pantalla.`
              : `✗ ${resultat.error ?? "No s'ha pogut enviar"}`}
          </p>
        )}
      </div>

      {recents.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Últims missatges enviats">
          {agrupar(recents).map((g) => {
            const llegits = g.files.filter((f) => f.llegit_at).length;
            const tots = llegits === g.files.length;
            return (
              <li
                key={`${g.created_at}|${g.titol}`}
                className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink/30 bg-paper-2 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-extrabold">{g.titol}</p>
                  <p className="truncate text-sm text-ink-soft">
                    {hora(g.created_at)} · {g.files.length > 1 ? `${g.files.length} equips` : nomEquip(g.files[0].team_id)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border-2 border-ink px-2.5 text-sm font-extrabold ${
                    tots ? "bg-ok text-white" : "bg-[#fffdf7] text-ink"
                  }`}
                >
                  {g.files.length > 1 ? `llegit ${llegits}/${g.files.length}` : tots ? "✓ llegit" : "pendent"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
