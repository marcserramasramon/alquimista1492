// Exporta els cartells de /master/cartells com a fitxers HTML autònoms
// (CSS, tipografies i imatges incrustats, sense JavaScript), un per fita i un
// amb tots, per obrir-los i imprimir-los sense el servidor.
//
// Ús (amb `npm run dev` engegat):
//   node scripts/exporta-cartells.mjs https://adreca-publica.app [llavor] [--fons]
//
// Amb --fons exporta la versió amb la il·lustració de fons a cartells-html/fons/, i amb
// --propaganda els cartells per anunciar el joc (sense QR ni codi) a cartells-html/propaganda/,
// i amb --lema els mateixos amb una sola frase per element a cartells-html/lema/.
//
// Cada exportació refà cartells-html/index.html: una pàgina per veure totes les fites i tots
// els cartells exportats (miniatures de cada versió, per obrir-los o imprimir-los).
//
// L'adreça és la que codifiquen els QR (la de producció, no localhost).
// Porten els codis de les fites: la carpeta de sortida no es puja al git.

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { SignJWT } from "jose";
import QRCode from "qrcode";

const args = process.argv.slice(2);
const variant = ["lema", "propaganda", "fons"].find((v) => args.includes(`--${v}`)) ?? null;
const [base = "", llavor] = args.filter((a) => !a.startsWith("--"));
const SERVIDOR = process.env.SERVIDOR ?? "http://localhost:3000";
const SORTIDA = variant ? `cartells-html/${variant}` : "cartells-html";

if (!/^https?:\/\//.test(base)) {
  console.error("Cal l'adreça pública per als QR: node scripts/exporta-cartells.mjs https://...");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);

