"use client";

import Link from "next/link";
import { Alegreya, Balthazar } from "next/font/google";
import { ELEMENTS, type Element } from "@/content/public/estacions";
import { DATA_ESDEVENIMENT, type PoemaCartell } from "@/content/public/cartells";
import type { Soroll } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";
import { MarcRunesCartell } from "@/components/cartells/MarcRunesCartell";
import { Pentagrama } from "@/components/ui/Pentagrama";

// Text dels cartells: serif cal·ligràfica, germana de l'Alegreya Sans de l'app. En recta i
// de pes mitjà, perquè es llegeixi a l'exterior i plastificada (la cursiva s'empastava).
const alegreya = Alegreya({ variable: "--font-alegreya", weight: ["500"], subsets: ["latin"] });

// Text dels cartells de propaganda: humanista d'aire antic, lliure (OFL).
const balthazar = Balthazar({ variable: "--font-balthazar", weight: ["400"], subsets: ["latin"] });

export interface DadesCartell {
  id: string;
  nom: string;
  element: Element;
  poema: PoemaCartell;
  codi: string;
  /** SVG del QR generat al servidor (lib/qr.ts). Sense valor es mostra un requadre buit. */
  qrSvg?: string;
  /** Només el Foc: composició de números i símbols (lib/sorollFoc.ts). */
  soroll?: Soroll;
}

const ARTICLE: Record<Element, string> = {
  aigua: "de l'Aigua",
  terra: "de la Terra",
  foc: "del Foc",
  aire: "de l'Aire",
  anima: "de l'Ànima",
};

/**
 * `imatge`: il·lustració horitzontal entre la capçalera i el text.
 * `fons`: il·lustració vertical a tot el full i el contingut en panells de paper.
 * `propaganda`: com `fons`, però per anunciar el joc: sense QR, codi ni soroll (el Foc
 * portaria la resposta), el títol és només l'element i el fons es veu més.
 * `lema`: com `propaganda`, però amb una sola frase (el lema de l'element) en lloc del text.
 */
export type EstilCartell = "imatge" | "fons" | "propaganda" | "lema";

/** Proporció de les il·lustracions horitzontals (public/images/cartells/, 1500×837 i 2000×1116). */
const PROPORCIO_IMATGE = "1500 / 837";

/** Mida del text en punts, segons quant ocupa: tots els cartells han d'omplir l'A4 igual. */
function midaPoema(poema: PoemaCartell, ambSoroll: boolean, fons: boolean) {
  const lletres = poema.paragrafs.join(" ").length;
  if (ambSoroll) return fons ? 11 : 16;
  if (lletres > 650) return fons ? 14.5 : 16;
  return 16;
}

