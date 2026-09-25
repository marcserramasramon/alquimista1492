import Link from "next/link";
import { BotoMusica } from "@/components/ui/BotoMusica";
import { Narracio } from "@/components/ui/Narracio";
import { Marca } from "@/components/ui/Pantalla";
import { MARGE_MARC_FINAL_PX, MarcFinal } from "@/components/ui/MarcFinal";
import { GUARDIANS, LABORATORI } from "@/content/public/textos";

/** Pergamí més fosc que la resta de pantalles per al marc: és el final de la nit. */
const FONS = "#d9bd84";
/** Dins del marc, negre sòlid: la Pedra hi brilla. */
const FONS_CENTRAL = "#000";

/**
 * 5. Pantalla final: l'equip esdevé Guardians del Secret i obté la Pedra Filosofal. Surt a /final
 * quan el LED del Gresol s'ha encès i Fra Francesc consagra l'equip des del màster.
 * Sona música èpica en bucle (public/audio/guardians.mp3 o, si no hi és, la sintetitzada de lib/so.ts).
 * Com les pantalles del Pla de Masset, té el marc de runes; al final, l'enllaç al laboratori (/gresol).
 */
export function VistaGuardians() {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0"
        style={{ background: FONS_CENTRAL }}
      />
      <MarcFinal fons={FONS} />
      <main
        className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5"
        style={{
          paddingTop: `calc(env(safe-area-inset-top) + ${MARGE_MARC_FINAL_PX}px)`,
          paddingBottom: `calc(env(safe-area-inset-bottom) + ${MARGE_MARC_FINAL_PX + 16}px)`,
          paddingLeft: MARGE_MARC_FINAL_PX,
          paddingRight: MARGE_MARC_FINAL_PX,
        }}
      >
        <BotoMusica className="self-end" />
        {/* Pedra a la mateixa mida que el pentagrama del Pla del Masset (VistaFinal). */}
        <img
          src="/images/pedra-filosofal.webp"
          alt="La Pedra Filosofal"
          className="mx-auto w-64 max-w-full animate-segellar drop-shadow-[0_0_20px_rgb(234_179_8/0.55)]"
        />
        <div className="animate-entrar [animation-delay:200ms]">
          <Marca petita sobreFosc />
        </div>
        <Narracio text={GUARDIANS} className="animate-entrar [animation-delay:350ms]">
          <div className="mt-5 border-t-2 border-dashed border-ink/20 pt-4 text-center">
            <p className="font-display text-lg font-extrabold italic">{GUARDIANS.lema}</p>
            <p className="mt-1 text-base text-ink-soft">{GUARDIANS.traduccioLema}</p>
          </div>
        </Narracio>

        {/* El joc amagat (ou de pasqua): ara que són alquimistes, tenen el seu propi laboratori. */}
        <section className="flex animate-entrar flex-col gap-3 text-center [animation-delay:500ms]">
          <p className="text-lg font-bold text-paper">{LABORATORI.frase}</p>
          <Link href="/gresol" className="btn btn-primari">
            ⚗️ {LABORATORI.boto}
          </Link>
        </section>
      </main>
    </>
  );
}
