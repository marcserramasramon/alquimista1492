import { getSolucio } from "@/content/private/solucions";
import { generaSoroll, opcionsSoroll, PAS_PUNTS_OBJECTIU } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";
import { colorsBlaus, colorsDe, BLAUS, NUMEROS_INVERTITS, DENSITAT_SOROLL_INVERTIT } from "../cartell-foc-proves/dades";

/**
 * Només les imatges del cartell de Foc, número groc (font normal) a sobre del soroll blau 3:2:1 al 333%, a mida real.
 * Una pàgina per combinació (mida del punt, densitat) amb els punts rodons a dalt i els triangles (orientats a l'atzar,
 * radi del cercle circumscrit) a sota (scripts/cartell-foc-proves-pdf.mjs formes).
 * Porta el número real: com tot /pantalles, és un 404 en producció.
 */
const COMBINACIONS = [
  { radi: 2, densitat: 0.4 },
  { radi: 2, densitat: 0.5 },
  { radi: 3, densitat: 0.25 },
  { radi: 3, densitat: 0.33 },
  { radi: 4, densitat: 0.2 },
  { radi: 4, densitat: 0.25 },
  { radi: 4.4, densitat: 0.2 },
  { radi: 5, densitat: 0.15 },
  { radi: 5, densitat: 0.2 },
];
const SOROLL_PESOS = [3, 2, 1];

export default async function CartellFocFormesPage({ searchParams }: { searchParams: Promise<{ c?: string; inv?: string; mask?: string; rodons?: string }> }) {
  // `?c=5-20,4-25` tria només aquestes combinacions (mida-densitat en %); sense, les de COMBINACIONS.
  // `?inv=1` inverteix els colors: número blau fosc i soroll taronja fosc : taronja clar : groc (3:2:1).
  // `?mask=1`: el número només es pinta on s'encreua amb el soroll.
  // `?rodons=1`: només els punts rodons (2 combinacions per pàgina), sense els triangles.
  const { c: triades, inv, mask, rodons } = await searchParams;
  const invertit = inv === "1";
  const combinacions = triades
    ? triades.split(",").map((t) => {
        const [radi, densitat] = t.split("-").map(Number);
        return { radi, densitat: densitat / 100 };
      })
    : COMBINACIONS;

  const resposta = getSolucio("foc")?.respostesAcceptades[0];
  if (!resposta) throw new Error("Falta la solució de Foc.");
  const groc = NUMEROS_INVERTITS.find((n) => n.nom === "Groc")!;
  const colorNumero = invertit ? BLAUS[1].color : groc.color;
  const nomColor = invertit ? "blau fosc" : "groc";
  const opcions = opcionsSoroll("imatge");
  opcions.quantitat = Math.round(opcions.quantitat * DENSITAT_SOROLL_INVERTIT);

  const soroll = (c: { radi: number; densitat: number }, triangles: boolean) =>
    generaSoroll({
      resposta,
      ...opcions,
      colorObjectiu: colorNumero,
      colorsSoroll: invertit ? colorsDe(SOROLL_PESOS) : colorsBlaus(SOROLL_PESOS),
      pasPunts: PAS_PUNTS_OBJECTIU / Math.sqrt(c.densitat),
      radiPunts: c.radi,
      triangles,
    });

  // Una figura per forma i combinació; dues per pàgina.
  const figures = combinacions.flatMap((c) => (rodons === "1" ? [{ c, triangles: false }] : [{ c, triangles: false }, { c, triangles: true }]));
  const pagines = Array.from({ length: Math.ceil(figures.length / 2) }, (_, i) => figures.slice(i * 2, i * 2 + 2));

  return (
    <>
      <style>{`
        @page { size: A4; margin: 0; }
        .pagina-formes { break-after: page; }
        main.pagina-formes:last-of-type { break-after: auto; }
        .pagina-formes { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print { html, body { background: none !important; } }
      `}</style>
      {pagines.map((par, i) => (
        <main key={i} className="pagina-formes mx-auto flex h-[297mm] w-[210mm] flex-col items-center justify-center gap-[10mm] overflow-hidden pergami">
          {par.map(({ c, triangles }) => (
            <figure key={`${c.radi}-${c.densitat}-${triangles}`} className="w-[168mm]">
              <figcaption className="mb-[1.5mm] font-mono text-[8pt]">
                {triangles ? "Triangles" : "Rodons"} · {nomColor} {colorNumero} · mida {c.radi} · densitat {Math.round(c.densitat * 100)}%
              </figcaption>
              <SorollFocSvg soroll={soroll(c, triangles)} className="block h-auto w-full" objectiuDamunt nomesInterseccio={mask === "1"} />
            </figure>
          ))}
        </main>
      ))}
    </>
  );
}

// Pàgina molt gran en HTML: no es prerenderitza, perquè Vercel no la pot servir com a ISR.
export const dynamic = "force-dynamic";
