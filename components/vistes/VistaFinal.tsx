import { Narracio } from "@/components/ui/Narracio";
import { Pentagrama, type NodePentagrama } from "@/components/ui/Pentagrama";
import { MARGE_MARC_FINAL_PX, MarcFinal } from "@/components/ui/MarcFinal";
import type { Element } from "@/content/public/estacions";
import { GRESOL_CONFIG, type TransicioGresol } from "@/content/public/gresol";
import { GRESOL_ARRIBADA, GRESOL_BOTO_AR, GRESOL_BOTO_RITUAL, GRESOL_PASSOS, GRESOL_RITUAL } from "@/content/public/textos";

const TOTS_ELS_ELEMENTS: Element[] = ["aigua", "terra", "foc", "aire", "anima"];

export interface VistaFinalProps {
  /** false: esperant Fra Francesc (4a). true: el ritual (4b). Amb "una-pantalla" s'ignora. */
  ritual: boolean;
  onComencarRitual: () => void;
  /** Botó del ritual que obre l'AR de la Conjunció (només es mostra al ritual). */
  onComencarAr?: () => void;
  /** Botó ← de la capçalera, com a les fites. Si no hi és, no surt. */
  onTornar?: () => void;
  /** Per defecte, GRESOL_CONFIG (content/public/gresol.ts). La galeria els sobreescriu. */
  transicio?: TransicioGresol;
  /**
   * Elements que l'equip ha aconseguit. Al pentagrama només s'encenen aquests
   * (si s'ha acabat el temps abans de trobar-los tots).
   */
  aconseguits?: Element[];
}

/**
 * Pla del Masset. Primer l'espera (4a, sense espòilers del desemmascarament) i, quan l'equip ha
 * respost la contrasenya, el ritual (4b) amb l'ordre dels elements. Com es passa d'una part a
 * l'altra i el resultat del Gresol són PENDENT (docs/fites-nova.md § Estació central): tot es
 * configura a content/public/gresol.ts.
 */
export function VistaFinal({
  ritual,
  onComencarRitual,
  onComencarAr,
  onTornar,
  transicio = GRESOL_CONFIG.transicio,
  aconseguits = TOTS_ELS_ELEMENTS,
}: VistaFinalProps) {
  const nodes: NodePentagrama[] = TOTS_ELS_ELEMENTS.map((element) => ({
    id: element,
    element,
    resolt: aconseguits.includes(element),
    disponible: true,
  }));
  const complet = TOTS_ELS_ELEMENTS.every((e) => aconseguits.includes(e));
  const unaPantalla = transicio === "una-pantalla";
  const mostrarArribada = unaPantalla || !ritual;
  const mostrarRitual = unaPantalla || ritual;
  const titol = mostrarArribada ? GRESOL_ARRIBADA.titol : GRESOL_RITUAL.titol;

  return (
    <>
      <MarcFinal />
      {/* Mateixa estructura que una fita (VistaEstacio), però dins el marc de runes i en or. */}
      <main
        className="mx-auto min-h-dvh w-full max-w-md"
        style={{
          paddingTop: `calc(env(safe-area-inset-top) + ${MARGE_MARC_FINAL_PX}px)`,
          paddingBottom: `calc(env(safe-area-inset-bottom) + ${MARGE_MARC_FINAL_PX + 16}px)`,
          paddingLeft: MARGE_MARC_FINAL_PX,
          paddingRight: MARGE_MARC_FINAL_PX,
        }}
      >
        {/* Capçalera: el pentagrama a l'arribada, el Gresol al ritual, sobre fons daurat */}
        <div
          className="relative flex h-60 items-center justify-center overflow-hidden rounded-[1.75rem] border-[3px] border-ink"
          style={{ background: "radial-gradient(circle at 50% 45%, #fff8e1 0%, #f5d77a 45%, var(--gold-deep) 110%)" }}
        >
          {mostrarRitual && !unaPantalla ? (
            <img src="/images/ar/conjuncio-fons.webp" alt="La Conjunció dels Astres" className="h-full w-full rounded-[1.5rem] object-cover" />
          ) : (
            <Pentagrama nodes={nodes} centreActiu={complet} girar className="h-full max-w-full animate-segellar py-3" />
          )}
          {onTornar && (
            <button
              type="button"
              onClick={onTornar}
              aria-label="Tornar al mapa"
              className="btn btn-secundari btn-rodo absolute left-3 top-3"
            >
              ←
            </button>
          )}
        </div>

        <div className="relative mt-5 px-2">
          <p className="etiqueta text-gold-deep">✦ la fita final · pla de masset ✦</p>
          <h1 className="mb-5 text-5xl font-extrabold">{titol}</h1>

          <div className="flex flex-col gap-5">
            {mostrarArribada && (
              <Narracio
                key="arribada"
                text={{ ...GRESOL_ARRIBADA, titol: undefined }}
                etiqueta="fra francesc"
                color="var(--gold-deep)"
                className="animate-entrar"
              />
            )}

            {!unaPantalla && !ritual && (
              <div className="flex flex-col gap-3 animate-entrar [animation-delay:150ms]">
                <p className="text-center text-lg font-bold text-ink-soft">{GRESOL_BOTO_RITUAL.avis}</p>
                <button type="button" onClick={onComencarRitual} className="btn btn-fosc">
                  ⚗️ {GRESOL_BOTO_RITUAL.boto}
                </button>
              </div>
            )}

            {mostrarRitual && (
              <>
                {unaPantalla && <ImatgeGresol className="mx-auto w-64 max-w-full" />}
                <Narracio
                  key="ritual"
                  text={unaPantalla ? GRESOL_RITUAL : { ...GRESOL_RITUAL, titol: undefined }}
                  etiqueta="fra francesc"
                  color="var(--gold-deep)"
                  className="animate-entrar [animation-delay:150ms]"
                />
                <Passos />
                {onComencarAr && (
                  <button type="button" onClick={onComencarAr} className="btn btn-fosc animate-entrar [animation-delay:600ms]">
                    ⚗️ {GRESOL_BOTO_AR.boto}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function ImatgeGresol({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Halo daurat que batega darrere el gresol (s'atura amb prefers-reduced-motion). */}
      <div
        aria-hidden
        className="absolute inset-[18%] rounded-full bg-gold/40 blur-2xl motion-safe:animate-bategar"
      />
      <img
        src="/images/gresol.webp"
        alt="El Gresol dels Cinc Elements"
        className="relative h-full w-full animate-revelar object-contain drop-shadow-[0_0_20px_rgb(234_179_8/0.55)]"
      />
    </div>
  );
}

function Passos() {
  return (
    <section className="targeta animate-entrar p-5 [animation-delay:450ms]">
      <h3 className="mb-3 text-2xl font-extrabold">{GRESOL_PASSOS.titol}</h3>
      <ol className="flex flex-col gap-3 text-xl leading-snug">
        {GRESOL_PASSOS.passos.map((pas, i) => (
          <li key={pas} className="flex gap-3">
            <span className="font-display font-extrabold text-gold-deep">{i + 1}.</span>
            <span>{pas}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 rounded-2xl border-[3px] border-blood bg-[#fde8e6] px-4 py-3 text-lg font-bold text-blood">
        ⚠️ {GRESOL_PASSOS.seguretat}
      </p>
    </section>
  );
}
