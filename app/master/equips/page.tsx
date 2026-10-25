import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMasterSessionFromCookies } from "@/lib/auth";
import { codisEquips } from "@/lib/codiEquip";
import { qrSvg } from "@/lib/qr";
import { EQUIPS } from "@/content/public/equips";
import { VistaMasterCodisEquips } from "@/components/vistes/VistaMasterCodisEquips";

/** Els QR i els codis de tots els equips, per imprimir-los i donar-los als jugadors. */
export default async function CodisEquipsPage() {
  if (!(await getMasterSessionFromCookies())) redirect("/master/login");

  const capcalera = await headers();
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? `${capcalera.get("x-forwarded-proto") ?? "https"}://${capcalera.get("host")}`).replace(/\/$/, "");

  const cartells = await Promise.all(
    codisEquips().map(async ({ equip, codi }) => ({
      nom: EQUIPS.find((e) => e.id === equip)?.nom ?? equip,
      codi,
      svg: await qrSvg(`${base}/e/${codi}`),
    }))
  );

  return <VistaMasterCodisEquips cartells={cartells} />;
}
