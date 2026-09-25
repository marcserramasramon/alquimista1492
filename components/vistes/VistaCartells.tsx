"use client";

import Link from "next/link";
import { ELEMENTS, type Element } from "@/content/public/estacions";
import type { PoemaCartell } from "@/content/public/cartells";
import type { Soroll } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";
import { MarcRunesCartell } from "@/components/cartells/MarcRunesCartell";

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
 */
export type EstilCartell = "imatge" | "fons";

/** Proporció de les il·lustracions horitzontals (public/images/cartells/, 1500×837 i 2000×1116). */
const PROPORCIO_IMATGE = "1500 / 837";

/** Mida del text en punts, segons quant ocupa: tots els cartells han d'omplir l'A4 igual. */
function midaPoema(poema: PoemaCartell, ambSoroll: boolean, fons: boolean) {
  const lletres = poema.paragrafs.join(" ").length;
  if (ambSoroll) return fons ? 11 : 16;
  if (lletres > 650) return fons ? 14.5 : 16;
  return fons ? 16 : 16.5;
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

          <div className={`${panell}cartell-text flex flex-col gap-[0.7em] text-pretty italic leading-[1.4]`} style={{ fontSize: `${mida}pt` }}>
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

/** Cartells físics de les fites, un per full A4, per imprimir (o desar en PDF) des del navegador. */
export function VistaCartells({ cartells, estil = "imatge" }: { cartells: DadesCartell[]; estil?: EstilCartell }) {
  const pendents = cartells.filter((c) => c.poema.pendent);

  return (
    <main className="vista-cartells flex flex-col items-center gap-8 px-4 py-6">
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
        <h1 className="text-5xl font-extrabold">Cartells de les fites</h1>
        <p className="text-lg text-ink-soft">
          Un cartell per full A4. Imprimiu-los en color, sense marges i amb els gràfics de fons activats, i plastifiqueu-los. Porten el codi
          de la fita: no els deixeu a la vista abans de la partida.
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
        </div>
        <button type="button" onClick={() => window.print()} className="btn btn-primari">
          Imprimir / desar en PDF
        </button>
      </header>

      <div className="flex w-full flex-col items-center gap-8 overflow-x-auto print:block print:overflow-visible">
        {cartells.map((c) => (
          <Cartell key={c.id} c={c} estil={estil} />
        ))}
      </div>
    </main>
  );
}
