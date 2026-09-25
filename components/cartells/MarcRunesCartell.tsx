import { GLIFS_RUNES, INSCRIPCIO_RUNES } from "@/components/ui/runes";

/**
 * Sanefa de runes del joc d'alquímia (components/ui/MarcRunes.tsx), versió per a paper:
 * quieta i calculada per a un full A4, sense JavaScript, perquè surti igual a la impressió i als
 * HTML exportats. Unitats en mil·límetres.
 */

const AMPLE = 210;
const ALT = 297;
/** El camí de les runes passa a aquesta distància de la vora del full. */
const CAMI_MM = 11;
/** Alçada de les runes. */
const ALCADA_MM = 6.2;
const SEPARACIO_MM = 1.6;
/** Línia exterior de tinta, com la vora de la taula del joc. */
const LINIA_EXTERIOR_MM = 5;
/** Línia interior, com la línia daurada del joc: tanca la banda de runes. */
export const LINIA_INTERIOR_MM = CAMI_MM + 6;

const R = 4;
const [X0, Y0, X1, Y1] = [CAMI_MM, CAMI_MM, AMPLE - CAMI_MM, ALT - CAMI_MM];
const TRAMS_RECTES = [X1 - X0 - 2 * R, Y1 - Y0 - 2 * R];
const ARC = (Math.PI * R) / 2;
const LLARGADA = 2 * (TRAMS_RECTES[0] + TRAMS_RECTES[1]) + 4 * ARC;

/** Punt i angle (graus) a la distància `s` del camí, en sentit horari des de dalt a l'esquerra. */
function puntCami(s: number): [number, number, number] {
  const [amp, alt] = TRAMS_RECTES;
  // Trams: dalt, cantonada, dreta, cantonada, baix, cantonada, esquerra, cantonada.
  const trams: [number, (t: number) => [number, number, number]][] = [
    [amp, (t) => [X0 + R + t, Y0, 0]],
    [ARC, (t) => arc(X1 - R, Y0 + R, -90, t)],
    [alt, (t) => [X1, Y0 + R + t, 90]],
    [ARC, (t) => arc(X1 - R, Y1 - R, 0, t)],
    [amp, (t) => [X1 - R - t, Y1, 180]],
    [ARC, (t) => arc(X0 + R, Y1 - R, 90, t)],
    [alt, (t) => [X0, Y1 - R - t, 270]],
    [ARC, (t) => arc(X0 + R, Y0 + R, 180, t)],
  ];
  for (const [llarg, punt] of trams) {
    if (s <= llarg) return punt(s);
    s -= llarg;
  }
  return [X0 + R, Y0, 0];
}

function arc(cx: number, cy: number, inici: number, t: number): [number, number, number] {
  const a = inici + (t / ARC) * 90;
  const rad = (a * Math.PI) / 180;
  return [cx + R * Math.cos(rad), cy + R * Math.sin(rad), a + 90];
}

/** Posició de cada runa, repetint la inscripció fins a tancar el contorn sense forat. */
const RUNES = (() => {
  const escala = ALCADA_MM / 100;
  const frase = [...INSCRIPCIO_RUNES].map((ch) => GLIFS_RUNES[ch]);
  const llargadaFrase = frase.reduce((s, g) => s + g.amplada * escala + SEPARACIO_MM, 0);
  const repeticions = Math.max(1, Math.round(LLARGADA / llargadaFrase));
  const estirar = LLARGADA / (repeticions * llargadaFrase);

  const runes: { d: string; transform: string }[] = [];
  let s = 0;
  for (let i = 0; i < repeticions; i++) {
    for (const g of frase) {
      const pas = (g.amplada * escala + SEPARACIO_MM) * estirar;
      const [x, y, angle] = puntCami(s + pas / 2);
      runes.push({
        d: g.d,
        // La runa, centrada al camí i dreta cap a fora del full (la base, cap a dins).
        transform: `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(1)}) translate(${(
          (-g.amplada * escala) /
          2
        ).toFixed(2)} ${(ALCADA_MM / 2).toFixed(2)}) scale(${escala})`,
      });
      s += pas;
    }
  }
  return runes;
})();

const L = LINIA_INTERIOR_MM;

/**
 * `fons`: sota la sanefa hi ha una il·lustració; la banda es pinta de paper perquè les runes es llegeixin.
 */
export function MarcRunesCartell({ color, fons = false }: { color: string; fons?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${AMPLE} ${ALT}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {fons && (
        <path
          fillRule="evenodd"
          fill="#f3e5c4"
          fillOpacity={0.92}
          d={`M0 0H${AMPLE}V${ALT}H0Z M${L + 3} ${L}H${AMPLE - L - 3}A3 3 0 0 1 ${AMPLE - L} ${L + 3}V${ALT - L - 3}A3 3 0 0 1 ${
            AMPLE - L - 3
          } ${ALT - L}H${L + 3}A3 3 0 0 1 ${L} ${ALT - L - 3}V${L + 3}A3 3 0 0 1 ${L + 3} ${L}Z`}
        />
      )}
      <rect
        x={LINIA_EXTERIOR_MM}
        y={LINIA_EXTERIOR_MM}
        width={AMPLE - 2 * LINIA_EXTERIOR_MM}
        height={ALT - 2 * LINIA_EXTERIOR_MM}
        rx={6}
        fill="none"
        stroke="#1b1511"
        strokeWidth={0.9}
      />
      <g fill={color}>
        {RUNES.map((r, i) => (
          <path key={i} d={r.d} transform={r.transform} />
        ))}
      </g>
      <rect
        x={L}
        y={L}
        width={AMPLE - 2 * L}
        height={ALT - 2 * L}
        rx={3}
        fill="none"
        stroke={color}
        strokeOpacity={0.5}
        strokeWidth={0.5}
      />
    </svg>
  );
}
