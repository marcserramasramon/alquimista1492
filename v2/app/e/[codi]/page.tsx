"use client";

import { useParams } from "next/navigation";
import { EntradaEquip } from "@/components/player/EntradaEquip";

/** Destí del QR d'equip: preomple el codi perquè només calgui confirmar. */
export default function EntradaPerQRPage() {
  const params = useParams();
  const codi = (params.codi as string)?.toUpperCase().slice(0, 6) ?? "";
  return <EntradaEquip codiInicial={codi} />;
}
