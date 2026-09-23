import { BotoMusica } from "@/components/ui/BotoMusica";
import { Narracio } from "@/components/ui/Narracio";
import { Marca, Pantalla } from "@/components/ui/Pantalla";
import { GUARDIANS } from "@/content/public/textos";

/**
 * 5. Pantalla final: l'equip esdevé Guardians del Secret i obté la Pedra Filosofal. Com s'hi
 * arriba depèn del resultat del Gresol (PENDENT a docs/fites-nova.md), així que encara no té ruta.
 * Sona música èpica en bucle (public/audio/guardians.mp3 o, si no hi és, la sintetitzada de lib/so.ts).
 */
export function VistaGuardians() {
  return (
    <Pantalla className="gap-5">
      <BotoMusica className="self-end" />
      {/* Pedra a la mateixa mida que el pentagrama del Pla de Masset (VistaFinal). */}
      <img
        src="/images/pedra-filosofal.webp"
        alt="La Pedra Filosofal"
        className="mx-auto w-64 max-w-full animate-segellar drop-shadow-[0_0_20px_rgb(234_179_8/0.55)]"
      />
      <div className="animate-entrar [animation-delay:200ms]">
        <Marca petita />
      </div>
      <Narracio text={GUARDIANS} className="animate-entrar [animation-delay:350ms]">
        <div className="mt-5 border-t-2 border-dashed border-ink/20 pt-4 text-center">
          <p className="font-display text-lg font-extrabold italic">{GUARDIANS.lema}</p>
          <p className="mt-1 text-base text-ink-soft">{GUARDIANS.traduccioLema}</p>
        </div>
      </Narracio>
    </Pantalla>
  );
}
