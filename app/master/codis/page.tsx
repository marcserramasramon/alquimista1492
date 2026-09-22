import { redirect } from "next/navigation";
import { getMasterSessionFromCookies } from "@/lib/auth";
import { getEstacionsOrdenades } from "@/content/public/estacions";
import { CODIS_FITES } from "@/content/private/codisFites";
import { VistaMasterCodis } from "@/components/vistes/VistaMasterCodis";

export default async function CodisPage() {
  if (!(await getMasterSessionFromCookies())) redirect("/master/login");

  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const fites = getEstacionsOrdenades()
    .filter((e) => CODIS_FITES[e.id])
    .map((e) => ({
      id: e.id,
      nom: e.nom,
      element: e.element,
      codi: CODIS_FITES[e.id],
      url: `${base}/s/${e.id}?c=${CODIS_FITES[e.id]}`,
    }));

  return <VistaMasterCodis fites={fites} />;
}
