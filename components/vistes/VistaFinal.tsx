import { Pentagrama, type NodePentagrama } from "@/components/ui/Pentagrama";
import { Pantalla } from "@/components/ui/Pantalla";

const TOTS: NodePentagrama[] = (["aigua", "terra", "foc", "aire", "anima"] as const).map((element) => ({
  id: element,
  element,
  resolt: true,
  disponible: true,
}));

export function VistaFinal() {
  // Ritual del Gresol dels Cinc Elements: ordre dels elements i codi final PENDENT
  // (docs/fites-nova.md § Estació central). Placeholder fins que es tanqui.
  return (
    <Pantalla centrat className="items-center gap-6 text-center">
      <Pentagrama nodes={TOTS} centreActiu girar className="w-72 max-w-full animate-segellar" />
      <div className="animate-entrar [animation-delay:300ms]">
        <p className="etiqueta text-gold-deep">pla de masset</p>
        <h1 className="text-6xl font-extrabold">El Gresol dels Cinc Elements</h1>
      </div>
      <p className="animate-entrar text-xl [animation-delay:450ms]">
        Aneu al Pla de Masset amb els cinc fragments. El ritual comença allà.
      </p>
    </Pantalla>
  );
}
