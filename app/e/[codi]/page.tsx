import { redirect } from "next/navigation";
import { getEquipSessionFromCookies } from "@/lib/auth";
import { SeleccioEquip } from "@/components/player/SeleccioEquip";

/** Entrada directa des del QR de l'equip: el codi és a la URL i s'entra sol. */
export default async function EntradaEquipPage({ params }: { params: Promise<{ codi: string }> }) {
  if (await getEquipSessionFromCookies()) redirect("/espera");
  const { codi } = await params;
  return <SeleccioEquip codiInicial={codi} />;
}
