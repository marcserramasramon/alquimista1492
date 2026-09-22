import { EntradaEquip } from "@/components/player/EntradaEquip";

/** Entrada del codi d'equip. Accepta ?codi=XXXXXX (ve del QR d'equip via la benvinguda). */
export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { codi } = await searchParams;
  const codiInicial = (typeof codi === "string" ? codi : "").toUpperCase().slice(0, 6);
  return <EntradaEquip codiInicial={codiInicial} />;
}
