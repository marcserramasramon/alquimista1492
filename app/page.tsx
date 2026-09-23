import { redirect } from "next/navigation";
import { getEquipSessionFromCookies } from "@/lib/auth";
import { Benvinguda } from "@/components/player/Benvinguda";

export default async function HomePage() {
  // Si el mòbil ja té equip, directe al hub (que torna a l'espera si la partida no ha començat).
  const sessio = await getEquipSessionFromCookies();
  if (sessio) redirect("/joc");
  return <Benvinguda />;
}
