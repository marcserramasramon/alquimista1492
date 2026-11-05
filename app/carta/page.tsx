import { redirect } from "next/navigation";
import { getEquipSessionFromCookies } from "@/lib/auth";
import { ProvaCarta } from "@/components/player/ProvaCarta";

/** La prova de la carta: comprova el telèfon després del consentiment d'ubicació i abans de triar equip. */
export default async function CartaPage() {
  if (await getEquipSessionFromCookies()) redirect("/espera");
  return <ProvaCarta />;
}
