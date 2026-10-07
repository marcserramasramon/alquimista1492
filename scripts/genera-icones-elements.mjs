/**
 * Genera les icones de "fita resolta" dels cinc elements (símbols alquímics 🜄 🜃 🜂 🜁 🜔)
 * a public/images/elements/{id}-resolta.svg.
 *
 *   node scripts/genera-icones-elements.mjs
 *
 * Medalló rodó gravat: contorn fosc, filet daurat, disc del color de l'element, símbol crema
 * i segell verd amb ✓. Els colors són els de ELEMENTS (content/public/estacions.ts).
 * Les fites que encara no estan resoltes continuen amb la icona de sempre (ELEMENTS.icona).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "elements");

const INK = "#24170d";
const CREAM = "#f6e9c8";
const GOLD = "#d9a93a";
const GREEN = "#1f7a3a";
/** Gruix del contorn fosc exterior (unitats sobre 256); el disc arriba fins a r=128. */
const CONTORN = 7;
const COLORS = { aigua: "#1d6fd6", terra: "#5b8a1e", foc: "#e8541f", aire: "#0e9bb8", anima: "#8b3fb5" };

const UP = "M128 56 L198 180 L58 180 Z";
const DN = "M58 76 L198 76 L128 200 Z";
const SHAPES = {
  foc: { closed: UP, open: "" },
  aigua: { closed: DN, open: "" },
  aire: { closed: UP, open: "M42 142 H214" },
  terra: { closed: DN, open: "M42 114 H214" },
  anima: { closed: "M178 128 A50 50 0 1 0 78 128 A50 50 0 1 0 178 128Z", open: "M40 128 H216" },
};

const draw = (id, w, col) => {
  const s = SHAPES[id];
  return (
    `<path d="${s.closed}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="miter" stroke-miterlimit="10"/>` +
    (s.open ? `<path d="${s.open}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="butt"/>` : "")
  );
};
const circ = (r, attrs) => `<circle cx="128" cy="128" r="${r}" ${attrs}/>`;

const resolta = (id, c) => `<defs>
    <clipPath id="c"><circle cx="128" cy="128" r="103"/></clipPath>
    <pattern id="h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="${INK}" stroke-width="1.6" opacity=".22"/></pattern>
    <linearGradient id="s" x1="0" x2="1"><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>
  </defs>
  ${circ(128, `fill="${INK}"`)}${circ(128 - CONTORN, `fill="${GOLD}"`)}${circ(103, `fill="${c}"`)}
  <g clip-path="url(#c)"><rect width="256" height="256" fill="url(#h)"/><rect width="256" height="256" fill="url(#s)"/>
  <g transform="translate(128 128) scale(.94) translate(-128 -128)"><path d="${SHAPES[id].closed}" fill="#fff" fill-opacity=".16" stroke="none"/>${draw(id, 26, INK)}${draw(id, 14, CREAM)}</g></g>
  ${circ(103, `fill="none" stroke="${INK}" stroke-width="4"`)}
  <g transform="translate(205 205)"><circle r="39" fill="${GREEN}" stroke="${INK}" stroke-width="7"/><path d="M-18 1 L-5 14 L19 -13" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></g>`;

fs.mkdirSync(OUT, { recursive: true });
for (const [id, color] of Object.entries(COLORS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">\n  ${resolta(id, color)}\n</svg>\n`;
  fs.writeFileSync(path.join(OUT, `${id}-resolta.svg`), svg);
}
console.log(`Icones generades a ${OUT}`);
