import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Balthazar } from "next/font/google";
import Image from "next/image";
import { AMPLE_CINTA, CintaRunes, CintaRunesEstils } from "@/components/anunci/CintaRunes";
import { MapaPlaMasset } from "@/components/anunci/MapaPlaMasset";
import { MiniJocElements } from "@/components/anunci/MiniJocElements";
import { ELEMENTS, type Element } from "@/content/public/estacions";
import { POEMES_CARTELLS, DATA_ESDEVENIMENT, TIPUS_ESDEVENIMENT } from "@/content/public/cartells";

/**
 * Landing de difusió: la pàgina que veu algú que ha vist l'anunci del joc i vol
 * saber de què va, abans de la partida. Independent de tot el joc: no comparteix
 * disseny amb la Benvinguda (`components/player/Benvinguda.tsx`) i no hi enllaça
 * enlloc (ni a `/`, ni a l'app). Contingut 100% públic: no revela cap prova ni
 * cap resposta, i no destapa el gir final de la trama (qui és l'Inquisidor).
 *
 * Després de la portada, la pàgina és una successió de pantalles amb una imatge de fons,
 * amb un marge a cada costat per on corre la cinta de runes (`components/anunci/CintaRunes.tsx`),
 * del color de l'element de cada imatge.
 */

// Text de vitrina: mateixa família humanista que fan servir els cartells de propaganda impresos.
const balthazar = Balthazar({ variable: "--font-balthazar", weight: ["400"], subsets: ["latin"] });
const VITRINA = { fontFamily: "var(--font-balthazar), serif" };

export const metadata: Metadata = {
  title: "Els Guardians del Secret de Sentfores",
  description: `${TIPUS_ESDEVENIMENT} a Sentfores (Osona). ${DATA_ESDEVENIMENT}.`,
};

/** Color de la cinta a les pantalles que no són d'un element. */
const DAURAT = "#eab308";

/** Cada element amb el seu cartell de propaganda (content/public/cartells.ts): il·lustració de fons i lema. */
const ELEMENT_CARTELL: Record<Element, string> = {
  aigua: "font-ferro",
  terra: "planes-bones",
  foc: "foc",
  aire: "aire",
  anima: "anima",
};

/** Vels sobre la imatge perquè el text es llegeixi: fosc (text clar) o de paper com el peu dels cartells (text fosc). */
const VELS = {
  fosc: "linear-gradient(to top, rgb(27 21 17) 0%, rgb(27 21 17 / 0.88) 45%, rgb(27 21 17 / 0.55) 75%, rgb(27 21 17 / 0.15) 100%)",
  paper: "linear-gradient(to bottom, rgb(243 229 196 / 0) 0%, rgb(243 229 196 / 0.7) 1rem, rgb(243 229 196 / 0.95) 1.8rem)",
};