function Cartell({ c, estil }: { c: DadesCartell; estil: EstilCartell }) {
  const element = ELEMENTS[c.element];
  const fons = estil === "fons";
  const mida = midaPoema(c.poema, !!c.soroll, fons);
  const panell = fons ? "cartell-panell " : "";

  return (
    <section
      data-fita={c.id}
      className={fons ? "cartell cartell-fons" : "cartell pergami"}
      style={{ ["--el" as string]: element.color, ...(fons ? { backgroundImage: `url(${c.poema.fons})`, backgroundPosition: c.poema.fonsPosicio } : {}) }}
    >
      <MarcRunesCartell color={element.color} fons={fons} />
      <div className="cartell-marc">
        <header className={`${panell}flex items-center gap-[6mm]`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- s'imprimeix: sense optimització d'imatge */}
          <img src={element.icona} alt="" className="h-[26mm] w-[26mm] shrink-0 object-contain" />
          <div className="min-w-0">
            <p className="etiqueta !text-[10pt] !text-ink-soft">Els Guardians del Secret de Sentfores · 1472</p>
            <h1 className="text-[46pt] font-extrabold leading-[0.95]" style={{ color: element.color }}>
              Fita {ARTICLE[c.element]}
            </h1>
            <p className="font-display text-[22pt] font-bold leading-tight">{c.nom}</p>
          </div>
        </header>

        {!fons && <div className="cartell-filet" aria-hidden />}

        <div className="flex min-h-0 flex-1 flex-col justify-center gap-[5mm]">
          {/* La il·lustració (o el fons, que s'hi veu a través) ocupa l'espai que deixen el text i el soroll. */}
          {fons ? (
            // El fons es veu a través d'aquest espai.
            <div className="min-h-[30mm] flex-1" />
          ) : (
            // Totes les il·lustracions a tota l'amplada; al Foc, amb els números a sobre.
            <div className="relative w-full shrink-0" style={{ aspectRatio: PROPORCIO_IMATGE }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- s'imprimeix: sense optimització d'imatge */}
              <img src={c.poema.imatge} alt="" className="absolute inset-0 h-full w-full" />
              {c.soroll && <SorollFocSvg soroll={c.soroll} halo className="absolute inset-0 h-full w-full" />}
            </div>
          )}

          <div className={`${panell}cartell-text flex flex-col gap-[0.7em] text-pretty leading-[1.4]`} style={{ fontSize: `${mida}pt` }}>
            {c.poema.paragrafs.map((paragraf, i) => (
              <p key={i}>{paragraf}</p>
            ))}
          </div>

          {fons && c.soroll && (
            <div className="rounded-[3mm] border-[0.8mm] border-ink bg-white p-[2mm]">
              <SorollFocSvg soroll={c.soroll} className="block h-auto w-full" />
            </div>
          )}
        </div>

        {!fons && <div className="cartell-filet" aria-hidden />}

        <footer className={`${panell}flex items-center gap-[7mm]`}>
          <div className="h-[40mm] w-[40mm] shrink-0 overflow-hidden rounded-[2mm] border-[0.8mm] border-ink bg-white">
            {c.qrSvg ? (
              <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: c.qrSvg }} />
            ) : (
              <div className="flex h-full items-center justify-center text-[12pt] text-ink-soft">QR</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display text-[24pt] font-bold leading-tight">Obriu la fita</p>
            <p className="text-[13pt] leading-snug">
              Escanegeu el QR amb la càmera del mòbil
              <br />o entreu aquest codi a l&apos;app:
            </p>
            <p className="mt-[1.5mm] font-mono text-[34pt] font-extrabold tracking-[0.18em]" style={{ color: element.color }}>
              {c.codi}
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}

/** Cartell de propaganda: el fons és el protagonista; el títol i el text, a baix sobre un degradat de paper. */
function CartellPropaganda({ c, lema = false }: { c: DadesCartell; lema?: boolean }) {
  const element = ELEMENTS[c.element];

  return (
    <section
      data-fita={c.id}
      className="cartell cartell-fons"
      style={{ ["--el" as string]: element.color, backgroundImage: `url(${c.poema.fons})`, backgroundPosition: c.poema.fonsPosicio }}
    >
      {/* La sanefa per sobre de tot: el degradat del text no l'ha de tapar. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <MarcRunesCartell color={element.color} fons />
      </div>
      {/* Tota la part de dalt és per a la il·lustració; el títol i el text, junts a baix. */}
      <div className="cartell-marc !justify-end !p-[8mm]">
        {/* Logo de l'Associació de Veïns de la Guixa, petit a dalt a la dreta. */}
        <div className="absolute top-[10.5mm] right-[10.5mm]">
          {/* eslint-disable-next-line @next/next/no-img-element -- s'imprimeix: sense optimització d'imatge */}
          <img src="/images/logo-associacio-sentfores.png" alt="Sentfores · Associació de Veïns de la Guixa" className="block h-[21.5mm] w-auto" />
        </div>

        {/* Alçada fixa (la del cartell amb més text) perquè el títol quedi a la mateixa altura a tots;
            el text va alineat a baix i l'espai que sobra queda entre el títol i el text. */}
        <div className={`propaganda-peu flex flex-col gap-[4mm] ${lema ? "h-[120.5mm]" : "h-[168.5mm]"}`}>
          {/* 10 pt més amunt que on el posaria el flux, sense moure el text. */}
          <header className="relative -top-[10pt] flex flex-col items-center text-center">
            <div className="flex items-center gap-[4mm]">
              {/* eslint-disable-next-line @next/next/no-img-element -- s'imprimeix: sense optimització d'imatge */}
              <img src={element.icona} alt="" className="h-[24mm] w-[24mm] shrink-0 object-contain" />
              <h1 className="text-[84pt] font-extrabold leading-[0.9]" style={{ color: element.color }}>
                {element.nom}
              </h1>
            </div>
            <p className="font-display text-[22pt] font-bold leading-tight">Els Guardians del Secret de Sentfores · 1472</p>
            <p className="mt-[1.5mm] font-display text-[20pt] font-bold leading-tight" style={{ color: element.color }}>
              {DATA_ESDEVENIMENT}
            </p>
          </header>

          {lema ? (
            <p className="propaganda-lema mt-auto px-[5mm] pb-[15mm] text-center text-[28pt] leading-[1.3]">{c.poema.lema}</p>
          ) : (
            <div className="cartell-text mt-auto flex flex-col gap-[0.6em] px-[5mm] pb-[15mm] text-justify leading-[1.38]" style={{ fontSize: "18pt" }}>
              {c.poema.paragrafs.map((paragraf, i) => (
                <p key={i}>{paragraf}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Primer cartell de propaganda (portada): títol, el pentagrama del joc, el mapa de Sentfores sense
 * les fites, la data i una frase. Mateixa estètica que els cartells dels elements.
 */
function CartellPortada() {
  const or = "#8a6300";
  return (
    <section
      data-fita="portada"
      className="cartell"
      style={{
        ["--el" as string]: or,
        // El mapa de fons, a tota l'amplada i alineat a baix; a dalt s'esvaeix cap al pergamí.
        backgroundColor: "var(--paper-2)",
        backgroundImage:
          "var(--gra), linear-gradient(to bottom, var(--paper-2) 87mm, rgb(243 229 196 / 0) 150mm), url(/mapa-sentfores.webp)",
        backgroundSize: "auto, 100% 100%, 100% auto",
        backgroundPosition: "top, top, bottom",
        backgroundRepeat: "repeat, no-repeat, no-repeat",
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-10">
        <MarcRunesCartell color={or} fons />
      </div>
      <div className="cartell-marc !gap-[5mm] !p-[8mm] items-center text-center">
        <div className="absolute top-[10.5mm] right-[10.5mm]">
          {/* eslint-disable-next-line @next/next/no-img-element -- s'imprimeix: sense optimització d'imatge */}
          <img src="/images/logo-associacio-sentfores.png" alt="Sentfores · Associació de Veïns de la Guixa" className="block h-[21.5mm] w-auto" />
        </div>

        {/* Títol tot d'un sol color i mida; marge lateral perquè no toqui el logo. */}
        <h1 className="mt-[4mm] px-[24mm] text-[36pt] font-extrabold leading-[1] text-balance" style={{ color: or }}>
          Els Guardians del Secret de Sentfores · 1472
        </h1>

        <div className="flex flex-col items-center gap-[1.5mm]">
          <p className="propaganda-lema text-[26pt] leading-[1.2]">El secret està ocult, vine a descobrir-lo.</p>
          <p className="font-display text-[22pt] font-bold leading-tight" style={{ color: or }}>
            {DATA_ESDEVENIMENT}
          </p>
        </div>

        {/* Decoratiu: elements en color i el Gresol encès (sense les marques de fita resolta de l'app). */}
        <Pentagrama vius centreActiu className="my-auto h-[150mm] w-[150mm] shrink-0" />
      </div>
    </section>
  );
}

/** Cartells físics de les fites, un per full A4, per imprimir (o desar en PDF) des del navegador. */
export function VistaCartells({ cartells, estil = "imatge" }: { cartells: DadesCartell[]; estil?: EstilCartell }) {
  const propaganda = estil === "propaganda" || estil === "lema";
  const pendents = propaganda ? [] : cartells.filter((c) => c.poema.pendent);

  return (
    <main className={`${alegreya.variable} ${balthazar.variable} vista-cartells flex flex-col items-center gap-8 px-4 py-6`}>
      <style>{`
        @page { size: A4; margin: 0; }
        .cartell {
          width: 210mm; height: 297mm; padding: 9mm; flex-shrink: 0;
          box-shadow: 0 4px 24px rgb(0 0 0 / 0.25);
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .cartell { position: relative; }
        /* Dins la sanefa de runes (components/cartells/MarcRunesCartell.tsx). */
        .cartell-marc {
          position: relative; display: flex; flex-direction: column; gap: 5mm; height: 100%;
          padding: 12mm;
        }
        .cartell-text { font-family: var(--font-alegreya), serif; font-weight: 500; }
        .cartell-text > p:first-child::first-letter {
          float: left; margin: 0.08em 0.12em 0 0; font-family: var(--font-grenze-gotisch), serif;
          font-style: normal; font-weight: 800; font-size: 3.1em; line-height: 0.8; color: var(--el);
        }
        .cartell-fons {
          background-color: var(--paper-2); background-size: cover; background-position: center;
        }
        .cartell-panell {
          padding: 4mm 5mm; border: 0.6mm solid var(--ink); border-radius: 3mm;
          background: rgb(251 244 228 / 0.9);
        }
        /* Propaganda: sense caixes, un vel de paper que s'esvaeix cap a la il·lustració. */
        /* El vel comença per sobre del bloc (::before) i és molt transparent darrere el títol,
           perquè s'hi vegi el fons; només es fa gairebé opac a l'altura del text. */
        .propaganda-peu {
          position: relative; margin: 0 -4mm -2mm; padding: 24mm 6mm 4mm; border-radius: 0 0 3mm 3mm;
          background: linear-gradient(to bottom,
            rgb(243 229 196 / 0.25), rgb(243 229 196 / 0.45) 14mm, rgb(243 229 196 / 0.66) 32mm,
            rgb(243 229 196 / 0.9) 46mm, rgb(243 229 196 / 0.95));
        }
        .propaganda-peu::before {
          content: ""; position: absolute; left: 0; right: 0; bottom: 100%; height: 60mm;
          background: linear-gradient(to bottom, rgb(243 229 196 / 0), rgb(243 229 196 / 0.25));
        }
        .propaganda-peu header p { text-shadow: 0 0 1mm #f3e5c4, 0 0 2mm #f3e5c4, 0 0 3mm #f3e5c4; }
        .propaganda-lema { font-family: var(--font-balthazar), serif; text-wrap: balance; white-space: pre-line; }
        .propaganda-peu .cartell-text { font-family: var(--font-balthazar), serif; font-weight: normal; }
        .propaganda-peu h1 { text-shadow: 0 0 1.2mm #f3e5c4, 0 0 2.4mm #f3e5c4, 0 0 4mm #f3e5c4; }
        .cartell-filet {
          height: 0.9mm; border-radius: 1mm;
          background: linear-gradient(90deg, transparent, var(--el) 15%, var(--el) 85%, transparent);
        }
        @media print {
          html, body { background: none !important; }
          .vista-cartells { padding: 0 !important; gap: 0 !important; }
          .cartell { box-shadow: none; break-after: page; }
        }
      `}</style>

      <header className="flex w-full max-w-[210mm] flex-col gap-3 print:hidden">
        <Link href="/master/codis" className="btn btn-secundari w-auto self-start px-4 text-base">
          ← Codis
        </Link>
        <h1 className="text-5xl font-extrabold">{propaganda ? "Cartells de propaganda" : "Cartells de les fites"}</h1>
        <p className="text-lg text-ink-soft">
          {propaganda
            ? "Un cartell per full A4 per anunciar el joc. No porten cap codi ni cap resposta: es poden penjar on sigui."
            : "Un cartell per full A4. Imprimiu-los en color, sense marges i amb els gràfics de fons activats, i plastifiqueu-los. Porten el codi de la fita: no els deixeu a la vista abans de la partida."}
        </p>
        {pendents.length > 0 && (
          <div className="rounded-2xl border-[3px] border-blood bg-blood/10 p-4">
            <p className="font-extrabold text-blood">Poemes pendents: no els imprimiu encara</p>
            <ul className="mt-1 list-disc pl-5">
              {pendents.map((c) => (
                <li key={c.id}>
                  <strong>{ELEMENTS[c.element].nom}:</strong> {c.poema.pendent}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-3">
          <Link href="?" className={`btn ${estil === "imatge" ? "btn-fosc" : "btn-secundari"} text-base`}>
            Amb il·lustració
          </Link>
          <Link href="?estil=fons" className={`btn ${estil === "fons" ? "btn-fosc" : "btn-secundari"} text-base`}>
            Amb imatge de fons
          </Link>
          <Link href="?estil=propaganda" className={`btn ${estil === "propaganda" ? "btn-fosc" : "btn-secundari"} text-base`}>
            Propaganda
          </Link>
          <Link href="?estil=lema" className={`btn ${estil === "lema" ? "btn-fosc" : "btn-secundari"} text-base`}>
            Propaganda amb lema
          </Link>
        </div>
        <button type="button" onClick={() => window.print()} className="btn btn-primari">
          Imprimir / desar en PDF
        </button>
      </header>

      <div className="flex w-full flex-col items-center gap-8 overflow-x-auto print:block print:overflow-visible">
        {propaganda && <CartellPortada />}
        {cartells.map((c) => (
          propaganda ? <CartellPropaganda key={c.id} c={c} lema={estil === "lema"} /> : <Cartell key={c.id} c={c} estil={estil} />
        ))}
      </div>
    </main>
  );
}
