import { getSolucio } from "@/content/private/solucions";
import { generaSoroll, opcionsSoroll, PAS_PUNTS_OBJECTIU } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";
import { BLAU_FORT, BLAU_MIG, BLAU_CLAR, colorsBlaus, NUMEROS_INVERTITS, DENSITAT_SOROLL_INVERTIT } from "../cartell-foc-proves/dades";

/**
 * Prova de densitat i mida dels punts del número secret, amb els colors invertits (número taronja o groc a sobre,
 * soroll en 3 blaus 3:2:1 al 333%). Una pàgina A4 apaïsada per color del número; files = densitat de la trama,
 * columnes = radi dels punts (scripts/cartell-foc-proves-pdf.mjs punts).
 * Porta el número real: com tot /pantalles, és un 404 en producció.
 */
const DENSITATS = [0.33, 0.66, 1];
const RADIS = [2.7, 3.6, 4.5];
const SOROLL_PESOS = [3, 2, 1];

export default function CartellFocPuntsPage() {
  const resposta = getSolucio("foc")?.respostesAcceptades[0];
  if (!resposta) throw new Error("Falta la solució de Foc.");
  const opcions = opcionsSoroll("imatge");
  opcions.quantitat = Math.round(opcions.quantitat * DENSITAT_SOROLL_INVERTIT);

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        .pagina-punts { break-after: page; }
        main.pagina-punts:last-of-type { break-after: auto; }
        @media print { html, body { background: none !important; } }
      `}</style>
      {NUMEROS_INVERTITS.map((n) => (
        <main key={n.color} className="pagina-punts mx-auto flex h-[210mm] w-[297mm] flex-col gap-[3mm] overflow-hidden bg-white p-[8mm]">
          <h1 className="text-center text-[14pt] font-extrabold">
            Punts del número · {n.nom} {n.color} · soroll blau 3:2:1
          </h1>
          <p className="text-center font-mono text-[8pt]">
            Soroll: {BLAU_FORT} (fort) · {BLAU_MIG} (mig) · {BLAU_CLAR} (clar) · files: densitat · columnes: radi
          </p>
          <div className="grid grid-cols-[22mm_1fr_1fr_1fr] content-start gap-x-[3mm] gap-y-[3mm]">
            <div />
            {RADIS.map((r) => (
              <p key={r} className="text-center font-mono text-[10pt]">
                Radi {r}
              </p>
            ))}
            {DENSITATS.map((d) => (
              <div key={d} className="contents">
                <p className="self-center font-mono text-[9pt] leading-tight">
                  Densitat
                  <br />
                  {Math.round(d * 100)}%
                </p>
                {RADIS.map((r) => (
                  <div key={r} className="overflow-hidden rounded-[1.5mm] border-[0.4mm] border-black bg-white">
                    <SorollFocSvg
                      soroll={generaSoroll({
                        resposta,
                        ...opcions,
                        colorObjectiu: n.color,
                        colorsSoroll: colorsBlaus(SOROLL_PESOS),
                        pasPunts: PAS_PUNTS_OBJECTIU / Math.sqrt(d),
                        radiPunts: r,
                      })}
                      className="block h-auto w-full"
                      objectiuDamunt
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </main>
      ))}
    </>
  );
}

// Pàgina molt gran en HTML: no es prerenderitza, perquè Vercel no la pot servir com a ISR.
export const dynamic = "force-dynamic";