const token = await new SignJWT({ role: "master" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("5m")
  .sign(new TextEncoder().encode(env.MASTER_SESSION_SECRET));

async function porta(ruta) {
  const res = await fetch(new URL(ruta, SERVIDOR), { headers: { cookie: `v2_master=${token}` }, redirect: "manual" });
  if (!res.ok) throw new Error(`${ruta}: ${res.status}`);
  return res;
}

const aDataUri = async (ruta) => {
  const res = await porta(ruta);
  const tipus = res.headers.get("content-type")?.split(";")[0] ?? "application/octet-stream";
  return `data:${tipus};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
};

const query = new URLSearchParams({ ...(llavor ? { llavor } : {}), ...(variant ? { estil: variant } : {}) });
let html = await (await porta(`/master/cartells?${query}`)).text();

// CSS: tots els fulls d'estil, amb les url() (tipografies) incrustades.
let css = "";
for (const [, href] of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) {
  let full = await (await porta(href)).text();
  for (const [sencer, url] of [...full.matchAll(/url\((?!["']?(?:data:|#|%23))["']?([^"')]+)["']?\)/g)]) {
    full = full.replaceAll(sencer, `url(${await aDataUri(new URL(url, new URL(href, SERVIDOR)).pathname)})`);
  }
  css += full + "\n";
}

// Només el contingut dels cartells (sense la capçalera de pantalla ni scripts).
const inici = html.indexOf("<main");
const fi = html.indexOf("</main>") + "</main>".length;
let main = html.slice(inici, fi).replace(/<header[\s\S]*?<\/header>/, "");

for (const [sencer, src] of [...main.matchAll(/src="(\/[^"]+)"/g)]) {
  main = main.replaceAll(sencer, `src="${await aDataUri(src.replaceAll("&amp;", "&"))}"`);
}
// Imatges dins d'SVG (p. ex. el pentagrama de la portada).
for (const [sencer, src] of [...main.matchAll(/href="(\/[^"]+\.(?:gif|png|webp|jpg|svg))"/g)]) {
  main = main.replaceAll(sencer, `href="${await aDataUri(src)}"`);
}
// Imatges de fons (estil inline dels cartells amb --fons).
for (const [sencer, src] of [...main.matchAll(/url\((\/[^)]+)\)/g)]) {
  main = main.replaceAll(sencer, `url(${await aDataUri(src)})`);
}

// Classes de tipografia de next/font, que van a <html>.
const classesHtml = html.match(/<html[^>]*class="([^"]*)"/)?.[1] ?? "";

// Separa els cartells i hi posa el QR amb l'adreça pública.
const cartells = [...main.matchAll(/<section data-fita="([^"]+)"[\s\S]*?<\/section>/g)];
const estil = main.match(/<style>[\s\S]*?<\/style>/)?.[0] ?? "";
// L'etiqueta <main> original porta la classe de la tipografia del text (next/font).
const obertura = main.match(/<main[^>]*>/)?.[0] ?? "<main>";
const netBase = base.replace(/\/$/, "");

const pagina = (titol, seccions) => `<!doctype html>
<html lang="ca" class="${classesHtml}">
<head>
<meta charset="utf-8">
<title>${titol}</title>
<style>${css}</style>
</head>
<body class="text-ink antialiased">
${obertura}
${estil}
<div class="flex w-full flex-col items-center gap-8 print:block">
${seccions.join("\n")}
</div>
</main>
</body>
</html>
`;

mkdirSync(SORTIDA, { recursive: true });
const totes = [];
for (const [seccio, id] of cartells) {
  // Els de propaganda no porten codi ni QR.
  const codi = seccio.match(/font-mono[^>]*>([A-Z0-9]+)</)?.[1];
  let ambQr = seccio;
  if (codi) {
    const qr = await QRCode.toString(`${netBase}/s/${id}?c=${codi}`, {
      type: "svg",
      errorCorrectionLevel: "Q",
      margin: 2,
      color: { dark: "#1b1511", light: "#ffffff" },
    });
    ambQr = seccio.replace(/(<div class="h-full w-full[^"]*">)<svg[\s\S]*?<\/svg>/, `$1${qr}`);
  }
  totes.push(ambQr);
  writeFileSync(`${SORTIDA}/cartell-${id}.html`, pagina(`Cartell ${id}`, [ambQr]));
  console.log(`✓ ${SORTIDA}/cartell-${id}.html${codi ? `  (${netBase}/s/${id}?c=${codi})` : ""}`);
}
writeFileSync(`${SORTIDA}/cartells-tots.html`, pagina("Cartells de les fites", totes));
console.log(`✓ ${SORTIDA}/cartells-tots.html`);

// --- Índex: cartells-html/index.html amb totes les versions exportades --------------------------

const VERSIONS = [
  { carpeta: ".", nom: "Cartell de joc", nota: "amb il·lustració, QR i codi" },
  { carpeta: "fons", nom: "Cartell de joc amb fons", nota: "il·lustració de fons, QR i codi" },
  { carpeta: "propaganda", nom: "Propaganda", nota: "sense codis, amb el text" },
  { carpeta: "lema", nom: "Propaganda amb lema", nota: "sense codis, una sola frase" },
];
const FITES = ["portada", "portada-cami-lluny", "portada-frare", "portada-cami-buit", "font-ferro", "planes-bones", "foc", "aire", "anima"];
const NOMS_PORTADES = {
  portada: "Portada · mapa i pentagrama",
  "portada-cami-lluny": "Portada · el camí amb el frare lluny",
  "portada-frare": "Portada · el frare de prop",
  "portada-cami-buit": "Portada · el camí buit",
};
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/** Nom de l'element, lloc i color de cada fita, llegits del cartell de joc exportat. */
function infoFita(id) {
  if (NOMS_PORTADES[id]) return { titol: NOMS_PORTADES[id], lloc: "Els Guardians del Secret de Sentfores", color: "#8a6300" };
  for (const v of VERSIONS) {
    const fitxer = `cartells-html/${v.carpeta}/cartell-${id}.html`;
    if (!existsSync(fitxer)) continue;
    // React separa els trossos de text amb <!-- -->.
    const html = readFileSync(fitxer, "utf8").replace(/<!-- -->/g, "").replace(/&#x27;/g, "'");
    const color = html.match(/--el:(#[0-9a-f]{6})/i)?.[1] ?? "#1b1511";
    const joc = html.match(/<h1[^>]*>Fita ([^<]+)<\/h1><p[^>]*>([^<]+)<\/p>/);
    if (joc) return { titol: joc[1].replace(/^(de l'|de la |del )/, "").replace(/^./, (c) => c.toUpperCase()), lloc: joc[2], color };
    const prop = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (prop) return { titol: prop[1], lloc: "", color };
  }
  return { titol: id, lloc: "", color: "#1b1511" };
}

const files = FITES.map((id) => {
  const info = infoFita(id);
  const miniatures = VERSIONS.map((v) => {
    const ruta = `${v.carpeta === "." ? "" : v.carpeta + "/"}cartell-${id}.html`;
    if (!existsSync(`cartells-html/${ruta}`)) return "";
    return `<figure><a href="${ruta}" target="_blank" class="mini"><iframe src="${ruta}" loading="lazy" tabindex="-1" title="${esc(v.nom)}"></iframe></a>
      <figcaption><strong>${esc(v.nom)}</strong><span>${esc(v.nota)}</span><a href="${ruta}" target="_blank">Obrir ↗</a></figcaption></figure>`;
  }).join("");
  if (!miniatures) return "";
  return `<section style="--el:${info.color}"><h2>${esc(info.titol)}</h2>${info.lloc ? `<p class="lloc">${esc(info.lloc)}</p>` : ""}<div class="fila">${miniatures}</div></section>`;
}).join("");

const totsLinks = VERSIONS.filter((v) => existsSync(`cartells-html/${v.carpeta}/cartells-tots.html`))
  .map((v) => `<a href="${v.carpeta === "." ? "" : v.carpeta + "/"}cartells-tots.html" target="_blank">${esc(v.nom)} · tots ↗</a>`).join("");

writeFileSync("cartells-html/index.html", `<!doctype html>
<html lang="ca"><head><meta charset="utf-8"><title>Cartells de les fites</title>
<style>
  body { margin: 0; padding: 24px; background: #f3e5c4; color: #1b1511; font-family: Georgia, serif; }
  h1 { margin: 0 0 4px; font-size: 32px; } .intro { margin: 0 0 16px; color: #5a4a3c; }
  .tots { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
  .tots a, figcaption a { color: #1b1511; background: #eab308; border: 2px solid #1b1511; border-radius: 10px; padding: 6px 12px; text-decoration: none; font-weight: bold; font-family: system-ui, sans-serif; font-size: 14px; }
  section { margin-bottom: 28px; padding: 16px; background: #fbf4e4; border: 3px solid #1b1511; border-left: 12px solid var(--el); border-radius: 16px; }
  h2 { margin: 0; font-size: 26px; color: var(--el); } .lloc { margin: 2px 0 12px; color: #5a4a3c; font-family: system-ui, sans-serif; }
  .fila { display: flex; flex-wrap: wrap; gap: 18px; }
  figure { margin: 0; width: 230px; }
  .mini { display: block; width: 230px; height: 325px; overflow: hidden; border: 2px solid #1b1511; border-radius: 8px; background: #e9d5a6; }
  .mini iframe { width: 820px; height: 1160px; border: 0; transform: scale(0.28); transform-origin: 0 0; pointer-events: none; }
  figcaption { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; font-family: system-ui, sans-serif; font-size: 14px; }
  figcaption span { color: #5a4a3c; } figcaption a { align-self: flex-start; font-size: 13px; padding: 3px 10px; }
</style></head><body>
<h1>Cartells de les fites</h1>
<p class="intro">Totes les versions exportades, fita per fita. Clica una miniatura per obrir el cartell (i imprimir-lo amb Ctrl+P, A4, sense marges i amb els gràfics de fons). Els cartells de joc porten els codis de les fites: no els compartiu.</p>
<div class="tots">${totsLinks}</div>
${files}
</body></html>
`);
console.log("✓ cartells-html/index.html");
