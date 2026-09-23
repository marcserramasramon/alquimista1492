import type { Metadata } from "next";
import { Alquimia } from "@/components/player/Alquimia";
import { ELEMENTS_INICIALS } from "@/content/public/alquimia";
import { TOTAL_ELEMENTS } from "@/content/private/alquimia";

export const metadata: Metadata = {
  title: "El Gresol · Sentfores",
};

export default function GresolPage() {
  return <Alquimia inicials={ELEMENTS_INICIALS} total={TOTAL_ELEMENTS} />;
}
