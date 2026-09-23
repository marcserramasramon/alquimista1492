import { Narracio } from "@/components/ui/Narracio";
import { Pentagrama, type NodePentagrama } from "@/components/ui/Pentagrama";
import { Pantalla } from "@/components/ui/Pantalla";
import { ELEMENTS, type Element } from "@/content/public/estacions";
import { GRESOL_CONFIG, LIQUIDS, RECIPIENTS, type TransicioGresol } from "@/content/public/gresol";
import { GRESOL_ARRIBADA, GRESOL_BOTO_RITUAL, GRESOL_PASSOS, GRESOL_RITUAL } from "@/content/public/textos";

const TOTS: NodePentagrama[] = (["aigua", "terra", "foc", "aire", "anima"] as const).map((element) => ({
  id: element,
  element,
  resolt: true,
  disponible: true,
}));

export interface VistaFinalProps {
  /** false: esperant Fra Francesc (4a). true: el ritual (4b). Amb "una-pantalla" s'ignora. */
  ritual: boolean;
  onComencarRitual: () => void;
  /** Per defecte, GRESOL_CONFIG (content/public/gresol.ts). La galeria els sobreescriu. */
  transicio?: TransicioGresol;
  ordreElements?: Element[];
}

/**
 * Pla de Masset. Primer l'espera (4a, sense espòilers del desemmascarament) i, quan l'equip ha
 * respost la contrasenya, el ritual (4b) amb l'ordre dels elements. Com es passa d'una part a
 * l'altra i el resultat del Gresol són PENDENT (docs/fites-nova.md § Estació central): tot es
 * configura a content/public/gresol.ts.
 */
export function VistaFinal({
  ritual,
  onComencarRitual,
  transicio = GRESOL_CONFIG.transicio,
  ordreElements = GRESOL_CONFIG.ordreElements,
}: VistaFinalProps) {
  const unaPantalla = transicio === "una-pantalla";
  const mostrarArribada = unaPantalla || !ritual;
  const mostrarRitual = unaPantalla || ritual;

  return (
    <Pantalla className="gap-5">
      {mostrarRitual && !unaPantalla ? (
        <ImatgeGresol />
      ) : (
        <Pentagrama nodes={TOTS} centreActiu girar className="mx-auto w-64 max-w-full animate-segellar" />
      )}
      <p className="etiqueta animate-entrar text-center text-gold-deep">pla de masset</p>

      {mostrarArribada && (
        <Narracio key="arribada" text={GRESOL_ARRIBADA} className="animate-entrar [animation-delay:300ms]" />
      )}

      {!unaPantalla && !ritual && (
        <div className="flex flex-col gap-3 animate-entrar [animation-delay:450ms]">
          <p className="text-center text-lg font-bold text-ink-soft">{GRESOL_BOTO_RITUAL.avis}</p>
          <button type="button" onClick={onComencarRitual} className="btn btn-fosc">
            ⚗️ {GRESOL_BOTO_RITUAL.boto}
          </button>
        </div>
      )}

      {mostrarRitual && (
        <>
          {unaPantalla && <ImatgeGresol />}
          <Narracio key="ritual" text={GRESOL_RITUAL} className="animate-entrar [animation-delay:150ms]" />
          <Recipients ordre={ordreElements} />
          <Passos />
        </>
      )}
    </Pantalla>
  );
}

function ImatgeGresol() {
  return (
    <div className="relative mx-auto w-64 max-w-full">
      {/* Halo daurat que batega darrere el gresol (s'atura amb prefers-reduced-motion). */}
      <div
        aria-hidden
        className="absolute inset-[18%] rounded-full bg-gold/40 blur-2xl motion-safe:animate-bategar"
      />
      <img
        src="/images/gresol.webp"
        alt="El Gresol dels Cinc Elements"
        className="relative w-full animate-revelar drop-shadow-[0_0_20px_rgb(234_179_8/0.55)]"
      />
    </div>
  );
}

function Recipients({ ordre }: { ordre: Element[] }) {
  return (
    <section className="targeta animate-entrar p-5 [animation-delay:300ms]">
      <h3 className="etiqueta mb-3">{GRESOL_PASSOS.recipients}</h3>
      <ol className="flex flex-col gap-3">
        {ordre.map((element, i) => {
          const { nom, icona, color } = ELEMENTS[element];
          const liquid = LIQUIDS[element];
          return (
            <li
              key={element}
              className="flex min-h-14 items-center gap-3 rounded-2xl border-[3px] bg-paper px-3 py-2"
              style={{ borderColor: color }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-xl font-extrabold text-paper"
                style={{ background: color }}
              >
                {i + 1}
              </span>
              <img src={icona} alt="" className="h-11 w-11 shrink-0" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-xl font-extrabold">{RECIPIENTS[element]}</p>
                <p className="text-base font-bold" style={{ color }}>
                  {nom} · <span className="text-ink-soft">líquid {liquid.nom}</span>
                </p>
              </div>
              <Vial mostra={liquid.mostra} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Tub d'assaig amb el color del líquid; el transparent, buit amb reflexos. */
function Vial({ mostra }: { mostra: string | null }) {
  return (
    <svg viewBox="0 0 24 48" className="h-12 w-6 shrink-0" aria-hidden>
      <path d="M5 2 H19 M7 2 V38 a5 5 0 0 0 10 0 V2" fill="#fffdf7" stroke="var(--ink)" strokeWidth={2.5} />
      <path
        d="M8.5 18 H15.5 V38 a3.5 3.5 0 0 1 -7 0 Z"
        fill={mostra ?? "#e6f1f5"}
        stroke={mostra ? "none" : "var(--ink)"}
        strokeWidth={1}
        strokeDasharray={mostra ? undefined : "2 2"}
      />
      <path d="M10.5 21 V36" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
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
