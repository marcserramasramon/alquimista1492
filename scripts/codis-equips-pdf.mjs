// Genera un PDF A4 amb el QR, el codi i el logo de cada equip (els 25 equips de content/public/equips.ts).
// Els codis són els mateixos que calcula lib/codiEquip.ts (HMAC de cada slug amb PASS_SECRET),
// i els QR apunten a `<adreça>/e/<codi>`, igual que a /master/equips.
//
// Ús:
//   node scripts/codis-equips-pdf.mjs https://adreca-publica.app
//
// Surt a codis-equips/codis-equips.pdf (i el HTML intermedi a codis-equips/codis-equips.html).
// Porta els codis dels equips: la carpeta de sortida no es puja al git.

import { createHmac } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import QRCode from "qrcode";

const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Cal l'adreça pública per als QR: node scripts/codis-equips-pdf.mjs https://...");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
if (!env.PASS_SECRET) {
  console.error("Falta PASS_SECRET a .env.local");
  process.exit(1);
}

// Mateix algorisme que lib/codiEquip.ts.
const ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function codiDeSlug(slug) {
  const bytes = createHmac("sha256", env.PASS_SECRET).update(`equip-codi:${slug}`).digest();
  return Array.from(bytes.subarray(0, 8), (b) => ALFABET[b % ALFABET.length]).join("");
}

// Llegeix la llista d'equips de content/public/equips.ts (és TypeScript, així que es parseja el text).
const equipsTs = readFileSync("content/public/equips.ts", "utf8");
const equips = [...equipsTs.matchAll(/\{ id: "([^"]+)", nom: "([^"]+)", imatge: "([^"]+)" \}/g)].map(
  ([, id, nom, imatge]) => ({ id, nom, imatge }),
);
if (equips.length === 0) {
  console.error("No he trobat cap equip a content/public/equips.ts");
  process.exit(1);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const targetes = [];
for (const e of equips) {
  const codi = codiDeSlug(e.id);
  const qr = await QRCode.toString(`${base}/e/${codi}`, {
    type: "svg",
    errorCorrectionLevel: "Q",
    margin: 2,
    color: { dark: "#1b1511", light: "#ffffff" },
  });
  const logoPath = resolve("public", e.imatge.replace(/^\//, ""));
  const logo = existsSync(logoPath)
    ? `data:image/svg+xml;base64,${readFileSync(logoPath).toString("base64")}`
    : null;
  targetes.push({ nom: e.nom, codi, qr: qr.replace(/<\?xml[^>]*>/, ""), logo });
}

const cos = targetes
  .map(
    (t) => `<section class="targeta">
  <div class="logo">${t.logo ? `<img src="${t.logo}" alt="">` : ""}</div>
  <p class="nom">${esc(t.nom)}</p>
  <div class="qr">${t.qr}</div>
  <p class="codi">${t.codi}</p>
</section>`,
  )
  .join("\n");

const html = `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<title>Codis dels equips</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #1b1511; background: #fff; }
  .graella { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
  .targeta {
    height: 90mm; border: 0.6mm solid #1b1511; border-radius: 4mm;
    display: flex; flex-direction: column; align-items: center; justify-content: space-between;
    padding: 4mm; break-inside: avoid; text-align: center;
  }
  .logo { height: 26mm; display: flex; align-items: center; justify-content: center; }
  .logo img { width: 26mm; height: 26mm; object-fit: contain; }
  .nom { margin: 0; font-size: 11pt; font-weight: 700; line-height: 1.2; min-height: 2.6em; display: flex; align-items: center; }
  .qr { width: 40mm; height: 40mm; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .codi { margin: 0; font-family: "Courier New", monospace; font-size: 16pt; font-weight: 800; letter-spacing: 0.2em; }
  .pagina { break-after: page; }
</style>
</head>
<body>
<main class="graella">
${cos}
</main>
</body>
</html>`;

const sortida = resolve("codis-equips");
mkdirSync(sortida, { recursive: true });
const fitxerHtml = resolve(sortida, "codis-equips.html");
const fitxerPdf = resolve(sortida, "codis-equips.pdf");
writeFileSync(fitxerHtml, html, "utf8");

const CHROME = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => p && existsSync(p));
if (!CHROME) {
  console.error(`HTML fet a ${fitxerHtml}, però no trobo Chrome ni Edge per fer el PDF. Indica'n el camí amb CHROME.`);
  process.exit(1);
}

execFileSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=10000",
    `--print-to-pdf=${fitxerPdf}`,
    pathToFileURL(fitxerHtml).href,
  ],
  { stdio: "ignore" },
);
console.log(`✓ ${equips.length} equips a ${fitxerPdf}`);
