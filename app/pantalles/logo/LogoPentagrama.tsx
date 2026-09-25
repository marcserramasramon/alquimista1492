"use client";

import { useRef, useState, type ReactNode } from "react";
import { ELEMENTS, type Element } from "@/content/public/estacions";

/** "transparent" o un color hexadecimal. */
const FONS_TRIABLES = [
  { nom: "Crema", valor: "#fbf4e4" },
  { nom: "Negre pur (OLED)", valor: "#000000" },
  { nom: "Matèria fosca", valor: "#111625" },
  { nom: "Blau nit", valor: "#0b132b" },
  { nom: "Transparent", valor: "transparent" },
];
const LINIES_TRIABLES = [
  { nom: "Tinta", valor: "#1b1511" },
  { nom: "Or", valor: "#eab308" },
  { nom: "Or vell", valor: "#c9a24a" },
  { nom: "Pergamí", valor: "#e9d5a6" },
  { nom: "Blanc", valor: "#ffffff" },
];
const MIDES_PNG = [
  { mida: 1024, nom: "icon-1024.png" },
  { mida: 512, nom: "icon-512.png" },
  { mida: 192, nom: "icon-192.png" },
  { mida: 180, nom: "icon-apple.png" },
];

const CENTRES = {
  pedra: { nom: "Pedra del Gresol (GIF)", src: "/images/pedra-gresol.gif" },
  "gemma-blava": { nom: "Gemma blava", src: "/images/logo/gemma-blava.webp" },
  "gemma-colors": { nom: "Gemma de colors", src: "/images/logo/gemma-colors.webp" },
  "diamant-lila": { nom: "Diamant lila", src: "/images/logo/diamant-lila.webp" },
  "cristall-lila": { nom: "Cristall lila", src: "/images/logo/cristall-lila.webp" },
  "pentagon-colors": { nom: "Pentàgon de colors", src: "/images/logo/pentagon-colors.webp" },
  "pentagon-lila": { nom: "Pentàgon (vora lila)", src: "/images/logo/pentagon-lila.webp" },
  "pentagon-vermell": { nom: "Pentàgon (vora vermella)", src: "/images/logo/pentagon-vermell.webp" },
  "pentagon-blau": { nom: "Pentàgon blau (sense vora)", src: "/images/logo/pentagon-blau.webp" },
  "pentagon-blau-vermell": { nom: "Pentàgon blau (vora vermella)", src: "/images/logo/pentagon-blau-vermell.webp" },
  "cristall-iris-vora": { nom: "Cristall iris (amb vora)", src: "/images/logo/cristall-iris-vora.webp" },
  "cristall-iris": { nom: "Cristall iris (sense vora)", src: "/images/logo/cristall-iris.webp" },
  cap: { nom: "Sense gemma", src: null },
} as const;
type Centre = keyof typeof CENTRES;

// Mateixa geometria que components/ui/Pentagrama.tsx.
const MIDA = 300;
const C = MIDA / 2;
const R_NODE = 100;
const R_ANELL = 136;
const R_ANELL_INTERIOR = R_ANELL - 24;
const ORDRE: Element[] = ["aigua", "terra", "foc", "aire", "anima"];
/** A l'app, el cercle beix de la pedra fa 29 de radi per a una imatge de 67.7. */
const PROPORCIO_CERCLE_PEDRA = 29 / 67.7;

interface Config {
  centre: Centre;
  midaGemma: number;
  /** "cercle": boles de color; "icona": com a l'app (cercle blanc, vora de color i icona). */
  estilElements: "cercle" | "icona";
  radiElements: number;
  ambText: boolean;
  midaText: number;
  linies: string;
  gruixAnellExterior: number;
  gruixAnellInterior: number;
  gruixEstrella: number;
  /** En %. */
  opacitatEstrella: number;
  estrellaDiscontinua: boolean;
}

