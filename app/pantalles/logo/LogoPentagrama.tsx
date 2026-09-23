"use client";

import { useRef, useState } from "react";
import { Pentagrama } from "@/components/ui/Pentagrama";

const FONS_CREMA = "#fbf4e4";
const MIDES_PNG = [
  { mida: 1024, nom: "icon-1024.png" },
  { mida: 512, nom: "icon-512.png" },
  { mida: 192, nom: "icon-192.png" },
  { mida: 180, nom: "icon-apple.png" },
];

type Fons = "crema" | "transparent";

function llegirComDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function urlADataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  return llegirComDataUrl(await res.blob());
}

/**
 * Busca la @font-face que next/font ha generat per a la família i la retorna
 * amb el fitxer incrustat, perquè el text de l'anell surti igual a l'SVG exportat.
 */
async function fontFaceIncrustada(familia: string): Promise<string> {
  const nom = familia.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
  for (const full of Array.from(document.styleSheets)) {
    let regles: CSSRuleList;
    try {
      regles = full.cssRules;
    } catch {
      continue;
    }
    for (const regla of Array.from(regles)) {
      if (!(regla instanceof CSSFontFaceRule)) continue;
      const fam = regla.style.getPropertyValue("font-family").replace(/['"]/g, "").trim();
      if (fam !== nom) continue;
      // next/font parteix la font en subconjunts; només ens cal el llatí bàsic.
      const rang = regla.style.getPropertyValue("unicode-range");
      if (rang && !/^U\+0+-FF\b/i.test(rang)) continue;
      const src = regla.style.getPropertyValue("src");
      const url = src.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
      if (!url) continue;
      const dades = await urlADataUrl(new URL(url, full.href ?? location.href).href);
      return `@font-face{font-family:'${nom}';font-weight:700;src:url(${dades}) format('woff2');}`;
    }
  }
  return "";
}

function descarregar(href: string, nom: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = nom;
  a.click();
}

/**
 * Només el pentagrama, per exportar-lo com a logo de l'app dels jugadors.
 * Genera un SVG autònom (imatges i font incrustades) i PNGs a les mides de
 * les icones del manifest.
 */
export function LogoPentagrama() {
  const contenidor = useRef<HTMLDivElement>(null);
  const [fons, setFons] = useState<Fons>("crema");
  const [marge, setMarge] = useState(6);
  const [radi, setRadi] = useState(22);
  const [ambText, setAmbText] = useState(true);
  const [treballant, setTreballant] = useState(false);

  async function construirSvg(mida: number): Promise<string> {
    const original = contenidor.current?.querySelector("svg");
    if (!original) throw new Error("No hi ha pentagrama");
    const clon = original.cloneNode(true) as SVGSVGElement;

    // Imatges (icones d'element i pedra del gresol) incrustades com a data URL.
    await Promise.all(
      Array.from(clon.querySelectorAll("image")).map(async (img) => {
        const href = img.getAttribute("href");
        if (href && !href.startsWith("data:")) img.setAttribute("href", await urlADataUrl(href));
      }),
    );

    // La font de l'anell ve d'una variable CSS que fora de la pàgina no existeix.
    let estil = "";
    const text = clon.querySelector("text");
    if (text && !ambText) {
      text.remove();
    } else if (text) {
      const familia = getComputedStyle(document.body).getPropertyValue("--font-alegreya-sans-sc").trim();
      if (familia) {
        text.setAttribute("font-family", `${familia}, sans-serif`);
        estil = await fontFaceIncrustada(familia);
      }
    }

    const interior = mida * (1 - (2 * marge) / 100);
    const desplacament = (mida - interior) / 2;
    const r = (mida * radi) / 100;
    clon.removeAttribute("class");
    clon.setAttribute("x", String(desplacament));
    clon.setAttribute("y", String(desplacament));
    clon.setAttribute("width", String(interior));
    clon.setAttribute("height", String(interior));

    const rect = fons === "crema" ? `<rect width="${mida}" height="${mida}" rx="${r}" fill="${FONS_CREMA}"/>` : "";
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
      `width="${mida}" height="${mida}" viewBox="0 0 ${mida} ${mida}">` +
      (estil ? `<style>${estil}</style>` : "") +
      rect +
      new XMLSerializer().serializeToString(clon) +
      `</svg>`
    );
  }

  async function exportarSvg() {
    setTreballant(true);
    try {
      const svg = await construirSvg(512);
      descarregar(URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })), "logo-pentagrama.svg");
    } finally {
      setTreballant(false);
    }
  }

  async function exportarPng(mida: number, nom: string) {
    setTreballant(true);
    try {
      const svg = await construirSvg(mida);
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = mida;
      canvas.height = mida;
      canvas.getContext("2d")!.drawImage(img, 0, 0, mida, mida);
      URL.revokeObjectURL(url);
      descarregar(canvas.toDataURL("image/png"), nom);
    } finally {
      setTreballant(false);
    }
  }

  const boto =
    "min-h-12 rounded-xl border-2 border-ink bg-white px-4 font-semibold text-ink disabled:opacity-50";

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center gap-6 p-4">
      <h1 className="text-2xl font-bold">Logo: pentagrama</h1>

      <div
        className="grid aspect-square w-full max-w-sm place-items-center overflow-hidden"
        style={{
          background:
            fons === "crema"
              ? FONS_CREMA
              : "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0 / 20px 20px",
          borderRadius: `${radi}%`,
          padding: `${marge}%`,
        }}
      >
        <div ref={contenidor} className={`w-full ${ambText ? "" : "[&_text]:hidden"}`}>
          <Pentagrama vius />
        </div>
      </div>

      <fieldset className="flex w-full flex-col gap-3 text-lg">
        <label className="flex items-center justify-between gap-4">
          Fons
          <select
            value={fons}
            onChange={(e) => setFons(e.target.value as Fons)}
            className="min-h-12 rounded-lg border-2 border-ink px-2"
          >
            <option value="crema">Crema</option>
            <option value="transparent">Transparent</option>
          </select>
        </label>
        <label className="flex items-center justify-between gap-4">
          Marge {marge}%
          <input type="range" min={0} max={20} value={marge} onChange={(e) => setMarge(+e.target.value)} />
        </label>
        <label className="flex items-center justify-between gap-4">
          Cantonades {radi}%
          <input type="range" min={0} max={50} value={radi} onChange={(e) => setRadi(+e.target.value)} />
        </label>
        <label className="flex min-h-12 items-center justify-between gap-4">
          Text de l&apos;anell
          <input type="checkbox" className="size-6" checked={ambText} onChange={(e) => setAmbText(e.target.checked)} />
        </label>
      </fieldset>

      <div className="flex w-full flex-wrap gap-3">
        <button className={boto} disabled={treballant} onClick={exportarSvg}>
          SVG
        </button>
        {MIDES_PNG.map(({ mida, nom }) => (
          <button key={mida} className={boto} disabled={treballant} onClick={() => exportarPng(mida, nom)}>
            PNG {mida}
          </button>
        ))}
      </div>
      <p className="text-sm opacity-70">
        Per a la icona «maskable» d&apos;Android, deixa almenys un 10% de marge i cantonades a 0%.
      </p>
    </main>
  );
}
