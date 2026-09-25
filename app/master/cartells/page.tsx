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
 */
export default async function CartellsPage({ searchParams }: { searchParams: Promise<{ llavor?: string; estil?: string }> }) {
  if (!(await getMasterSessionFromCookies())) redirect("/master/login");

  const { llavor, estil } = await searchParams;
  const llavorNum = Number.parseInt(llavor ?? "", 10);
  const estilCartell = estil === "fons" ? "fons" : "imatge";
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  const cartells: DadesCartell[] = [];
  for (const e of getEstacionsOrdenades()) {
    const codi = CODIS_FITES[e.id];
    const poema = POEMES_CARTELLS[e.id];
    if (!codi || !poema || !e.element) continue;

    const resposta = e.element === "foc" ? getSolucio(e.id)?.respostesAcceptades[0] : undefined;
    cartells.push({
      id: e.id,
      nom: e.nom,
      element: e.element,
      poema,
      codi,
      qrSvg: await qrSvg(`${base}/s/${e.id}?c=${codi}`),
      soroll: resposta
        ? generaSoroll({ resposta, ...opcionsSoroll(estilCartell), ...(Number.isFinite(llavorNum) ? { llavor: llavorNum } : {}) })
        : undefined,
    });
  }

  return <VistaCartells cartells={cartells} estil={estilCartell} />;
}
