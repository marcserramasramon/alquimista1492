"use client";

import { ELEMENTS, type Element } from "@/content/public/estacions";

/** Una ajuda pendent tal com la retorna GET /api/master/ajudes. */
export interface AjudaPendent {
  id: string;
  team_id: string;
  element: Element;
  created_at: string;
}

export interface PanellAjudesMasterProps {
  equips: { id: string; name: string }[] | null;
  pendents: AjudaPendent[];
  onDesbloqueja: (id: string) => void;
}

/**
 * Ajudes que els equips han demanat per a un element que encara no tenen. El màster les desbloqueja: la fita
 * queda com aconseguida per a l'equip (el logo es pot triar i l'AR en mostra les estrelles).
 */
export function PanellAjudesMaster({ equips, pendents, onDesbloqueja }: PanellAjudesMasterProps) {
  if (pendents.length === 0) return null;
  const nomEquip = (id: string) => equips?.find((e) => e.id === id)?.name ?? "un equip";

  return (
    <section className="flex flex-col gap-2">
      <h2 className="etiqueta text-base">ajudes demanades</h2>
      <ul className="flex flex-col gap-2">
        {pendents.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between gap-3 rounded-xl border-[3px] border-ink bg-[#fffdf7] p-3 shadow-[0_3px_0_var(--ink)]"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-ink-soft">{nomEquip(a.team_id)}</p>
              <p className="text-lg font-bold leading-snug">Ajuda per a {ELEMENTS[a.element].nom}</p>
            </div>
            <button
              type="button"
              onClick={() => onDesbloqueja(a.id)}
              className="min-h-12 shrink-0 rounded-xl border-[3px] border-ink bg-[#ffd76e] px-3 text-sm font-extrabold active:translate-y-0.5"
            >
              Desbloqueja
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
