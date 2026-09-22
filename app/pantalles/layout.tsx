import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Pantalles · galeria de desenvolupament",
  robots: { index: false, follow: false },
};

/**
 * Galeria de pantalles (/pantalles): eina interna de desenvolupament.
 * Renderitza les vistes reals de components/vistes/ amb dades d'exemple i, per
 * mostrar les pistes, llegeix content/private des del servidor. Per això no ha
 * d'existir mai en producció: en un build de producció tota la ruta és un 404.
 */
export default function PantallesLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return children;
}
