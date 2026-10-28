import type { CSSProperties } from "react";
import { generaSoroll, opcionsSoroll, PAS_PUNTS_OBJECTIU } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";

/**
 * Simulació a escala real (per imprimir o desar en PDF) de la trama de punts de
 * la resposta del cartell de Foc: requadres de 4×4 cm, tots un tros del mateix
 * cartell (la cantonada inferior esquerra del triangle 🜂), amb diferents radis
 * de punt (files) i densitats (columnes). Hereta el layout de /pantalles (404 en producció).
 */
const MM_PER_UNITAT = 168 / 1000; // el dibuix fa 168 mm d'ample al cartell A4 (VistaCartells)
const COSTAT_MM = 40;
// Cantonada inferior esquerra del triangle, perquè hi surtin la vora, el buit de dins i el fons.
const X0 = 250;
const Y0 = 235;

const COSTAT_UNITATS = COSTAT_MM / MM_PER_UNITAT;

/** Només els punts de la finestra visible (la trama sencera té desenes de milers de punts per requadre). */
function retalla<T extends { x: number; y: number }>(punts: T[]): T[] {
  const marge = 10;
  return punts.filter((p) => p.x >= X0 - marge && p.x <= X0 + COSTAT_UNITATS + marge && p.y >= Y0 - marge && p.y <= Y0 + COSTAT_UNITATS + marge);
}

const RADIS =[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0];
/** Densitat respecte de l'actual (1 = l'actual, 2 = +100%). */
const DENSITATS = [1, 1.33, 1.67, 2];
const FILES_PER_PAGINA = 4;

const PAGINES = Array.from({ length: Math.ceil(RADIS.length / FILES_PER_PAGINA) }, (_, i) => RADIS.slice(i * FILES_PER_PAGINA, (i + 1) * FILES_PER_PAGINA));

export default function SorollFocSimulacioPage() {
  return (
    <div className="bg-white text-black">
      <style>{`
        @page { size: A4; margin: 0; }
        html, body { background: #fff !important; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .sim svg { position: absolute; max-width: none; width: ${1000 * MM_PER_UNITAT}mm; height: ${(opcionsSoroll("imatge").alcada) * MM_PER_UNITAT}mm; left: ${-X0 * MM_PER_UNITAT}mm; top: ${-Y0 * MM_PER_UNITAT}mm; }
        .pagina-sim { break-after: page; height: 297mm; padding: 12mm; overflow: hidden; }
        .pagina-sim:last-child { break-after: auto; }
      `}</style>
      {PAGINES.map((radis, pagina) => (
        <section key={pagina} className="pagina-sim">
          <h1 className="text-[13pt] font-bold">Simulació · trama de punts del símbol 🜂 (escala real) · pàg. {pagina + 1}/{PAGINES.length}</h1>
          <p className="mb-[6mm] text-[8.5pt]">
            Cada requadre és de 4×4 cm: un tros real del cartell A4 (cantonada inferior esquerra del triangle). Files: radi del punt (en unitats SVG; 1 unitat = 0,168 mm). Columnes: densitat de punts;
            100% = l&apos;actual (distància entre punts {PAS_PUNTS_OBJECTIU} unitats).
          </p>
          <div className="grid gap-x-[6mm] gap-y-[7mm]" style={{ gridTemplateColumns: `repeat(${DENSITATS.length}, ${COSTAT_MM}mm)` }}>
            {radis.flatMap((radi) =>
              DENSITATS.map((densitat) => {
                const pas = PAS_PUNTS_OBJECTIU / Math.sqrt(densitat);
                const sencer = generaSoroll({ resposta: "", simbolObjectiu: "foc", ...opcionsSoroll("imatge"), radiPunts: radi, pasPunts: pas });
                const soroll = { ...sencer, puntsObjectiu: retalla(sencer.puntsObjectiu), puntsFons: sencer.puntsFons && retalla(sencer.puntsFons) };
                const quadre: CSSProperties = { width: `${COSTAT_MM}mm`, height: `${COSTAT_MM}mm` };
                return (
                  <figure key={`${radi}-${densitat}`}>
                    <div className="sim relative overflow-hidden border border-black" style={quadre}>
                      <SorollFocSvg soroll={soroll} />
                    </div>
                    <figcaption className="mt-[1mm] text-[7.5pt] leading-tight">
                      radi <b>{radi}</b> ({(radi * MM_PER_UNITAT).toFixed(2)} mm) · densitat <b>{Math.round(densitat * 100)}%</b>
                      <br />
                      pas {pas.toFixed(2)} u ({(pas * MM_PER_UNITAT).toFixed(2)} mm)
                    </figcaption>
                  </figure>
                );
              }),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
