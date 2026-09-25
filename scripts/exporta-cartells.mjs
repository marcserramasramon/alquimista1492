// Exporta els cartells de /master/cartells com a fitxers HTML autònoms
// (CSS, tipografies i imatges incrustats, sense JavaScript), un per fita i un
// amb tots, per obrir-los i imprimir-los sense el servidor.
//
// Ús (amb `npm run dev` engegat):
//   node scripts/exporta-cartells.mjs https://adreca-publica.app [llavor] [--fons]
//
// Amb --fons exporta la versió amb la il·lustració de fons a cartells-html/fons/.
//
// L'adreça és la que codifiquen els QR (la de producció, no localhost).
// Porten els codis de les fites: la carpeta de sortida no es puja al git.

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { SignJWT } from "jose";
import QRCode from "qrcode";

const args = process.argv.slice(2);
const fons = args.includes("--fons");
const [base = "", llavor] = args.filter((a) => a !== "--fons");
const SERVIDOR = process.env.SERVIDOR ?? "http://localhost:3000";
const SORTIDA = fons ? "cartells-html/fons" : "cartells-html";

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

const query = new URLSearchParams({ ...(llavor ? { llavor } : {}), ...(fons ? { estil: "fons" } : {}) });
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
// Imatges de fons (estil inline dels cartells amb --fons).
for (const [sencer, src] of [...main.matchAll(/url\((\/[^)]+)\)/g)]) {
  main = main.replaceAll(sencer, `url(${await aDataUri(src)})`);
}

// Classes de tipografia de next/font, que van a <html>.
const classesHtml = html.match(/<html[^>]*class="([^"]*)"/)?.[1] ?? "";

// Separa els cartells i hi posa el QR amb l'adreça pública.
const cartells = [...main.matchAll(/<section data-fita="([^"]+)"[\s\S]*?<\/footer><\/div><\/section>/g)];
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
  const codi = seccio.match(/font-mono[^>]*>([A-Z0-9]+)</)?.[1];
  const qr = await QRCode.toString(`${netBase}/s/${id}?c=${codi}`, {
    type: "svg",
    errorCorrectionLevel: "Q",
    margin: 2,
    color: { dark: "#1b1511", light: "#ffffff" },
  });
  const ambQr = seccio.replace(/(<div class="h-full w-full[^"]*">)<svg[\s\S]*?<\/svg>/, `$1${qr}`);
  totes.push(ambQr);
  writeFileSync(`${SORTIDA}/cartell-${id}.html`, pagina(`Cartell ${id}`, [ambQr]));
  console.log(`✓ ${SORTIDA}/cartell-${id}.html  (${netBase}/s/${id}?c=${codi})`);
}
writeFileSync(`${SORTIDA}/cartells-tots.html`, pagina("Cartells de les fites", totes));
console.log(`✓ ${SORTIDA}/cartells-tots.html`);
