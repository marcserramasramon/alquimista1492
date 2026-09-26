import type { Metadata } from "next";
import { Balthazar } from "next/font/google";
import Image from "next/image";
import { MapaPlaMasset } from "@/components/anunci/MapaPlaMasset";
import { MiniJocElements } from "@/components/anunci/MiniJocElements";
import { MarcRunesCartell } from "@/components/cartells/MarcRunesCartell";
import { ELEMENTS, ESTACIONS, type Element } from "@/content/public/estacions";
import { POEMES_CARTELLS, DATA_ESDEVENIMENT, TIPUS_ESDEVENIMENT } from "@/content/public/cartells";

/**
 * Landing de difusió: la pàgina que veu algú que ha vist l'anunci del joc i vol
 * saber de què va, abans de la partida. Independent de tot el joc: no comparteix
 * disseny amb la Benvinguda (`components/player/Benvinguda.tsx`) i no hi enllaça
 * enlloc (ni a `/`, ni a l'app). Contingut 100% públic: no revela cap prova ni
 * cap resposta, i no destapa el gir final de la trama (qui és l'Inquisidor).
 */

// Text de vitrina: mateixa família humanista que fan servir els cartells de propaganda impresos.
const balthazar = Balthazar({ variable: "--font-balthazar", weight: ["400"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Els Guardians del Secret de Sentfores",
  description: `${TIPUS_ESDEVENIMENT} a Sentfores (Osona). ${DATA_ESDEVENIMENT}.`,
};

/** El text llarg de cada element: el mateix que porten els cartells de propaganda (content/public/cartells.ts). */
const ELEMENT_PARAGRAFS: Record<Element, string[]> = {
  aigua: POEMES_CARTELLS["font-ferro"].paragrafs,
  terra: POEMES_CARTELLS["planes-bones"].paragrafs,
  foc: POEMES_CARTELLS["foc"].paragrafs,
  aire: POEMES_CARTELLS["aire"].paragrafs,
  anima: POEMES_CARTELLS["anima"].paragrafs,
};

/** La mateixa foto de capçalera que ja fa servir la pantalla de la fita a l'app (`components/vistes/VistaEstacio.tsx`). */
const ELEMENT_IMATGE: Record<Element, string | undefined> = Object.fromEntries(
  ESTACIONS.filter((e) => e.element).map((e) => [e.element as Element, e.imatge]),
) as Record<Element, string | undefined>;

const ELEMENTS_ORDRE: Element[] = ["aigua", "terra", "foc", "aire", "anima"];

export default function AnunciPage() {
  return (
    <main className={`${balthazar.variable} flex flex-col`}>
      {/* Portada: fotografia a tota la pantalla amb el títol, el lema i quan és. */}
      <section className="relative flex min-h-[100svh] w-full flex-col justify-end overflow-hidden">
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
          <p className="max-w-md text-pretty text-xl italic leading-snug text-paper/90" style={{ fontFamily: "var(--font-balthazar), serif" }}>
            El secret està ocult, vine a descobrir-lo.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border-2 border-paper/70 bg-ink/40 px-4 py-2 text-sm font-bold text-paper backdrop-blur-sm sm:text-base">
              {DATA_ESDEVENIMENT}
            </span>
            <span className="rounded-full border-2 border-paper/70 bg-ink/40 px-4 py-2 text-sm font-bold text-paper backdrop-blur-sm sm:text-base">
              {TIPUS_ESDEVENIMENT}
            </span>
          </div>
          <p className="mt-6 animate-bounce text-sm font-bold uppercase tracking-[0.2em] text-paper/70">Descobriu de què va ↓</p>
        </div>
      </section>

      {/* La llegenda: el context de la trama, sense donar cap detall de trama posterior. */}
      <section className="bg-paper px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
          <p className="etiqueta">L&apos;any 1472</p>
          <h2 className="text-balance text-center text-3xl font-extrabold text-ink sm:text-4xl">
            Un secret que ni la guerra no ha pogut destruir
          </h2>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border-[3px] border-ink shadow-[0_6px_0_var(--ink)]">
            <Image
              src="/images/entrada-poble.webp"
              alt="Sentfores al capvespre, amb una figura encaputxada vigilant el camí d'entrada"
              fill
              sizes="(min-width: 640px) 576px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-4 text-left text-lg leading-relaxed text-ink">
            <p>
              Sentfores crema. La Guerra dels Remences assola el país i el castell del poble cau en runes. Abans
              que tot s&apos;ensorri, algú amaga pel terme els fragments d&apos;un secret que no pot caure en mans
              equivocades.
            </p>
            <p>
              No sou els únics que el busqueu. Algú ronda els carrers i els camins, vigilant qui s&apos;hi acosta
              massa &mdash; i no dubtarà a aturar-vos.
            </p>
          </div>
        </div>
      </section>

      {/* El format: què fan els equips, sense entrar en com es resol cada prova. */}
      <section className="pergami py-16 sm:py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6">
          <p className="etiqueta">El joc</p>
          <h2 className="text-balance text-center text-3xl font-extrabold text-ink sm:text-4xl">
            Formeu equip i sortiu a buscar-lo
          </h2>
          <p className="text-left text-lg leading-relaxed text-ink">
            El dia de la partida, sortiu a recórrer Sentfores a peu, mòbil en mà. Pel poble i el seu entorn hi ha
            cinc punts amagats, un per cada element: Aigua, Terra, Foc, Aire i Ànima. A cadascun us espera una
            prova diferent a l&apos;aire lliure &mdash; supereu-la en equip per guanyar el vostre fragment del
            secret.
          </p>
        </div>

        {/* Mateix vel de paper que "propaganda-peu" a components/vistes/VistaCartells.tsx (cartells-html/propaganda/). */}
        <style>{`
          .anunci-peu {
            position: relative; margin: 0 -4mm -2mm; padding: 24mm 6mm 4mm;
            background: linear-gradient(to bottom,
              rgb(243 229 196 / 0.25), rgb(243 229 196 / 0.45) 14mm, rgb(243 229 196 / 0.66) 32mm,
              rgb(243 229 196 / 0.9) 46mm, rgb(243 229 196 / 0.95));
          }
          .anunci-peu::before {
            content: ""; position: absolute; left: 0; right: 0; bottom: 100%; height: 60mm;
            background: linear-gradient(to bottom, rgb(243 229 196 / 0), rgb(243 229 196 / 0.25));
          }
          .anunci-peu-titol { text-shadow: 0 0 1.2mm #f3e5c4, 0 0 2.4mm #f3e5c4, 0 0 4mm #f3e5c4; }
          .anunci-peu-text { font-family: var(--font-balthazar), serif; }
        `}</style>

        <div className="mx-auto flex w-full max-w-[540px] flex-col gap-10 px-6">
          {ELEMENTS_ORDRE.map((el) => {
            const element = ELEMENTS[el];
            const imatge = ELEMENT_IMATGE[el];
            return (
              <div key={el} className="relative w-full overflow-hidden rounded-[3mm]" style={{ aspectRatio: "210 / 297" }}>
                {imatge && <Image src={imatge} alt="" fill sizes="(min-width: 640px) 540px, 100vw" className="object-cover" />}
                <MarcRunesCartell color={element.color} fons />
                <div className="absolute inset-0 flex flex-col justify-end p-[12mm]">
                  <div className="anunci-peu flex flex-col items-center gap-[4mm] text-center">
                    <div className="flex items-center gap-[3mm]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- icona petita, sense necessitat d'optimització */}
                      <img src={element.icona} alt="" className="h-[9mm] w-[9mm] object-contain" />
                      <h3 className="anunci-peu-titol text-[34pt] font-extrabold leading-[0.95]" style={{ color: element.color }}>
                        {element.nom}
                      </h3>
                    </div>
                    <div className="anunci-peu-text flex flex-col gap-[0.6em] text-justify leading-[1.38]" style={{ fontSize: "13pt" }}>
                      {ELEMENT_PARAGRAFS[el].map((paragraf, i) => (
                        <p key={i}>{paragraf}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* El final: el ritual que tanca la partida, sense explicar-ne la mecànica. */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 text-center">
          <p className="etiqueta">El final</p>
          <h2 className="text-balance text-3xl font-extrabold text-ink sm:text-4xl">El Gresol dels Cinc Elements</h2>
        </div>

        <MiniJocElements />

        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 text-center">
          <p className="text-left text-lg leading-relaxed text-ink">
            Quan tingueu els cinc fragments, tot us porta de tornada al cor del poble, al Pla de Masset. Allà els
            cinc elements s&apos;ajunten en un darrer ritual que ho decidirà tot.
          </p>
          <p className="text-pretty text-xl italic leading-snug text-gold-deep" style={{ fontFamily: "var(--font-balthazar), serif" }}>
            Sigueu els Guardians del Secret i conjureu la fórmula de l&apos;alquímia secreta.
          </p>
        </div>
      </section>

      {/* Tancament: informació pràctica i qui ho organitza. Sense cap enllaç ni botó. */}
      <section className="bg-ink px-6 py-16 text-center sm:py-20">
        <div className="mx-auto flex max-w-md flex-col items-center gap-6">
          <h2 className="text-balance text-3xl font-extrabold text-paper sm:text-4xl">Apunteu-vos la data</h2>
          <ul className="flex flex-col gap-3 text-lg font-bold text-paper">
            <li>📅 {DATA_ESDEVENIMENT}</li>
            <li>📍 Sentfores (la Guixa), Osona</li>
            <li>👥 En equip, a l&apos;exterior, amb el mòbil</li>
          </ul>
          <div className="mt-2 h-px w-24 bg-paper/30" aria-hidden />
          <div className="rounded-2xl bg-paper px-5 py-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo estàtic, sense necessitat d'optimització */}
            <img src="/images/logo-associacio-sentfores.png" alt="Sentfores · Associació de Veïns de la Guixa" className="h-16 w-auto" />
          </div>
          <p className="max-w-xs text-pretty italic text-paper/70" style={{ fontFamily: "var(--font-balthazar), serif" }}>
            Que tingueu sort. Algú altre també el busca.
          </p>
        </div>
      </section>

      {/* El mapa: on és exactament el Pla del Masset, sense revelar les fites del joc. */}
      <section className="bg-paper px-6 py-16 text-center sm:py-20">
        <div className="mx-auto flex max-w-md flex-col items-center gap-6">
          <MapaPlaMasset />
          <p className="text-xl font-extrabold text-ink">Pla del Masset · Sentfores</p>
          <p className="rounded-full border-2 border-ink bg-ink/5 px-4 py-2 text-base font-bold text-ink">
            {DATA_ESDEVENIMENT}
          </p>
        </div>
      </section>
    </main>
  );
}
