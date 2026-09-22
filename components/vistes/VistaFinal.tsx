import { Narracio } from "@/components/ui/Narracio";
import { Pentagrama, type NodePentagrama } from "@/components/ui/Pentagrama";
import { Pantalla } from "@/components/ui/Pantalla";
import { GRESOL_ARRIBADA, GRESOL_RITUAL } from "@/content/public/textos";

const TOTS: NodePentagrama[] = (["aigua", "terra", "foc", "aire", "anima"] as const).map((element) => ({
  id: element,
  element,
  resolt: true,
  disponible: true,
}));

export interface VistaFinalProps {
  /** false: esperant Fra Francesc (4a). true: el ritual (4b). */
  ritual: boolean;
  onComencarRitual: () => void;
}

/**
 * Pla de Masset. Primer l'espera (sense espòilers del desemmascarament) i, quan Fra Francesc
 * els ho indica, el ritual. Com es passa d'una part a l'altra, l'ordre dels elements i el
 * resultat del Gresol són PENDENT (docs/fites-nova.md § Estació central): de moment ho fa
 * l'equip amb un botó.
 */
export function VistaFinal({ ritual, onComencarRitual }: VistaFinalProps) {
  return (
    <Pantalla className="gap-5">
      <Pentagrama nodes={TOTS} centreActiu girar className="mx-auto w-64 max-w-full animate-segellar" />
      <p className="etiqueta animate-entrar text-center text-gold-deep">pla de masset</p>
      {ritual ? (
        <Narracio key="ritual" text={GRESOL_RITUAL} className="animate-entrar" />
      ) : (
        <>
          <Narracio key="arribada" text={GRESOL_ARRIBADA} className="animate-entrar [animation-delay:300ms]" />
          <button
            type="button"
            onClick={onComencarRitual}
            className="btn btn-fosc animate-entrar [animation-delay:450ms]"
          >
            ⚗️ Comencem el ritual
          </button>
        </>
      )}
    </Pantalla>
  );
}
