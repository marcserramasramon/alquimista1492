import { getSolucio } from "@/content/private/solucions";
import { generaSoroll, opcionsSoroll } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";
import { BLAUS, PROPORCIONS, colorsDe } from "../cartell-foc-proves/dades";

/**
 * Totes les combinacions de color del cartell de Foc en un sol full A4 apaïsat: una fila per blau del
 * número i una columna per proporció del soroll (scripts/cartell-foc-proves-pdf.mjs combinacions).
 * Porta el número real: com tot /pantalles, és un 404 en producció.
 */
export default function CartellFocCombinacionsPage() {
  const resposta = getSolucio("foc")?.respostesAcceptades[0];
  if (!resposta) throw new Error("Falta la solució de Foc.");
  const opcions = opcionsSoroll("imatge");

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print { html, body { background: none !important; } }
      `}</style>
      <main className="mx-auto flex h-[210mm] w-[297mm] flex-col gap-[3mm] overflow-hidden bg-white p-[8mm]">
        <h1 className="text-center text-[15pt] font-extrabold">Cartell de Foc · totes les combinacions</h1>
        <div className="grid flex-1 grid-cols-[22mm_1fr_1fr_1fr] content-start gap-x-[3mm] gap-y-[3mm]">
          <div />
          {PROPORCIONS.map((pr) => (
            <p key={pr.nom} className="text-center font-mono text-[10pt]">
              Soroll {pr.nom}
            </p>
          ))}
          {BLAUS.map((b) => (
            <div key={b.color} className="contents">
              <p className="self-center font-mono text-[8pt] leading-tight">
                {b.nom}
                <br />
                {b.color}
              </p>
              {PROPORCIONS.map((pr) => (
                <div key={pr.nom} className="overflow-hidden rounded-[1.5mm] border-[0.4mm] border-black bg-white">
                  <SorollFocSvg
                    soroll={generaSoroll({ resposta, ...opcions, colorObjectiu: b.color, colorsSoroll: colorsDe(pr.pesos) })}
                    className="block h-auto w-full"
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
