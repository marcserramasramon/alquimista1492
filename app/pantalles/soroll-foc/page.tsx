import { ProvaSorollFoc } from "./ProvaSorollFoc";

/**
 * Pàgina de desenvolupament amb sliders per calibrar el soroll del cartell de
 * Foc (lib/sorollFoc.ts) abans d'imprimir-lo. Hereta el layout de /pantalles,
 * així que en producció és un 404.
 */
export default function SorollFocPage() {
  return <ProvaSorollFoc />;
}
