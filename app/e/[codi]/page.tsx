import { Benvinguda } from "@/components/player/Benvinguda";

/** Destí del QR d'equip: mostra la benvinguda i passa el codi a l'entrada perquè només calgui confirmar. */
export default async function EntradaPerQRPage({ params }: { params: Promise<{ codi: string }> }) {
  const { codi } = await params;
  let codiDescodificat = codi ?? "";
  try {
    codiDescodificat = decodeURIComponent(codiDescodificat);
  } catch {
    // URL mal formada (p.ex. "%"): es fa servir tal com ve.
  }
  const codiNet = codiDescodificat.toUpperCase().slice(0, 6);
  return <Benvinguda codi={codiNet || undefined} />;
}
