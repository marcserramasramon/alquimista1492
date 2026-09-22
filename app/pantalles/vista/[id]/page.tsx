import { notFound } from "next/navigation";
import { getEstacionsJugables } from "@/content/public/estacions";
import { getSolucio } from "@/content/private/solucions";
import { getPantalla, type DadesServidor } from "@/app/pantalles/pantalles";
import { RenderPantalla } from "./RenderPantalla";

/**
 * Una sola pantalla de la galeria, a pantalla completa i sense cap marc,
 * tal com la veuria el mòbil. La galeria (/pantalles) la carrega en un iframe.
 *
 * Només de desenvolupament (vegeu app/pantalles/layout.tsx): és l'únic lloc
 * on es llegeix content/private per passar pistes d'exemple a una vista.
 */
export default async function VistaPantallaPage({ params }: { params: Promise<{ id: string }> }) {
  // Defensa en profunditat: el layout ja fa 404 en producció, però aquí es
  // llegeix content/private i no volem dependre només del layout.
  if (process.env.NODE_ENV === "production") notFound();
  const { id } = await params;
  if (!getPantalla(id)) notFound();

  const dades: DadesServidor = { fites: {} };
  for (const estacio of getEstacionsJugables()) {
    const solucio = getSolucio(estacio.id);
    dades.fites[estacio.id] = {
      pista: solucio?.pistes[0] ?? null,
      resposta: solucio?.respostesAcceptades[0] ?? null,
    };
  }

  return <RenderPantalla id={id} dades={dades} />;
}
