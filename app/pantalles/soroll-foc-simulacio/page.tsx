import { generaSoroll, opcionsSoroll, PAS_PUNTS_OBJECTIU } from "@/lib/sorollFoc";
import { SorollFocSvg } from "@/components/cartells/SorollFocSvg";

/**
 * Simulació a escala real (per imprimir o desar en PDF) de la trama de punts de
 * la resposta del cartell de Foc: 6 requadres de 4×4 cm, tots un tros del mateix
 * cartell (la cantonada inferior esquerra del triangle 🜂), amb diferents radis
 * de punt i densitats. Hereta el layout de /pantalles (404 en producció).
 */
const MM_PER_UNITAT = 168 / 1000; // el dibuix fa 168 mm d'ample al cartell A4 (VistaCartells)
const COSTAT_MM = 40;
const COSTAT_UNITATS = COSTAT_MM / MM_PER_UNITAT;
// Cantonada inferior esquerra del triangle, perquè hi surtin la vora, el buit de dins i el fons.
const X0 = 250;
const Y0 = 235;

const RADIS = [0.1, 0.5, 1.0];
/** Augment de densitat respecte de l'actual (0 = l'actual, 1 = +100%). */
const AUGMENTS = [0, 1];

const CASOS = AUGMENTS.flatMap((augment) => RADIS.map((radi) => ({ augment, radi })));

export default function SorollFocSimulacioPage() {
  return (
    <div className="bg-white p-[12mm] text-black">
      <style>{`
        @page { size: A4; margin: 0; }
        html, body { background: #fff !important; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>
      <h1 className="text-[13pt] font-bold">Simulació · trama de punts del símbol 🜂 (escala real)</h1>
      <p className="mb-[8mm] text-[9pt]">
        Cada requadre és de 4×4 cm: un tros real del cartell A4 (cantonada inferior esquerra del triangle). Mateixa composició; només canvia el radi del punt i la densitat. Densitat
        100% = l&apos;actual (distància entre punts {PAS_PUNTS_OBJECTIU} unitats).
      </p>
      <div className="grid grid-cols-3 gap-x-[8mm] gap-y-[10mm]" style={{ width: `${COSTAT_MM * 3 + 16}mm` }}>
        {CASOS.map(({ augment, radi }) => {
          const pas = PAS_PUNTS_OBJECTIU / Math.sqrt(1 + augment);
          const soroll = generaSoroll({ resposta: "", simbolObjectiu: "foc", ...opcionsSoroll("imatge"), radiPunts: radi, pasPunts: pas });
          return (
            <figure key={`${augment}-${radi}`}>
              <div className="relative overflow-hidden border border-black" style={{ width: `${COSTAT_MM}mm`, height: `${COSTAT_MM}mm` }}>
                <SorollFocSvg
                  soroll={soroll}
                  className="absolute max-w-none"
                />
                <style>{`
                  figure:nth-of-type(${CASOS.findIndex((c) => c.augment === augment && c.radi === radi) + 1}) svg {
                    width: ${soroll.amplada * MM_PER_UNITAT}mm; height: ${soroll.alcada * MM_PER_UNITAT}mm;
                    left: ${-X0 * MM_PER_UNITAT}mm; top: ${-Y0 * MM_PER_UNITAT}mm;
                  }
                `}</style>
              </div>
              <figcaption className="mt-[1.5mm] text-[8pt] leading-tight">
                <b>
                  {String.fromCharCode(65 + CASOS.findIndex((c) => c.augment === augment && c.radi === radi))}
                </b>{" "}
                · radi {radi} ({(radi * MM_PER_UNITAT).toFixed(2)} mm) · densitat {100 * (1 + augment)}%
                <br />
                distància entre punts {pas.toFixed(2)} u ({(pas * MM_PER_UNITAT).toFixed(2)} mm)
              </figcaption>
            </figure>
          );
        })}
      </div>
      <p className="mt-[6mm] text-[8pt]">Requadre: {COSTAT_UNITATS.toFixed(0)}×{COSTAT_UNITATS.toFixed(0)} unitats SVG.</p>
    </div>
  );
}
