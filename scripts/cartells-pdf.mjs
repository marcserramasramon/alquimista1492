// Converteix els cartells exportats (cartells-html/) en PDF A4 per imprimir, amb el Chrome
// instal·lat en mode sense finestra: text vectorial, imatges a la mida original, fons i
// colors inclosos i sense capçaleres ni peus del navegador.
//
// Ús (després de scripts/exporta-cartells.mjs):
//   node scripts/cartells-pdf.mjs
//
// Surt a cartells-pdf/ amb les mateixes carpetes. Porta els codis de les fites: no es puja al git.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

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

const ORIGEN = "cartells-html";
const DESTI = "cartells-pdf";

let fets = 0;
for (const carpeta of [".", "fons", "propaganda", "lema"]) {
  const dir = join(ORIGEN, carpeta);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
  const sortida = join(DESTI, carpeta);
  mkdirSync(sortida, { recursive: true });

  for (const fitxer of readdirSync(dir).filter((f) => f.startsWith("cartell") && f.endsWith(".html"))) {
    const pdf = resolve(sortida, fitxer.replace(/\.html$/, ".pdf"));
    execFileSync(
      CHROME,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        // Espera que es carreguin les tipografies i les imatges incrustades abans d'imprimir.
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=20000",
        `--print-to-pdf=${pdf}`,
        pathToFileURL(resolve(dir, fitxer)).href,
      ],
      { stdio: "ignore" },
    );
    console.log(`✓ ${join(sortida, fitxer.replace(/\.html$/, ".pdf"))}`);
    fets++;
  }
}
console.log(`${fets} PDF a ${DESTI}/`);
