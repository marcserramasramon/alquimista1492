import { redirect } from "next/navigation";
import { getMasterSessionFromCookies } from "@/lib/auth";
import { getEstacionsOrdenades } from "@/content/public/estacions";
import { POEMES_CARTELLS } from "@/content/public/cartells";
import { CODIS_FITES } from "@/content/private/codisFites";
import { getSolucio } from "@/content/private/solucions";
import { qrSvg } from "@/lib/qr";
import { generaSoroll, opcionsSoroll } from "@/lib/sorollFoc";
import { VistaCartells, type DadesCartell } from "@/components/vistes/VistaCartells";

/**
 * Cartells físics per imprimir. Porten el codi de cada fita i el número del
 * Foc, per això només els veu el màster.
 * `?llavor=N` genera una altra composició de soroll per al cartell de Foc.
 * `?estil=fons` posa la il·lustració vertical de fons a tot el full.
 * `?estil=propaganda` fa els cartells per anunciar el joc: sense QR, codi ni soroll.
 * `?estil=lema` és igual, però amb una sola frase per element en lloc del text.
 */
export default async function CartellsPage({ searchParams }: { searchParams: Promise<{ llavor?: string; estil?: string }> }) {
  if (!(await getMasterSessionFromCookies())) redirect("/master/login");

  const { llavor, estil } = await searchParams;
  const llavorNum = Number.parseInt(llavor ?? "", 10);
  const estilCartell = estil === "fons" || estil === "propaganda" || estil === "lema" ? estil : "imatge";
  const propaganda = estilCartell === "propaganda" || estilCartell === "lema";
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  const cartells: DadesCartell[] = [];
  for (const e of getEstacionsOrdenades()) {
    const codi = CODIS_FITES[e.id];
    const poema = POEMES_CARTELLS[e.id];
    if (!codi || !poema || !e.element) continue;

    const resposta = e.element === "foc" && !propaganda ? getSolucio(e.id)?.respostesAcceptades[0] : undefined;
    cartells.push({
      id: e.id,
      nom: e.nom,
      element: e.element,
      poema,
      // Els de propaganda no porten res que obri la fita.
      codi: propaganda ? "" : codi,
      qrSvg: propaganda ? undefined : await qrSvg(`${base}/s/${e.id}?c=${codi}`),
      soroll: resposta
        ? generaSoroll({ resposta, ...opcionsSoroll(estilCartell === "fons" ? "fons" : "imatge"), ...(Number.isFinite(llavorNum) ? { llavor: llavorNum } : {}) })
        : undefined,
    });
  }

  return <VistaCartells cartells={cartells} estil={estilCartell} />;
}
