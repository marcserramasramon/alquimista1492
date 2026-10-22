import { getSolucio } from "@/content/private/solucions";
import { generaSoroll, opcionsSoroll, PAS_PUNTS_OBJECTIU } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";
import { PROPORCIONS, BLAU_FORT, BLAU_MIG, BLAU_CLAR, colorsBlaus, NUMEROS_INVERTITS as NUMEROS, DENSITAT_SOROLL_INVERTIT as DENSITAT_SOROLL } from "../cartell-foc-proves/dades";

/**
 * Experiment amb els colors invertits respecte al cartell de Foc: el número secret en taronja o groc
 * i el soroll en 3 blaus (fort, mig, clar) amb les mateixes 3 proporcions. Aquí el número va per sobre
 * del soroll, amb la trama de punts al 33% de densitat i el soroll al 333%. Un full A4 apaïsat amb les
 * 6 combinacions (scripts/cartell-foc-proves-pdf.mjs invertit).
 * Porta el número real: com tot /pantalles, és un 404 en producció.
 */
/** Densitat de la trama de punts del número respecte a la del cartell (33%). */
const DENSITAT_PUNTS = 0.33;

export default function CartellFocInvertitPage() {
  const resposta = getSolucio("foc")?.respostesAcceptades[0];
  if (!resposta) throw new Error("Falta la solució de Foc.");
  const opcions = opcionsSoroll("imatge");
  opcions.quantitat = Math.round(opcions.quantitat * DENSITAT_SOROLL);

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print { html, body { background: none !important; } }
      `}</style>
      <main className="mx-auto flex h-[210mm] w-[297mm] flex-col gap-[3mm] overflow-hidden bg-white p-[8mm]">
        <h1 className="text-center text-[15pt] font-extrabold">Colors invertits · número taronja o groc (a sobre, punts al 33%, soroll al 333%), soroll en 3 blaus</h1>
        <p className="text-center font-mono text-[9pt]">
          Soroll: {BLAU_FORT} (fort) · {BLAU_MIG} (mig) · {BLAU_CLAR} (clar)
        </p>
        <div className="grid grid-cols-[22mm_1fr_1fr_1fr] content-start gap-x-[3mm] gap-y-[4mm]">
          <div />
          {PROPORCIONS.map((pr) => (
            <p key={pr.nom} className="text-center font-mono text-[10pt]">
              Soroll {pr.nom}
            </p>
          ))}
          {NUMEROS.map((n) => (
            <div key={n.color} className="contents">
              <p className="self-center font-mono text-[8pt] leading-tight">
                Número
                <br />
                {n.nom}
                <br />
                {n.color}
              </p>
              {PROPORCIONS.map((pr) => (
                <div key={pr.nom} className="overflow-hidden rounded-[1.5mm] border-[0.4mm] border-black bg-white">
                  <SorollFocSvg
                    soroll={generaSoroll({ resposta, ...opcions, colorObjectiu: n.color, colorsSoroll: colorsBlaus(pr.pesos), pasPunts: PAS_PUNTS_OBJECTIU / Math.sqrt(DENSITAT_PUNTS) })}
                    className="block h-auto w-full"
                    objectiuDamunt
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

// Pàgina molt gran en HTML: no es prerenderitza, perquè Vercel no la pot servir com a ISR.
export const dynamic = "force-dynamic";
