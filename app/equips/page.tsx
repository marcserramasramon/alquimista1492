import { redirect } from "next/navigation";
import { getEquipSessionFromCookies } from "@/lib/auth";
import { SeleccioEquip } from "@/components/player/SeleccioEquip";

/** Les 8 icones d'equip (després del consentiment d'ubicació). */
export default async function EquipsPage() {
  if (await getEquipSessionFromCookies()) redirect("/espera");
  return <SeleccioEquip />;
}
