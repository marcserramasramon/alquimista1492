import { generaSoroll, opcionsSoroll, BLAU_OBJECTIU, RADI_PUNTS_OBJECTIU } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";

/**
 * Pàgina de desenvolupament per comparar el color i la mida dels punts del
 * número secret del cartell de Foc. Hereta el layout de /pantalles (404 en producció).
 */
const BLAU_MIG = "#2f63c0";
const RADI_PETIT = 2.7;

const VARIANTS = [
  { titol: "Actual", detall: `color ${BLAU_OBJECTIU} · radi ${RADI_PUNTS_OBJECTIU}`, color: BLAU_OBJECTIU, radi: RADI_PUNTS_OBJECTIU },
  { titol: "A · Punts més petits", detall: `color ${BLAU_OBJECTIU} · radi ${RADI_PETIT}`, color: BLAU_OBJECTIU, radi: RADI_PETIT },
  { titol: "B · Blau menys fosc", detall: `color ${BLAU_MIG} · radi ${RADI_PUNTS_OBJECTIU}`, color: BLAU_MIG, radi: RADI_PUNTS_OBJECTIU },
  { titol: "C · Punts petits i blau menys fosc", detall: `color ${BLAU_MIG} · radi ${RADI_PETIT}`, color: BLAU_MIG, radi: RADI_PETIT },
];

export default function SorollFocComparacioPage() {
  return (
    <div className="min-h-dvh bg-paper p-4 text-ink">
      <h1 className="font-display text-xl font-bold">Comparació · número secret de Foc</h1>
      <p className="mb-4 text-sm text-ink-soft">Mateixa composició, canviant només el color i el radi dels punts del número (273 d&apos;exemple).</p>
      <div className="space-y-6">
        {VARIANTS.map((v) => (
          <section key={v.titol}>
            <h2 className="font-semibold">{v.titol}</h2>
            <p className="mb-1 font-mono text-xs text-ink-soft">{v.detall}</p>
            <div className="overflow-hidden rounded-xl border-2 border-ink-soft/30 bg-white">
              <SorollFocSvg
                soroll={generaSoroll({ resposta: "273", ...opcionsSoroll("imatge"), colorObjectiu: v.color, radiPunts: v.radi })}
                className="w-full"
              />
            </div>
          </section>
        ))}
        <section>
          <h2 className="font-semibold">Símbol 🜂 (en blau i punts grans, per veure la forma)</h2>
          <p className="mb-1 font-mono text-xs text-ink-soft">simbolObjectiu: &quot;foc&quot; · color {BLAU_MIG} · radi {RADI_PETIT}</p>
          <div className="overflow-hidden rounded-xl border-2 border-ink-soft/30 bg-white">
            <SorollFocSvg soroll={generaSoroll({ resposta: "", simbolObjectiu: "foc", ...opcionsSoroll("imatge"), colorObjectiu: BLAU_MIG, radiPunts: RADI_PETIT })} className="w-full" />
          </div>
        </section>
      </div>
    </div>
  );
}
