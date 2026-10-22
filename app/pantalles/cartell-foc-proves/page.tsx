import { getEstacionsOrdenades } from "@/content/public/estacions";
import { POEMES_CARTELLS } from "@/content/public/cartells";
import { CODIS_FITES } from "@/content/private/codisFites";
import { getSolucio } from "@/content/private/solucions";
import { qrSvg } from "@/lib/qr";
import { generaSoroll, opcionsSoroll, type Soroll } from "@/lib/sorollFoc";
import { BLAUS, PROPORCIONS, TARONJA_FOSC, TARONJA_CLAR, GROC, colorsDe } from "./dades";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";
import { VistaCartells, type DadesCartell } from "@/components/vistes/VistaCartells";

/**
 * Prova de colors del cartell de Foc, per imprimir (scripts/cartell-foc-proves-pdf.mjs la porta a PDF):
 *  - pàgina 1: el número secret en 3 blaus;
 *  - pàgina 2: el soroll en tons taronja/groc amb 3 proporcions;
 *  - pàgines 3-11: el cartell de Foc amb cada combinació (blau × proporció).
 * Porta el número real: com tot /pantalles, és un 404 en producció.
 */

const PAGINA = "relative flex flex-col items-center gap-[3mm] bg-white p-[12mm]";

export default async function CartellFocProvesPage() {
  const est = getEstacionsOrdenades().find((e) => e.id === "foc");
  const resposta = getSolucio("foc")?.respostesAcceptades[0];
  const poema = POEMES_CARTELLS.foc;
  const codi = CODIS_FITES.foc;
  if (!est || !est.element || !resposta || !poema || !codi) throw new Error("Falta la fita de Foc.");

  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const qr = await qrSvg(`${base}/s/${est.id}?c=${codi}`);
  const opcions = opcionsSoroll("imatge");

  // Pàgina 1: només el número (cap peça de soroll).
  const nomesNumero = (color: string): Soroll => {
    const s = generaSoroll({ resposta, ...opcions, colorObjectiu: color });
    return { ...s, peces: s.peces.filter((p) => p.objectiu) };
  };
  // Pàgina 2: només el soroll (sense número ni trama).
  const nomesSoroll = (pesos: number[]): Soroll => {
    const s = generaSoroll({ resposta, ...opcions, colorsSoroll: colorsDe(pesos) });
    return { ...s, peces: s.peces.filter((p) => !p.objectiu), puntsObjectiu: [] };
  };

  const cartells: DadesCartell[] = BLAUS.flatMap((b) =>
    PROPORCIONS.map((pr) => ({
      id: `foc-${b.color.slice(1)}-${pr.nom.replaceAll(":", "")}`,
      nom: est.nom,
      element: est.element!,
      poema,
      codi,
      qrSvg: qr,
      soroll: generaSoroll({ resposta, ...opcions, colorObjectiu: b.color, colorsSoroll: colorsDe(pr.pesos) }),
    })),
  );

  return (
    <>
      <style>{`
        @page { size: A4; margin: 0; }
        .pagina-prova { width: 210mm; height: 297mm; margin: 0 auto; overflow: hidden; }
        @media print {
          html, body { background: none !important; }
          .pagina-prova { break-after: page; }
          .vista-cartells .cartell:last-of-type { break-after: auto; }
        }
      `}</style>

      <section className={`pagina-prova ${PAGINA}`}>
        <h1 className="text-[22pt] font-extrabold">Número secret · 3 blaus</h1>
        {BLAUS.map((b) => (
          <figure key={b.color} className="w-[118mm]">
            <figcaption className="mb-[1mm] font-mono text-[11pt]">
              {b.nom} · {b.color}
            </figcaption>
            <div className="overflow-hidden rounded-[2mm] border-[0.5mm] border-black bg-white">
              <SorollFocSvg soroll={nomesNumero(b.color)} className="block h-auto w-full" />
            </div>
          </figure>
        ))}
      </section>

      <section className={`pagina-prova ${PAGINA}`}>
        <h1 className="text-[22pt] font-extrabold">Interferències · taronja fosc : taronja clar : groc</h1>
        <p className="font-mono text-[10pt]">
          {TARONJA_FOSC} · {TARONJA_CLAR} · {GROC}
        </p>
        {PROPORCIONS.map((pr) => (
          <figure key={pr.nom} className="w-[118mm]">
            <figcaption className="mb-[1mm] font-mono text-[11pt]">Proporció {pr.nom}</figcaption>
            <div className="overflow-hidden rounded-[2mm] border-[0.5mm] border-black bg-white">
              <SorollFocSvg soroll={nomesSoroll(pr.pesos)} className="block h-auto w-full" />
            </div>
          </figure>
        ))}
        <p className="mt-auto w-full text-[9pt] leading-snug">
          Pàgines 3-5: blau «{BLAUS[0].nom}» amb {PROPORCIONS.map((p) => p.nom).join(", ")}. Pàgines 6-8: «{BLAUS[1].nom}» amb{" "}
          {PROPORCIONS.map((p) => p.nom).join(", ")}. Pàgines 9-11: «{BLAUS[2].nom}» amb {PROPORCIONS.map((p) => p.nom).join(", ")}.
        </p>
      </section>

      <VistaCartells cartells={cartells} />
    </>
  );
}
