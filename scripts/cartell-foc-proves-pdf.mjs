// PDF de prova de colors del cartell de Foc: pàgina 1 (número en 3 blaus), pàgina 2 (soroll en
// 3 proporcions de taronja fosc : taronja clar : groc) i pàgines 3-11 (el cartell amb cada combinació).
//
// Ús (amb el servidor de desenvolupament en marxa; la ruta només existeix en dev):
//   node scripts/cartell-foc-proves-pdf.mjs               -> cartells-pdf/cartell-foc-proves.pdf
//   node scripts/cartell-foc-proves-pdf.mjs combinacions  -> cartells-pdf/cartell-foc-combinacions.pdf
//                                                           (un sol full apaïsat amb les 9 combinacions)
//   node scripts/cartell-foc-proves-pdf.mjs invertit      -> cartells-pdf/cartell-foc-invertit.pdf
//                                                           (número taronja/groc i soroll en 3 blaus)
//   node scripts/cartell-foc-proves-pdf.mjs punts         -> cartells-pdf/cartell-foc-punts.pdf
//                                                           (densitat i radi dels punts del número, soroll blau 3:2:1)
//   node scripts/cartell-foc-proves-pdf.mjs real          -> cartells-pdf/cartell-foc-real.pdf
//                                                           (el cartell A4 a mida real, número groc, 2 versions: radi 3,95 densitat 20% i radi 4,1 densitat 15%)
//   node scripts/cartell-foc-proves-pdf.mjs groc          -> cartells-pdf/cartell-foc-groc.pdf
//                                                           (número groc, 2 densitats x 3 radis, soroll blau 3:2:1, 3:1:1 i 2:2:1)
//
//   node scripts/cartell-foc-proves-pdf.mjs seleccio     -> cartells-pdf/cartell-foc-seleccio.pdf
//                                                           (formes, només 5/20%, 5/15%, 4/25% i 3/33%)
//
//   node scripts/cartell-foc-proves-pdf.mjs seleccio-invertit -> cartells-pdf/cartell-foc-seleccio-invertit.pdf
//                                                           (el mateix amb els colors invertits: número blau fosc, soroll taronja/groc)
//
//   node scripts/cartell-foc-proves-pdf.mjs interseccio   -> cartells-pdf/cartell-foc-interseccio.pdf
//                                                           (colors invertits, 3/20% i 5/15%, el número només on s'encreua amb el soroll)
//
//   node scripts/cartell-foc-proves-pdf.mjs rodons        -> cartells-pdf/cartell-foc-rodons.pdf
//                                                           (número groc, soroll blau, només rodons: 3/25%, 3/20%, 2,6/25% i 2,6/30%)
//
//   node scripts/cartell-foc-proves-pdf.mjs rodons-invertit -> cartells-pdf/cartell-foc-rodons-invertit.pdf
//                                                           (el mateix amb els colors invertits: número blau fosc, soroll taronja/groc)
//
//   node scripts/cartell-foc-proves-pdf.mjs rodons-invertit 2-20,2-15 -> les combinacions que es vulguin (mida-densitat en %),
//                                                           a cartells-pdf/cartell-foc-rodons-invertit-2_20_2_15.pdf
//
// Surt a cartells-pdf/. Porta el número i el codi de la fita: no es puja al git.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const SERVIDOR = process.env.SERVIDOR ?? "http://localhost:3000";
const CHROME = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => p && existsSync(p));
if (!CHROME) {
  console.error("No trobo Chrome ni Edge. Indica'n el camí amb la variable CHROME.");
  process.exit(1);
}

mkdirSync("cartells-pdf", { recursive: true });
const VARIANTS = { combinacions: "cartell-foc-combinacions", invertit: "cartell-foc-invertit", punts: "cartell-foc-punts", groc: "cartell-foc-groc", real: "cartell-foc-real", imatges: "cartell-foc-imatges", triangles: "cartell-foc-triangles", formes: "cartell-foc-formes" };
// "seleccio": la pàgina de formes només amb 4 combinacions (mida-densitat en %), amb el mateix fons.
const interseccio = process.argv[2] === "interseccio";
const rodonsInvertit = process.argv[2] === "rodons-invertit";
const rodons = process.argv[2] === "rodons" || rodonsInvertit;
const invertit = process.argv[2] === "seleccio-invertit" || interseccio || rodonsInvertit;
const seleccio = process.argv[2] === "seleccio" || invertit || rodons;
// Un tercer argument (p. ex. "2-20,2-15", mida-densitat en %) en lloc de les combinacions per defecte.
const SELECCIO = process.argv[3] ?? (process.argv[2] === "interseccio" ? "3-20,5-15" : rodons ? "3-25,3-20,2.6-25,2.6-30" : "5-20,5-15,4-25,3-33");
const nom = seleccio ? "cartell-foc-formes" : (VARIANTS[process.argv[2]] ?? "cartell-foc-proves");
const sortida = rodonsInvertit ? "cartell-foc-rodons-invertit" : rodons ? "cartell-foc-rodons" : interseccio ? "cartell-foc-interseccio" : invertit ? "cartell-foc-seleccio-invertit" : seleccio ? "cartell-foc-seleccio" : nom;
const sufix = process.argv[3] ? `-${process.argv[3].replaceAll(/[^0-9a-z]+/g, "_")}` : "";
const pdf = resolve("cartells-pdf", `${sortida}${sufix}.pdf`);
execFileSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=20000",
    `--print-to-pdf=${pdf}`,
    `${SERVIDOR}/pantalles/${nom}${seleccio ? `?c=${SELECCIO}${invertit ? "&inv=1" : ""}${interseccio ? "&mask=1" : ""}${rodons ? "&rodons=1" : ""}` : ""}`,
  ],
  { stdio: "ignore" },
);
console.log(`✓ ${pdf}`);
