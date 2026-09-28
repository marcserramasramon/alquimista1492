"use client";

/** Un avís tal com el retorna GET /api/master/avisos. */
export interface AvisEquip {
  id: string;
  team_id: string;
  text: string;
  created_at: string;
  llegit_at: string | null;
}

export interface PanellAvisosMasterProps {
  equips: { id: string; name: string }[] | null;
  /** Últims avisos, del més nou al més vell. */
  recents: AvisEquip[];
  onLlegit: (id: string) => void;
}

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Avisos que els equips han enviat amb el botó "?" del mapa. Direcció única
 * (l'equip no rep resposta dins l'app): el màster només els pot marcar com a
 * llegits, no respondre-hi des d'aquí.
 */
export function PanellAvisosMaster({ equips, recents, onLlegit }: PanellAvisosMasterProps) {
  if (recents.length === 0) return null;
  const nomEquip = (id: string) => equips?.find((e) => e.id === id)?.name ?? "un equip";

  return (
    <section className="flex flex-col gap-2">
      <h2 className="etiqueta text-base">avisos dels equips</h2>
      <ul className="flex flex-col gap-2">
        {recents.map((a) => (
          <li
            key={a.id}
            className={`flex items-start justify-between gap-3 rounded-xl border-[3px] p-3 ${
              a.llegit_at ? "border-ink/25 bg-paper-2/60" : "border-ink bg-[#fffdf7] shadow-[0_3px_0_var(--ink)]"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-ink-soft">
                {nomEquip(a.team_id)} · {hora(a.created_at)}
              </p>
              <p className="whitespace-pre-line text-lg font-bold leading-snug">{a.text}</p>
            </div>
            {!a.llegit_at && (
              <button
                type="button"
                onClick={() => onLlegit(a.id)}
                className="min-h-12 shrink-0 rounded-xl border-[3px] border-ink bg-[#fffdf7] px-3 text-sm font-extrabold active:translate-y-0.5"
              >
                ✓ Llegit
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