/** Punts de partida de cada versió; després tot es pot ajustar. */
const VERSIONS = {
  logo: {
    nom: "Logo simplificat",
    config: {
      centre: "gemma-blava",
      midaGemma: 84,
      estilElements: "cercle",
      radiElements: 27,
      ambText: false,
      midaText: 13,
      linies: "#1b1511",
      gruixAnellExterior: 3,
      gruixAnellInterior: 3,
      gruixEstrella: 2,
      opacitatEstrella: 63,
      estrellaDiscontinua: false,
    },
  },
  app: {
    nom: "Pentagrama de l'app",
    config: {
      centre: "pedra",
      midaGemma: 67.7,
      estilElements: "icona",
      radiElements: 27,
      ambText: true,
      midaText: 13,
      linies: "#1b1511",
      gruixAnellExterior: 3,
      gruixAnellInterior: 1.5,
      gruixEstrella: 2,
      opacitatEstrella: 35,
      estrellaDiscontinua: true,
    },
  },
} as const satisfies Record<string, { nom: string; config: Config }>;
type Versio = keyof typeof VERSIONS;

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
      const url = regla.style.getPropertyValue("src").match(/url\(["']?([^"')]+)["']?\)/)?.[1];
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

function vertex(i: number) {
  const angle = ((-90 + i * 72) * Math.PI) / 180;
  return { x: C + R_NODE * Math.cos(angle), y: C + R_NODE * Math.sin(angle) };
}

