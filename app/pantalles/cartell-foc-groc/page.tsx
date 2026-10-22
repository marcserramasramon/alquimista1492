import { getSolucio } from "@/content/private/solucions";
import { generaSoroll, opcionsSoroll } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";
import { BLAU_FORT, BLAU_MIG, BLAU_CLAR, GROC, colorsBlaus, DENSITAT_SOROLL_INVERTIT } from "../cartell-foc-proves/dades";

/**
 * Colors invertits amb el número secret groc, a sobre d'un soroll en 3 blaus (333%). Una pàgina A4 apaïsada
 * per proporció del soroll (blau fort : mig : clar); files = densitat de la trama (la del principi i el 50%),
 * columnes = radi dels punts (normal, gran i molt gran) (scripts/cartell-foc-proves-pdf.mjs groc).
 * Porta el número real: com tot /pantalles, és un 404 en producció.
 */
const PROPORCIONS_SOROLL = [
  { nom: "3:2:1", pesos: [3, 2, 1] },
  { nom: "3:1:1", pesos: [3, 1, 1] },
  { nom: "2:2:1", pesos: [2, 2, 1] },
];

/** Separació de la trama del principi (9) i la del 50% de densitat d'aquella (9 · √2). */
const PAS_PRINCIPI = 9;
const DENSITATS = [
  { nom: "Densitat del principi", pas: PAS_PRINCIPI },
  { nom: "50% de la del principi", pas: PAS_PRINCIPI * Math.SQRT2 },
];

const RADIS = [
  { nom: "Normal", radi: 2.7 },
  { nom: "Gran", radi: 3.6 },
  { nom: "Molt gran", radi: 4.5 },
];

export default function CartellFocGrocPage() {
  const resposta = getSolucio("foc")?.respostesAcceptades[0];
  if (!resposta) throw new Error("Falta la solució de Foc.");
  const opcions = opcionsSoroll("imatge");
  opcions.quantitat = Math.round(opcions.quantitat * DENSITAT_SOROLL_INVERTIT);

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        .pagina-groc { break-after: page; }
        main.pagina-groc:last-of-type { break-after: auto; }
        @media print { html, body { background: none !important; } }
      `}</style>
      {PROPORCIONS_SOROLL.map((pr) => (
        <main key={pr.nom} className="pagina-groc mx-auto flex h-[210mm] w-[297mm] flex-col gap-[3mm] overflow-hidden bg-white p-[8mm]">
          <h1 className="text-center text-[14pt] font-extrabold">Número groc {GROC} · soroll blau {pr.nom}</h1>
          <p className="text-center font-mono text-[8pt]">
            Soroll: {BLAU_FORT} (fort) · {BLAU_MIG} (mig) · {BLAU_CLAR} (clar) · files: densitat · columnes: mida del punt
          </p>
          <div className="grid grid-cols-[26mm_1fr_1fr_1fr] content-start gap-x-[3mm] gap-y-[5mm]">
            <div />
            {RADIS.map((r) => (
              <p key={r.nom} className="text-center font-mono text-[10pt]">
                {r.nom} (radi {r.radi})
              </p>
            ))}
            {DENSITATS.map((d) => (
              <div key={d.nom} className="contents">
                <p className="self-center font-mono text-[9pt] leading-tight">
                  {d.nom}
                  <br />
                  pas {d.pas.toFixed(1)}
                </p>
                {RADIS.map((r) => (
                  <div key={r.nom} className="overflow-hidden rounded-[1.5mm] border-[0.4mm] border-black bg-white">
                    <SorollFocSvg
                      soroll={generaSoroll({
                        resposta,
                        ...opcions,
                        colorObjectiu: GROC,
                        colorsSoroll: colorsBlaus(pr.pesos),
                        pasPunts: d.pas,
                        radiPunts: r.radi,
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
