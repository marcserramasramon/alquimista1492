import type { CSSProperties } from "react";
import { GLIFS_RUNES, INSCRIPCIO_RUNES } from "@/components/ui/runes";

/**
 * Cinta de runes (mateixa inscripció que `components/cartells/MarcRunesCartell.tsx`) per als
 * marges laterals de la landing (`/anunci`). Va dins la graella de `app/anunci/page.tsx`
 * (columna 1 o 3) i ocupa totes les files: amb `subgrid`, cada fila de la cinta fa exactament
 * l'alçada de la seva secció i en pren el color, amb un degradat curt a l'inici de cada una.
 * Les runes són una màscara SVG que es repeteix i es desplaça (puja per l'esquerra, baixa per
 * la dreta), així que no cal mesurar res amb JS.
 */

/** Amplada del marge lateral on viu la cinta. */
export const AMPLE_CINTA = 24;
/** Amplada de les runes dins el marge. */
const AMPLE_RUNES = 16;
/** Separació entre glifs, en unitats de glif (alçada 100). */
const SEPARACIO = 30;
/** Alçada de la franja d'un glif (base a y=100, amb una mica de marge per sota). */
const ALT_GLIF = 108;
/** Llargada del degradat quan canvia el color d'una secció a la següent. */
const DEGRADAT = 72;
/** Velocitat de la cinta, en píxels per segon. */
const VELOCITAT = 28;

const glifs: string[] = [];
let llarg = 0;
for (const ch of INSCRIPCIO_RUNES) {
  const g = GLIFS_RUNES[ch];
  glifs.push(`<path transform="translate(${llarg.toFixed(1)} 100)" d="${g.d}"/>`);
  llarg += g.amplada + SEPARACIO;
}

/** Tessel·la vertical: la inscripció girada, amb la part de dalt de les runes cap a fora. */
function tessella(costat: "esquerra" | "dreta") {
  const gir = costat === "dreta" ? `translate(${ALT_GLIF} 0) rotate(90)` : `translate(0 ${llarg.toFixed(1)}) rotate(-90)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ALT_GLIF} ${llarg.toFixed(1)}"><g transform="${gir}">${glifs.join("")}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Alçada en píxels d'una tessel·la un cop escalada a l'amplada de la cinta. */
const ALT_TESSELLA = Math.round((llarg * AMPLE_RUNES) / ALT_GLIF);
const DURADA = ALT_TESSELLA / VELOCITAT;

const CSS = `
@keyframes cinta-puja {
  from { -webkit-mask-position: 50% 0; mask-position: 50% 0; }
  to { -webkit-mask-position: 50% -${ALT_TESSELLA}px; mask-position: 50% -${ALT_TESSELLA}px; }
}
@keyframes cinta-baixa {
  from { -webkit-mask-position: 50% 0; mask-position: 50% 0; }
  to { -webkit-mask-position: 50% ${ALT_TESSELLA}px; mask-position: 50% ${ALT_TESSELLA}px; }
}
.cinta-runes {
  -webkit-mask-repeat: repeat-y; mask-repeat: repeat-y;
  -webkit-mask-size: ${AMPLE_RUNES}px ${ALT_TESSELLA}px; mask-size: ${AMPLE_RUNES}px ${ALT_TESSELLA}px;
  -webkit-mask-position: 50% 0; mask-position: 50% 0;
}
.cinta-esquerra { animation: cinta-puja ${DURADA.toFixed(1)}s linear infinite; }
.cinta-dreta { animation: cinta-baixa ${DURADA.toFixed(1)}s linear infinite; }
@media (prefers-reduced-motion: reduce) { .cinta-runes { animation: none; } }
`;

export function CintaRunesEstils() {
  return <style>{CSS}</style>;
}

export function CintaRunes({ costat, colors }: { costat: "esquerra" | "dreta"; colors: string[] }) {
  const mascara = tessella(costat);
  const estil: CSSProperties = {
    gridColumn: costat === "esquerra" ? 1 : 3,
    gridRow: `1 / ${colors.length + 1}`,
    display: "grid",
    gridTemplateRows: "subgrid",
    maskImage: mascara,
    WebkitMaskImage: mascara,
  };
  return (
    <div aria-hidden className={`cinta-runes cinta-${costat} pointer-events-none`} style={estil}>
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            background: i === 0 ? color : `linear-gradient(to bottom, ${colors[i - 1]}, ${color} ${DEGRADAT}px)`,
          }}
        />
      ))}
    </div>
  );
}
