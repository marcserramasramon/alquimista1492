"use client";

import { ELEMENTS } from "@/content/public/estacions";
import type { EquipMaster } from "@/components/vistes/TargetaEquipMaster";

export interface PanellGuardiansMasterProps {
  /** Tots els equips; només es mostren els que tenen un mòbil. */
  equips: EquipMaster[] | null;
  partidaIniciada: boolean;
  /** S'ha esgotat el temps: es pot consagrar un equip encara que no tingui tots els elements. */
  tempsEsgotat: boolean;
  onConsagrar: (teamId: string, consagrar: boolean) => void;
}

/** Ordre a la llista: primer els que ja ho tenen tot, després els que hi van, al final els ja consagrats. */
function pes(e: EquipMaster, total: number) {
  if (e.guardians) return 2;
  return (e.elements?.length ?? 0) >= total ? 0 : 1;
}

/**
 * Pestanya "Guardians": Fra Francesc hi consagra els equips quan veu el LED del Gresol encès.
 * Una fila per equip: nom, els elements que té (només els aconseguits) i el botó de consagrar,
 * que s'activa quan els té tots.
 */
export function PanellGuardiansMaster({ equips, partidaIniciada, tempsEsgotat, onConsagrar }: PanellGuardiansMasterProps) {
  const agafats = (equips ?? []).filter((e) => e.agafat);
  const ordenats = [...agafats].sort((a, b) => pes(a, a.total) - pes(b, b.total));
  const llestos = agafats.filter((e) => !e.guardians && (e.elements?.length ?? 0) >= e.total).length;

  if (equips === null) return <p className="etiqueta text-center">carregant...</p>;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-ink-soft">
        Consagra un equip quan el LED del Gresol s&apos;hagi encès. El seu mòbil passarà a la pantalla final.
        {llestos > 0 && (
          <span className="font-extrabold text-ink">
            {" "}
            {llestos} {llestos === 1 ? "equip ho té" : "equips ho tenen"} tot.
          </span>
        )}
      </p>

      {!partidaIniciada && (
        <p className="rounded-2xl border-[3px] border-dashed border-ink/40 p-4 text-lg font-bold">
          La partida encara no ha començat.
        </p>
      )}

      {agafats.length === 0 ? (
        <p className="rounded-2xl border-[3px] border-dashed border-ink/30 p-6 text-center text-ink-soft">
          Cap equip ha triat la icona encara.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ordenats.map((equip) => (
            <FilaGuardians
              key={equip.id}
              equip={equip}
              potConsagrar={partidaIniciada}
              tempsEsgotat={tempsEsgotat}
              onConsagrar={onConsagrar}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilaGuardians({
  equip,
  potConsagrar,
  tempsEsgotat,
  onConsagrar,
}: {
  equip: EquipMaster;
  potConsagrar: boolean;
  tempsEsgotat: boolean;
  onConsagrar: (teamId: string, consagrar: boolean) => void;
}) {
  const elements = equip.elements ?? [];
  const complet = elements.length >= equip.total;
  // Amb el temps esgotat (o ja al Gresol) també es pot consagrar un equip amb menys elements.
  const forcat = !complet && (tempsEsgotat || equip.status === "final");
  const activat = potConsagrar && !equip.guardians && (complet || forcat);

  return (
    <li className={`targeta flex items-center gap-3 p-3 ${equip.guardians ? "opacity-70" : ""}`}>
      <img src={equip.imatge} alt="" className="h-11 w-11 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-extrabold leading-tight">{equip.name}</p>
        <div className="mt-1 flex min-h-8 items-center gap-1" aria-label={`${elements.length} de ${equip.total} elements`}>
          {elements.length === 0 ? (
            <span className="text-sm text-ink-soft">cap element</span>
          ) : (
            elements.map((el) => (
              <img key={el} src={ELEMENTS[el].iconaResolta} alt={ELEMENTS[el].nom} className="h-8 w-8" />
            ))
          )}
        </div>
      </div>

      {equip.guardians ? (
        <button
          type="button"
          onClick={() => onConsagrar(equip.id, false)}
          className="min-h-12 shrink-0 rounded-xl border-[3px] border-ink bg-[#fffdf7] px-3 text-base font-extrabold active:bg-ink active:text-paper"
        >
          ✨ Fet · ↩ Desfer
        </button>
      ) : (
        <button
          type="button"
          disabled={!activat}
          onClick={() => onConsagrar(equip.id, true)}
          className={`min-h-12 shrink-0 rounded-xl border-[3px] px-3 text-base font-extrabold ${
            !activat
              ? "border-ink/30 bg-paper-3 text-ink-soft"
              : complet
                ? "border-ink bg-ink text-gold shadow-[0_4px_0_var(--ink)] active:translate-y-0.5 active:shadow-none"
                : "border-ink bg-[#fffdf7] text-ink active:bg-ink active:text-paper"
          }`}
        >
          {complet || !activat ? "✨ Consagrar" : `✨ Consagrar ${elements.length}/${equip.total}`}
        </button>
      )}
    </li>
  );
}
