"use client";

import { useState } from "react";
import { EXTRES_AR, type ExtraAr as ExtraArContingut } from "@/content/public/extres";
import { distanciaMetres, type Ubicacio } from "@/lib/ubicacio";

const CLAU_DESCARTATS = "extres-ar-descartats";

/** Només és una comoditat: si el navegador no deixa guardar-ho, la targeta simplement torna a sortir. */
function llegirDescartats(): string[] {
  try {
    const valor = JSON.parse(sessionStorage.getItem(CLAU_DESCARTATS) ?? "[]");
    return Array.isArray(valor) ? valor.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function desarDescartats(ids: string[]) {
  try {
    sessionStorage.setItem(CLAU_DESCARTATS, JSON.stringify(ids));
  } catch {}
}

/** L'extra, si n'hi ha cap a prop de la posició (i no s'ha descartat). */
export function extraProper(posicio: Ubicacio | null, descartats: string[]): ExtraArContingut | null {
  if (!posicio) return null;
  for (const extra of EXTRES_AR) {
    if (descartats.includes(extra.id)) continue;
    if (distanciaMetres(posicio, { lat: extra.latitud, lng: extra.longitud }) <= extra.radiM) return extra;
  }
  return null;
}

export interface ExtraArProps {
  extra: ExtraArContingut;
  onObrir: () => void;
  onDescartar: () => void;
}

/** Targeta vistosa del hub que ofereix l'extra. */
export function TargetaExtraAr({ extra, onObrir, onDescartar }: ExtraArProps) {
  return (
    <div
      role="dialog"
      aria-labelledby="extra-ar-titol"
      className="fixed inset-x-0 bottom-0 z-[120] mx-auto w-full max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="targeta flex animate-pujar flex-col gap-3 border-aire bg-[#0b1620] p-5 text-paper">
        <p id="extra-ar-titol" className="font-display text-3xl font-extrabold">
          👁 {extra.targeta.titol}
        </p>
        <p className="text-base leading-snug text-paper-3">{extra.targeta.text}</p>
        <p className="text-sm text-paper-3/80">Un extra per passar l&apos;estona: no afecta la partida.</p>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={onObrir} className="btn btn-primari">
            {extra.targeta.boto}
          </button>
          <button type="button" onClick={onDescartar} className="btn btn-fosc">
            {extra.targeta.descartar}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Ofereix els extres de realitat augmentada quan l'equip arriba al seu punt. Totalment al
 * client: no escriu ni llegeix res del servidor.
 */
export function ExtraAr({ posicio, onObrir }: { posicio: Ubicacio | null; onObrir: (id: string) => void }) {
  const [descartats, setDescartats] = useState<string[]>(() => llegirDescartats());
  const extra = extraProper(posicio, descartats);
  if (!extra) return null;
  return (
    <TargetaExtraAr
      extra={extra}
      onObrir={() => onObrir(extra.id)}
      onDescartar={() => {
        const nous = [...descartats, extra.id];
        setDescartats(nous);
        desarDescartats(nous);
      }}
    />
  );
}
