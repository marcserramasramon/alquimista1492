import { notFound } from "next/navigation";
import { getPantalla } from "@/app/pantalles/pantalles";
import { RenderPantalla } from "@/app/pantalles/vista/[id]/RenderPantalla";

/**
 * Vistes de «fita completada» (fragment, vídeo i celebració de l'estrella) a
 * pantalla completa, també en producció. A diferència de /pantalles, aquí NO es
 * llegeix content/private (dades buides) i només es serveixen les pantalles de la
 * llista blanca, que només fan servir contingut públic.
 */
const PERMESES = /^(fita-[a-z-]+-(resolta|video)|hub-(celebracio-estrella|totes-resoltes|cor-estrella))$/;

export default async function VistaPublicaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!PERMESES.test(id) || !getPantalla(id)) notFound();
  return <RenderPantalla id={id} dades={{ fites: {} }} />;
}
