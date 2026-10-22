import { getSolucio } from "@/content/private/solucions";
import { generaSoroll, opcionsSoroll, PAS_PUNTS_OBJECTIU } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";
import { colorsBlaus, NUMEROS_INVERTITS, DENSITAT_SOROLL_INVERTIT } from "../cartell-foc-proves/dades";

/**
 * Només les imatges del cartell de Foc, número groc (font normal) a sobre del soroll blau 3:2:1 al 333%, amb la trama
 * de triangles orientats a l'atzar (el radi és el del cercle que els circumscriu), a mida real, 2 per pàgina
 * (scripts/cartell-foc-proves-pdf.mjs triangles). Combinacions de densitat i radi a RADIS i DENSITATS.
 * Porta el número real: com tot /pantalles, és un 404 en producció.
 */
const RADIS = [4, 4.5];
const DENSITATS = [0.3, 0.4];
const SOROLL_PESOS = [3, 2, 1];

export default function CartellFocTrianglesPage() {
  const resposta = getSolucio("foc")?.respostesAcceptades[0];
  if (!resposta) throw new Error("Falta la solució de Foc.");
  const groc = NUMEROS_INVERTITS.find((n) => n.nom === "Groc")!;
  const opcions = opcionsSoroll("imatge");
  opcions.quantitat = Math.round(opcions.quantitat * DENSITAT_SOROLL_INVERTIT);

  const imatges = DENSITATS.flatMap((densitat) =>
    RADIS.map((radi) => ({
      radi,
      densitat,
      soroll: generaSoroll({
        resposta,
        ...opcions,
        colorObjectiu: groc.color,
        colorsSoroll: colorsBlaus(SOROLL_PESOS),
        pasPunts: PAS_PUNTS_OBJECTIU / Math.sqrt(densitat),
        radiPunts: radi,
        triangles: true,
      }),
    })),
  );
  const pagines = Array.from({ length: Math.ceil(imatges.length / 2) }, (_, i) => imatges.slice(i * 2, i * 2 + 2));

  return (
    <>
      <style>{`
        @page { size: A4; margin: 0; }
        .pagina-triangles { break-after: page; }
        main.pagina-triangles:last-of-type { break-after: auto; }
        @media print { html, body { background: none !important; } }
      `}</style>
      {pagines.map((par, i) => (
        <main key={i} className="pagina-triangles mx-auto flex h-[297mm] w-[210mm] flex-col items-center justify-center gap-[10mm] overflow-hidden bg-white">
          {par.map((im) => (
            <figure key={`${im.radi}-${im.densitat}`} className="w-[168mm]">
              <figcaption className="mb-[1.5mm] font-mono text-[8pt]">
                Triangles · normal · groc {groc.color} · radi {im.radi} · densitat {Math.round(im.densitat * 100)}%
              </figcaption>
              <SorollFocSvg soroll={im.soroll} className="block h-auto w-full" objectiuDamunt />
            </figure>
          ))}
        </main>
      ))}
    </>
  );
}

// Pàgina molt gran en HTML: no es prerenderitza, perquè Vercel no la pot servir com a ISR.
export const dynamic = "force-dynamic";
