import { getSolucio } from "@/content/private/solucions";
import { generaSoroll, opcionsSoroll, PAS_PUNTS_OBJECTIU } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";
import { colorsBlaus, NUMEROS_INVERTITS, DENSITAT_SOROLL_INVERTIT } from "../cartell-foc-proves/dades";

/**
 * Només les imatges del cartell de Foc (sense el format final), del número groc a sobre del soroll blau 3:2:1 al 333%,
 * una sota l'altra a mida real (168 mm d'ample, 2 per pàgina). Primer totes les combinacions de radi i densitat amb la
 * font normal, i després les mateixes amb el número en negreta (scripts/cartell-foc-proves-pdf.mjs imatges).
 * Porta el número real: com tot /pantalles, és un 404 en producció.
 */
const SOROLL_PESOS = [3, 2, 1];

/** Radi dels punts i densitat de la trama. Les 6 primeres són les que ja s'han fet; la resta, variacions. */
const COMBINACIONS = [
  { radi: 2.7, densitat: 0.66 },
  { radi: 2.7, densitat: 0.33 },
  { radi: 4.05, densitat: 0.13 },
  { radi: 3.95, densitat: 0.15 },
  { radi: 3.95, densitat: 0.2 },
  { radi: 4.1, densitat: 0.15 },
  { radi: 3.5, densitat: 0.2 },
  { radi: 3.5, densitat: 0.25 },
  { radi: 3.5, densitat: 0.33 },
  { radi: 3.95, densitat: 0.25 },
  { radi: 3.95, densitat: 0.3 },
  { radi: 4.1, densitat: 0.2 },
  { radi: 4.1, densitat: 0.25 },
  { radi: 4.4, densitat: 0.13 },
  { radi: 4.4, densitat: 0.15 },
  { radi: 4.4, densitat: 0.2 },
  { radi: 4.8, densitat: 0.1 },
  { radi: 4.8, densitat: 0.15 },
];

export default function CartellFocImatgesPage() {
  const resposta = getSolucio("foc")?.respostesAcceptades[0];
  if (!resposta) throw new Error("Falta la solució de Foc.");
  const groc = NUMEROS_INVERTITS.find((n) => n.nom === "Groc")!;
  const opcions = opcionsSoroll("imatge");
  opcions.quantitat = Math.round(opcions.quantitat * DENSITAT_SOROLL_INVERTIT);

  const imatges = [false, true].flatMap((negreta) =>
    COMBINACIONS.map((c, i) => ({
      negreta,
      num: i + 1,
      ...c,
      soroll: generaSoroll({
        resposta,
        ...opcions,
        colorObjectiu: groc.color,
        colorsSoroll: colorsBlaus(SOROLL_PESOS),
        pasPunts: PAS_PUNTS_OBJECTIU / Math.sqrt(c.densitat),
        radiPunts: c.radi,
      }),
    })),
  );
  const pagines = Array.from({ length: Math.ceil(imatges.length / 2) }, (_, i) => imatges.slice(i * 2, i * 2 + 2));

  return (
    <>
      <style>{`
        @page { size: A4; margin: 0; }
        .pagina-imatges { break-after: page; }
        main.pagina-imatges:last-of-type { break-after: auto; }
        @media print { html, body { background: none !important; } }
      `}</style>
      {pagines.map((par, i) => (
        <main key={i} className="pagina-imatges mx-auto flex h-[297mm] w-[210mm] flex-col items-center justify-center gap-[10mm] overflow-hidden bg-white">
          {par.map((im) => (
            <figure key={`${im.negreta}-${im.num}`} className="w-[168mm]">
              <figcaption className="mb-[1.5mm] font-mono text-[8pt]">
                {im.negreta ? "Negreta" : "Normal"} · {im.num} · groc {groc.color} · radi {im.radi} · densitat {Math.round(im.densitat * 100)}%
              </figcaption>
              <SorollFocSvg soroll={im.soroll} className="block h-auto w-full" objectiuDamunt negreta={im.negreta} />
            </figure>
          ))}
        </main>
      ))}
    </>
  );
}
