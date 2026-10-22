import { getEstacionsOrdenades } from "@/content/public/estacions";
import { POEMES_CARTELLS } from "@/content/public/cartells";
import { CODIS_FITES } from "@/content/private/codisFites";
import { getSolucio } from "@/content/private/solucions";
import { qrSvg } from "@/lib/qr";
import { generaSoroll, opcionsSoroll } from "@/lib/sorollFoc";
import { VistaCartells, type DadesCartell } from "@/components/vistes/VistaCartells";
import { colorsBlaus, NUMEROS_INVERTITS, DENSITAT_SOROLL_INVERTIT } from "../cartell-foc-proves/dades";
import { PAS_PUNTS_OBJECTIU } from "@/lib/sorollFoc";

/**
 * El cartell de Foc a mida real (A4) amb els colors invertits: número groc
 * a sobre d'un soroll en 3 blaus 3:2:1 al 333%, en dues versions de punts (veure VERSIONS)
 * (scripts/cartell-foc-proves-pdf.mjs real).
 * Porta el número real i el codi de la fita: com tot /pantalles, és un 404 en producció.
 */
/** Versions del cartell (una pàgina cadascuna): radi dels punts i densitat de la trama. */
const VERSIONS = [
  { radi: 3.95, densitat: 0.2 },
  { radi: 4.1, densitat: 0.15 },
];
const SOROLL_PESOS = [3, 2, 1];

export default async function CartellFocRealPage() {
  const est = getEstacionsOrdenades().find((e) => e.id === "foc");
  const resposta = getSolucio("foc")?.respostesAcceptades[0];
  const poema = POEMES_CARTELLS.foc;
  const codi = CODIS_FITES.foc;
  if (!est || !est.element || !resposta || !poema || !codi) throw new Error("Falta la fita de Foc.");

  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const qr = await qrSvg(`${base}/s/${est.id}?c=${codi}`);
  const opcions = opcionsSoroll("imatge");
  opcions.quantitat = Math.round(opcions.quantitat * DENSITAT_SOROLL_INVERTIT);

  const groc = NUMEROS_INVERTITS.find((n) => n.nom === "Groc")!;
  const cartells: DadesCartell[] = VERSIONS.map((v) => ({
    id: `foc-groc-r${v.radi}-d${Math.round(v.densitat * 100)}`,
    nom: est.nom,
    element: est.element!,
    poema,
    codi,
    qrSvg: qr,
    objectiuDamunt: true,
    soroll: generaSoroll({
      resposta,
      ...opcions,
      colorObjectiu: groc.color,
      colorsSoroll: colorsBlaus(SOROLL_PESOS),
      pasPunts: PAS_PUNTS_OBJECTIU / Math.sqrt(v.densitat),
      radiPunts: v.radi,
    }),
  }));

  return (
    <>
      <style>{`@media print { .vista-cartells .cartell:last-of-type { break-after: auto; } }`}</style>
      <VistaCartells cartells={cartells} />
    </>
  );
}
