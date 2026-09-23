import { LogoPentagrama } from "./LogoPentagrama";

/**
 * Pàgina de desenvolupament amb només el pentagrama, per exportar-lo com a
 * logo/icona de l'app dels jugadors (SVG i PNG). Hereta el layout de
 * /pantalles, així que en producció és un 404.
 */
export default function LogoPage() {
  return <LogoPentagrama />;
}
