import { redirect } from "next/navigation";
import { getEquipSessionFromCookies } from "@/lib/auth";
import { Benvinguda } from "@/components/player/Benvinguda";

export default async function HomePage() {
  // Si el mòbil ja té sessió d'equip, directe al hub.
  const sessio = await getEquipSessionFromCookies();
  if (sessio) redirect("/joc");
  return <Benvinguda />;
}