function LogoSvg({ c }: { c: Config }) {
  const punts = ORDRE.map((_, i) => vertex(i));
  // Línia base del text: centrada entre els dos anells encara que canviï la mida.
  const rText = R_ANELL - 12 - (c.midaText - 13) * 0.35;
  const src = CENTRES[c.centre].src;
  return (
    <svg viewBox={`0 0 ${MIDA} ${MIDA}`} className="block w-full" role="img" aria-label="Logo: pentagrama">
      <defs>
        <path id="logo-anell-text" d={`M ${C} ${C - rText} a ${rText} ${rText} 0 1 1 -0.01 0`} />
      </defs>

      <circle cx={C} cy={C} r={R_ANELL} fill="none" stroke={c.linies} strokeWidth={c.gruixAnellExterior} />
      <circle cx={C} cy={C} r={R_ANELL_INTERIOR} fill="none" stroke={c.linies} strokeWidth={c.gruixAnellInterior} />
      {c.ambText && (
        <text
          fontFamily="var(--font-alegreya-sans-sc), sans-serif"
          fontWeight={700}
          fontSize={c.midaText}
          letterSpacing={3}
          fill="#5a4a3c"
        >
          <textPath href="#logo-anell-text" textLength={2 * Math.PI * rText - 6}>
            sentfores ✦ mcdlxxii ✦ sentfores ✦ mcdlxxii ✦
          </textPath>
        </text>
      )}

      {/* L'opacitat va al grup: així els encreuaments no es pinten dues vegades. */}
      <g opacity={c.opacitatEstrella / 100}>
        {punts.map((p, i) => {
          const q = punts[(i + 2) % punts.length];
          const guio = 3 * c.gruixEstrella;
          return (
            <line
              key={i}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke={c.linies}
              strokeWidth={c.gruixEstrella}
              strokeDasharray={c.estrellaDiscontinua ? `${guio} ${guio}` : undefined}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {c.centre === "pedra" && (
        <circle cx={C} cy={C} r={c.midaGemma * PROPORCIO_CERCLE_PEDRA} fill="#e9d5a6" />
      )}
      {src && (
        <image
          href={src}
          x={C - c.midaGemma / 2}
          y={C - c.midaGemma / 2}
          width={c.midaGemma}
          height={c.midaGemma}
        />
      )}

      {punts.map(({ x, y }, i) => {
        const element = ELEMENTS[ORDRE[i]];
        if (c.estilElements === "cercle") {
          return <circle key={ORDRE[i]} cx={x} cy={y} r={c.radiElements} fill={element.color} />;
        }
        const icona = c.radiElements * (34 / 27);
        return (
          <g key={ORDRE[i]}>
            <circle
              cx={x}
              cy={y}
              r={c.radiElements}
              fill="#fffdf7"
              stroke={element.color}
              strokeWidth={c.radiElements * (6 / 27)}
            />
            <image href={element.icona} x={x - icona / 2} y={y - icona / 2} width={icona} height={icona} />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Només el pentagrama, per exportar-lo com a logo de l'app dels jugadors.
 * Genera un SVG autònom (imatges i font incrustades) i PNGs a les mides de
 * les icones del manifest.
 */
export function LogoPentagrama() {
  const contenidor = useRef<HTMLDivElement>(null);
  const [versio, setVersio] = useState<Versio>("logo");
  const [config, setConfig] = useState<Config>(VERSIONS.logo.config);
  const [fons, setFons] = useState(FONS_TRIABLES[0].valor);
  const [marge, setMarge] = useState(6);
  const [radi, setRadi] = useState(22);
  const [treballant, setTreballant] = useState(false);

  function canviar<K extends keyof Config>(clau: K, valor: Config[K]) {
    setConfig((c) => ({ ...c, [clau]: valor }));
  }

  function triarVersio(v: Versio) {
    setVersio(v);
    setConfig(VERSIONS[v].config);
  }

  async function construirSvg(mida: number): Promise<string> {
    const original = contenidor.current?.querySelector("svg");
    if (!original) throw new Error("No hi ha pentagrama");
    const clon = original.cloneNode(true) as SVGSVGElement;

    // Imatges (centre i icones) incrustades com a data URL.
    await Promise.all(
      Array.from(clon.querySelectorAll("image")).map(async (img) => {
        const href = img.getAttribute("href");
        if (href && !href.startsWith("data:")) img.setAttribute("href", await urlADataUrl(href));
      }),
    );

    // La font de l'anell ve d'una variable CSS que fora de la pàgina no existeix.
    let estil = "";
    const text = clon.querySelector("text");
    if (text) {
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

    const rect = fons === "transparent" ? "" : `<rect width="${mida}" height="${mida}" rx="${r}" fill="${fons}"/>`;
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
  const select = "min-h-12 rounded-lg border-2 border-ink px-2";

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center gap-6 p-4">
      <h1 className="text-2xl font-bold">Logo: pentagrama</h1>

      <div
        className="grid aspect-square w-full max-w-sm place-items-center overflow-hidden"
        style={{
          background:
            fons === "transparent" ? "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0 / 20px 20px" : fons,
          borderRadius: `${radi}%`,
          padding: `${marge}%`,
        }}
      >
        <div ref={contenidor} className="w-full">
          <LogoSvg c={config} />
        </div>
      </div>

      <fieldset className="flex w-full flex-col gap-3 text-lg">
        <Fila titol="Versió">
          <select value={versio} onChange={(e) => triarVersio(e.target.value as Versio)} className={select}>
            {(Object.keys(VERSIONS) as Versio[]).map((v) => (
              <option key={v} value={v}>
                {VERSIONS[v].nom}
              </option>
            ))}
          </select>
        </Fila>

        <Seccio titol="Centre">
          <Fila titol="Gemma">
            <select
              value={config.centre}
              onChange={(e) => canviar("centre", e.target.value as Centre)}
              className={select}
            >
              {(Object.keys(CENTRES) as Centre[]).map((id) => (
                <option key={id} value={id}>
                  {CENTRES[id].nom}
                </option>
              ))}
            </select>
          </Fila>
          {config.centre !== "cap" && (
            <Slider titol="Mida" min={20} max={200} valor={config.midaGemma} onCanvi={(v) => canviar("midaGemma", v)} />
          )}
        </Seccio>

        <Seccio titol="Elements">
          <Fila titol="Estil">
            <select
              value={config.estilElements}
              onChange={(e) => canviar("estilElements", e.target.value as Config["estilElements"])}
              className={select}
            >
              <option value="cercle">Cercle de color</option>
              <option value="icona">Amb icona (app)</option>
            </select>
          </Fila>
          <Slider titol="Radi" min={5} max={50} valor={config.radiElements} onCanvi={(v) => canviar("radiElements", v)} />
        </Seccio>

        <Seccio titol="Anell">
          <Casella titol="Text de l'anell" valor={config.ambText} onCanvi={(v) => canviar("ambText", v)} />
          {config.ambText && (
            <Slider titol="Mida del text" min={8} max={24} valor={config.midaText} onCanvi={(v) => canviar("midaText", v)} />
          )}
          <Slider
            titol="Gruix exterior"
            min={0}
            max={12}
            pas={0.5}
            valor={config.gruixAnellExterior}
            onCanvi={(v) => canviar("gruixAnellExterior", v)}
          />
          <Slider
            titol="Gruix interior"
            min={0}
            max={12}
            pas={0.5}
            valor={config.gruixAnellInterior}
            onCanvi={(v) => canviar("gruixAnellInterior", v)}
          />
        </Seccio>

        <Seccio titol="Estrella">
          <Casella
            titol="Discontínua"
            valor={config.estrellaDiscontinua}
            onCanvi={(v) => canviar("estrellaDiscontinua", v)}
          />
          <Slider
            titol="Gruix"
            min={0.5}
            max={12}
            pas={0.5}
            valor={config.gruixEstrella}
            onCanvi={(v) => canviar("gruixEstrella", v)}
          />
          <Slider
            titol="Opacitat"
            unitat="%"
            min={5}
            max={100}
            valor={config.opacitatEstrella}
            onCanvi={(v) => canviar("opacitatEstrella", v)}
          />
        </Seccio>

        <Seccio titol="Colors">
          <TriaColor titol="Fons" opcions={FONS_TRIABLES} valor={fons} onCanvi={setFons} />
          <TriaColor
            titol="Línies"
            opcions={LINIES_TRIABLES}
            valor={config.linies}
            onCanvi={(v) => canviar("linies", v)}
          />
        </Seccio>

        <Seccio titol="Icona">
          <Slider titol="Marge" unitat="%" min={0} max={20} valor={marge} onCanvi={setMarge} />
          <Slider titol="Cantonades" unitat="%" min={0} max={50} valor={radi} onCanvi={setRadi} />
        </Seccio>
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

function Seccio({ titol, children }: { titol: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t-2 border-ink/15 pt-3">
      <h2 className="text-base font-bold uppercase tracking-wide opacity-70">{titol}</h2>
      {children}
    </div>
  );
}

function Fila({ titol, children }: { titol: string; children: ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-4">
      {titol}
      {children}
    </label>
  );
}

function Slider({
  titol,
  unitat = "",
  min,
  max,
  pas = 1,
  valor,
  onCanvi,
}: {
  titol: string;
  unitat?: string;
  min: number;
  max: number;
  pas?: number;
  valor: number;
  onCanvi: (valor: number) => void;
}) {
  return (
    <Fila titol={`${titol} ${valor}${unitat}`}>
      <input type="range" min={min} max={max} step={pas} value={valor} onChange={(e) => onCanvi(+e.target.value)} />
    </Fila>
  );
}

function Casella({ titol, valor, onCanvi }: { titol: string; valor: boolean; onCanvi: (valor: boolean) => void }) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-4">
      {titol}
      <input type="checkbox" className="size-6" checked={valor} onChange={(e) => onCanvi(e.target.checked)} />
    </label>
  );
}

/** Mostres de colors predefinits i un selector lliure. */
function TriaColor({
  titol,
  opcions,
  valor,
  onCanvi,
}: {
  titol: string;
  opcions: { nom: string; valor: string }[];
  valor: string;
  onCanvi: (valor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span>
        {titol}: <span className="font-mono text-base">{valor}</span>
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {opcions.map((o) => (
          <button
            key={o.valor}
            type="button"
            title={o.nom}
            aria-label={o.nom}
            aria-pressed={valor === o.valor}
            onClick={() => onCanvi(o.valor)}
            className={`size-12 rounded-lg border-2 ${valor === o.valor ? "border-ink ring-4 ring-amber-400" : "border-ink/40"}`}
            style={{
              background:
                o.valor === "transparent"
                  ? "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0 / 12px 12px"
                  : o.valor,
            }}
          />
        ))}
        <label className="flex min-h-12 items-center gap-2 text-base">
          Altre
          <input
            type="color"
            value={valor === "transparent" ? "#ffffff" : valor}
            onChange={(e) => onCanvi(e.target.value)}
            className="h-12 w-14 cursor-pointer rounded-lg border-2 border-ink/40"
          />
        </label>
      </div>
    </div>
  );
}
