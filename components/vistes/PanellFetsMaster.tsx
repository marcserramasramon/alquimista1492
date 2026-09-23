import { ELEMENTS, getEstacio } from "@/content/public/estacions";

export type TipusFet = "arriba" | "resol" | "fragments" | "guardians";

/** Un fet de la partida, tal com el retorna GET /api/master/fets. */
export interface FetPartida {
  /** Estable entre lectures (porta l'hora: després d'un reinici no es repeteix). El client el fa servir per saber què és nou. */
  id: string;
  tipus: TipusFet;
  teamId: string;
  estacioId?: string;
  t: string;
}

export interface PanellFetsMasterProps {
  /** Del més nou al més vell. */
  fets: FetPartida[];
  equips: { id: string; name: string }[];
  /** Quants se'n mostren. */
  maxim?: number;
}

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" });
}

function fita(estacioId: string | undefined) {
  const estacio = estacioId ? getEstacio(estacioId) : undefined;
  if (estacio?.element) return { nom: ELEMENTS[estacio.element].nom, icona: ELEMENTS[estacio.element].icona };
  return { nom: estacio?.nom ?? "una fita", icona: "✦" };
}

/** Frase i icona d'un fet, per a la llista i per a l'avís gran. */
export function descriureFet(fet: FetPartida, nomEquip: string) {
  const { nom, icona } = fita(fet.estacioId);
  switch (fet.tipus) {
    case "arriba":
      return { icona, text: `${nomEquip} arriba a ${nom}`, destacat: false };
    case "resol":
      return { icona, text: `${nomEquip} resol ${nom}`, destacat: true };
    case "fragments":
      return { icona: "⚗️", text: `${nomEquip} té tots els fragments`, destacat: true };
    case "guardians":
      return { icona: "✨", text: `${nomEquip}, consagrats Guardians`, destacat: false };
  }
}

/** Els últims fets de la partida, a dalt de la pestanya Equips. */
export function PanellFetsMaster({ fets, equips, maxim = 5 }: PanellFetsMasterProps) {
  const nomEquip = (id: string) => equips.find((e) => e.id === id)?.name ?? "Un equip";

  return (
    <div className="targeta p-4">
      <p className="etiqueta">últims fets</p>
      {fets.length === 0 ? (
        <p className="mt-2 text-base text-ink-soft">Encara no ha passat res.</p>
      ) : (
        <ol className="mt-2 flex flex-col gap-2">
          {fets.slice(0, maxim).map((fet) => {
            const { icona, text, destacat } = descriureFet(fet, nomEquip(fet.teamId));
            return (
              <li key={fet.id} className="flex items-center gap-3">
                <span className="w-14 shrink-0 font-display text-xl font-extrabold tabular-nums">{hora(fet.t)}</span>
                {icona.startsWith("/") ? (
                  <img src={icona} alt="" className="h-7 w-7 shrink-0" />
                ) : (
                  <span aria-hidden className="w-7 shrink-0 text-center text-lg">
                    {icona}
                  </span>
                )}
                <span className={`flex-1 text-base leading-tight ${destacat ? "font-extrabold" : ""}`}>{text}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
