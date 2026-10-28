import { generaSoroll, opcionsSoroll, BLAU_OBJECTIU, RADI_PUNTS_OBJECTIU } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";

/**
 * Pàgina de desenvolupament per comparar el color i la mida dels punts de la
 * resposta secreta del cartell de Foc. Hereta el layout de /pantalles (404 en producció).
 */
const RADI_PETIT = 2.7;

/** Símbol alquímic del foc (U+1F702), la resposta del cartell. */
const SIMBOL_FOC = "\u{1F702}";

const VARIANTS = [
  {
    titol: "Actual",
    detall: `color ${BLAU_OBJECTIU} · radi ${RADI_PUNTS_OBJECTIU} · símbol U+1F702`,
    color: BLAU_OBJECTIU,
    radi: RADI_PUNTS_OBJECTIU,
    simbol: true,
  },
  {
    titol: "Actual, amb punts grans (només per veure la malla)",
    detall: `color ${BLAU_OBJECTIU} · radi ${RADI_PETIT} · símbol U+1F702`,
    color: BLAU_OBJECTIU,
    radi: RADI_PETIT,
    simbol: true,
  },
];

export default function SorollFocComparacioPage() {
  return (
    <div className="min-h-dvh bg-paper p-4 text-ink">
      <h1 className="font-display text-xl font-bold">Comparació · resposta secreta de Foc</h1>
      <p className="mb-4 text-sm text-ink-soft">
        Mateixa composició, canviant només el color i el radi dels punts de la resposta (símbol {SIMBOL_FOC}).
      </p>
      <div className="space-y-6">
        {VARIANTS.map((v) => (
          <section key={v.titol}>
            <h2 className="font-semibold">
              {v.titol}
              {v.simbol && <span className="ml-2 font-sans">{SIMBOL_FOC}</span>}
            </h2>
            <p className="mb-1 font-mono text-xs text-ink-soft">{v.detall}</p>
            <div className="overflow-hidden rounded-xl border-2 border-ink-soft/30 bg-white">
              <SorollFocSvg
                soroll={generaSoroll({
                  resposta: "273",
                  ...(v.simbol ? { simbolObjectiu: "foc" as const } : {}),
                  ...opcionsSoroll("imatge"),
                  colorObjectiu: v.color,
                  radiPunts: v.radi,
                })}
                className="w-full"
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
