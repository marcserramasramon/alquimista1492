import { redirect } from "next/navigation";
import { getEquipSessionFromCookies } from "@/lib/auth";
import { SalaEspera } from "@/components/player/SalaEspera";

/** Espera fins que el màster inicia la partida. */
export default async function EsperaPage() {
  if (!(await getEquipSessionFromCookies())) redirect("/equips");
  return <SalaEspera />;
}