/** Una pantalla de la successió: imatge a tot el fons (si en té), vel i contingut a baix. */
function Pantalla({
  imatge,
  alt = "",
  posicio,
  vel,
  compacte = false,
  children,
}: {
  imatge?: string;
  alt?: string;
  posicio?: string;
  vel?: keyof typeof VELS;
  /** Contingut més dens que l'habitual: redueix el marge superior i els espais perquè no calgui fer scroll. */
  compacte?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`relative flex h-[100svh] snap-start flex-col overflow-hidden ${imatge && !compacte ? "justify-end" : "justify-center"}`}
    >
      {imatge && (
        <Image
          src={imatge}
          alt={alt}
          fill
          sizes="100vw"
          style={posicio ? { objectPosition: posicio } : undefined}
          className="object-cover"
        />
      )}
      {vel === "fosc" && <div className="absolute inset-0" style={{ background: VELS.fosc }} />}
      {/* El vel de paper va enganxat al bloc de text: el cobreix sempre, sigui quina sigui la seva alçada. */}
      <div className="relative z-10 w-full overflow-y-auto" style={vel === "paper" ? { background: VELS.paper } : undefined}>
        <div
          className={`mx-auto flex w-full max-w-xl flex-col items-center px-5 text-center ${
            compacte
              ? "gap-1.5 pb-8 pt-8 sm:gap-5 sm:pb-14 sm:pt-14"
              : `gap-3 pb-8 sm:gap-5 sm:pb-14 ${imatge ? "pt-28 sm:pt-40" : "pt-8 sm:pt-14"}`
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

function Etiqueta({ children }: { children: ReactNode }) {
  return <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">{children}</p>;
}

function TitolFosc({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-balance text-3xl sm:text-4xl font-extrabold leading-tight text-paper drop-shadow-[0_3px_8px_rgb(0_0_0_/_0.6)]">
      {children}
    </h2>
  );
}

/** Les pantalles abans de les 5 fites, amb el color de cinta de cadascuna. */
const PANTALLES_ABANS: { color: string; contingut: ReactNode }[] = [
  {
    // La llegenda: context de la trama, en la seva pròpia pantalla.
    color: DAURAT,
    contingut: (
      <Pantalla>
        <Etiqueta>L&apos;any 1472</Etiqueta>
        <TitolFosc>Un secret que ni la guerra no ha pogut destruir</TitolFosc>
        <div className="flex flex-col gap-2 sm:gap-4 text-left text-sm sm:text-lg leading-snug sm:leading-relaxed text-paper">
          <p>
            Sentfores crema. La Guerra dels Remences assola el país i el castell del poble cau en runes. Abans que
            tot s&apos;ensorri, algú amaga pel terme els fragments d&apos;un secret que no pot caure en mans
            equivocades.
          </p>
          <p>
            No sou els únics que el busqueu. Algú ronda els carrers i els camins, vigilant qui s&apos;hi acosta massa
            &mdash; i no dubtarà a aturar-vos.
          </p>
        </div>
        <Image
          src="/images/cartells/portada/poble-crema.webp"
          alt="El poble de Sentfores i el castell cremant durant la Guerra dels Remences"
          width={1500}
          height={837}
          className="w-full rounded-2xl object-cover"
          sizes="(max-width: 640px) 100vw, 36rem"
        />
      </Pantalla>
    ),
  },
  {
    // El joc: format + instruccions, amb una il·lustració de l'equip a sota, en la seva pròpia pantalla.
    color: DAURAT,
    contingut: (
      <Pantalla>
        <Etiqueta>El joc</Etiqueta>
        <TitolFosc>Formeu equip i sortiu a buscar-lo</TitolFosc>
        <p className="text-left text-sm sm:text-lg leading-snug sm:leading-relaxed text-paper">
          El dia de la partida, sortiu a recórrer Sentfores a peu, mòbil en mà. Pel poble i el seu entorn hi ha cinc
          punts amagats, un per cada element: Aigua, Terra, Foc, Aire i Ànima. A cadascun us espera una prova diferent
          a l&apos;aire lliure &mdash; supereu-la en equip per guanyar el vostre fragment del secret.
        </p>
        <Image
          src="/images/cartells/portada/equip-mobil-nit.webp"
          alt="Un equip de jugadors consultant el mapa de fites al mòbil pels carrers de Sentfores de nit"
          width={2000}
          height={1116}
          className="w-full rounded-2xl object-cover"
          sizes="(max-width: 640px) 100vw, 36rem"
        />
      </Pantalla>
    ),
  },
];

/** Les pantalles després de les 5 fites, amb el color de cinta de cadascuna. */
const PANTALLES_DESPRES: { color: string; contingut: ReactNode }[] = [
  {
    // El final: el ritual que tanca la partida, sense explicar-ne la mecànica.
    color: DAURAT,
    contingut: (
      <Pantalla imatge="/images/cartells/portada/cami-buit.jpg" vel="fosc" compacte>
        <Etiqueta>El final</Etiqueta>
        <TitolFosc>El Gresol dels Cinc Elements</TitolFosc>
        <MiniJocElements />
        <p className="text-left text-sm sm:text-lg leading-snug sm:leading-relaxed text-paper">
          Quan tingueu els cinc fragments, tot us porta de tornada al cor del poble, al Pla de Masset. Allà els cinc
          elements s&apos;ajunten en un darrer ritual que ho decidirà tot.
        </p>
        <p className="text-pretty text-base sm:text-xl italic leading-snug text-gold" style={VITRINA}>
          Sigueu els Guardians del Secret i conjureu la fórmula de l&apos;alquímia secreta.
        </p>
      </Pantalla>
    ),
  },
  {
    // Tancament: on i quan, i qui ho organitza. Sense cap enllaç ni botó.
    color: DAURAT,
    contingut: (
      <Pantalla>
        <TitolFosc>Apunteu-vos la data</TitolFosc>
        <div className="w-full max-w-sm">
          <MapaPlaMasset />
        </div>
        <ul className="flex flex-col gap-3 text-lg font-bold text-paper">
          <li>📅 {DATA_ESDEVENIMENT}</li>
          <li>📍 Pla del Masset · Sentfores (la Guixa), Osona</li>
          <li>👥 En equip, a l&apos;exterior, amb el mòbil</li>
        </ul>
        <div className="rounded-2xl bg-paper px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo estàtic, sense necessitat d'optimització */}
          <img src="/images/logo-associacio-sentfores.png" alt="Sentfores · Associació de Veïns de la Guixa" className="h-16 w-auto" />
        </div>
        <p className="max-w-xs text-pretty italic text-paper/80" style={VITRINA}>
          Que tingueu sort. Algú altre també el busca.
        </p>
      </Pantalla>
    ),
  },
];

/** Estil comú de les dues graelles de cinta · pantalla · cinta, abans i després de les 5 fites. */
const ESTIL_GRAELLA = { gridTemplateColumns: `${AMPLE_CINTA}px minmax(0, 1fr) ${AMPLE_CINTA}px` };

export default function AnunciPage() {
  const colorsAbans = PANTALLES_ABANS.map((p) => p.color);
  const colorsDespres = PANTALLES_DESPRES.map((p) => p.color);
  const allColors = [DAURAT, ...colorsAbans, ...colorsDespres];
  return (
    <main className={`${balthazar.variable} bg-ink`}>
      <style>{`html { scroll-snap-type: y mandatory; }`}</style>
      <CintaRunesEstils />
      <div className="grid" style={ESTIL_GRAELLA}>
        {/* Portada: fotografia a tota la pantalla amb el títol, el lema i quan és. */}
        <section className="relative flex h-[100svh] w-full snap-start flex-col justify-end overflow-hidden">
          <Image
            src="/images/cartells/portada/frare.jpg"
            alt="Un frare encaputxat davant d'un portal ple de símbols alquímics"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
          <div className="relative z-10 flex flex-col items-center gap-5 px-6 pb-14 pt-24 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-paper/80">Sentfores · La Guixa (Osona)</p>
            <h1 className="max-w-3xl text-balance text-5xl font-extrabold leading-[0.95] text-paper drop-shadow-[0_3px_8px_rgb(0_0_0_/_0.6)] sm:text-6xl">
              Els Guardians del Secret de Sentfores
            </h1>
            <p className="max-w-md text-pretty text-xl italic leading-snug text-paper/90" style={VITRINA}>
              El secret està ocult, vine a descobrir-lo.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-full border-2 border-paper/70 bg-orange-600 px-4 py-2 text-sm font-bold text-paper sm:text-base">
                {DATA_ESDEVENIMENT}
              </span>
              <span className="rounded-full border-2 border-paper/70 bg-ink/40 px-4 py-2 text-sm font-bold text-paper backdrop-blur-sm sm:text-base">
                {TIPUS_ESDEVENIMENT}
              </span>
            </div>
            <p className="mt-6 animate-bounce text-sm font-bold uppercase tracking-[0.2em] text-paper/70">Descobriu de què va ↓</p>
          </div>
        </section>

        {/* Pantalles abans de les 5 fites: la llegenda i, en la seva pròpia pantalla, el joc amb els elements */}
        {PANTALLES_ABANS.map((p, i) => (
          <div key={i} style={{ gridColumn: 2, gridRow: i + 2 }}>
            {p.contingut}
          </div>
        ))}

        {/* Pantalles després de les fites */}
        {PANTALLES_DESPRES.map((p, i) => (
          <div key={i} style={{ gridColumn: 2, gridRow: i + 2 + PANTALLES_ABANS.length }}>
            {p.contingut}
          </div>
        ))}

        <CintaRunes costat="esquerra" colors={allColors} />
        <CintaRunes costat="dreta" colors={allColors} />
      </div>
    </main>
  );
}
