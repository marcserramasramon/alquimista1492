"use client";

import { useMemo, useState } from "react";
import { generaSoroll, opcionsSoroll } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";

const ALCADA = opcionsSoroll("imatge").alcada;
const QUANTITAT_DEFECTE = opcionsSoroll("imatge").quantitat;
const MIDA_PERCENT_DEFECTE = 114; // coincideix amb PROPORCIO_MIDA_OBJECTIU de lib/sorollFoc.ts

/**
 * Eina de desenvolupament per calibrar el "soroll" del cartell de Foc
 * (lib/sorollFoc.ts) abans d'imprimir-lo: mateix component real
 * (SorollFocSvg) amb sliders per variar la quantitat de xifres/símbols, el
 * número amagat i la seva mida.
 */
export function ProvaSorollFoc() {
  const [quantitat, setQuantitat] = useState(QUANTITAT_DEFECTE);
  const [numero, setNumero] = useState(27);
  const [midaPercent, setMidaPercent] = useState(MIDA_PERCENT_DEFECTE);

  const soroll = useMemo(
    () =>
      generaSoroll({
        resposta: String(numero),
        alcada: ALCADA,
        quantitat,
        midaObjectiu: (ALCADA * midaPercent) / 100,
      }),
    [quantitat, numero, midaPercent],
  );

  return (
    <div className="min-h-dvh bg-paper p-4 text-ink">
      <h1 className="font-display text-xl font-bold">Prova · soroll de Foc</h1>
      <p className="mb-4 text-sm text-ink-soft">
        Calibratge del cartell de Foc (content/private no hi intervé: el número és d&apos;exemple).
      </p>

      <div className="mb-5 overflow-hidden rounded-xl border-2 border-ink-soft/30 bg-white">
        <SorollFocSvg soroll={soroll} className="w-full" />
      </div>

      <div className="space-y-5">
        <Control
          label="Quantitat de caràcters i símbols"
          value={quantitat}
          min={50}
          max={1400}
          step={10}
          onChange={setQuantitat}
        />
        <Control label="Número amagat" value={numero} min={0} max={99} step={1} onChange={setNumero} />
        <Control
          label="Mida del número amagat"
          value={midaPercent}
          min={30}
          max={220}
          step={2}
          onChange={setMidaPercent}
          suffix="%"
        />
      </div>
    </div>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-sm font-semibold">
        <span>{label}</span>
        <span className="font-mono text-ink-soft">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-12 w-full"
      />
    </label>
  );
}
