// Genera public/icons/{icon-192,icon-512,icon-maskable-512,apple-touch-icon}.png
// a partir d'una imatge font, retallant el marc negre de cantonada arrodonida
// (si n'hi ha) i deixant marge de seguretat a la versió maskable.
//
// Ús: node scripts/generate-icons.mjs <path-a-imatge-font>
import { chromium } from 'playwright'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(dir, '..', 'public', 'icons')
const sourceImage = process.argv[2]
if (!sourceImage) {
  console.error('Ús: node scripts/generate-icons.mjs <path-a-imatge-font>')
  process.exit(1)
}

const PARCHMENT = '#F4EBD9'

const targets = [
  { file: 'icon-192.png', size: 192, mode: 'crop', frameInsetFrac: 0.05 },
  { file: 'icon-512.png', size: 512, mode: 'crop', frameInsetFrac: 0.05 },
  { file: 'icon-maskable-512.png', size: 512, mode: 'pad', frameInsetFrac: 0.05, marginFrac: 0.12, bg: PARCHMENT },
  { file: 'apple-touch-icon.png', size: 180, mode: 'crop', frameInsetFrac: 0.05 },
]

const CROP_HTML = `<!doctype html>
<html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:#000}canvas{display:block}</style>
</head><body>
<canvas id="c" width="512" height="512"></canvas>
<script>
window.renderIcon = function (imgEl, opts) {
  const canvas = document.getElementById('c')
  const ctx = canvas.getContext('2d')
  const w = imgEl.naturalWidth
  const h = imgEl.naturalHeight
  const frameInset = Math.round(Math.min(w, h) * opts.frameInsetFrac)
  const sx = frameInset, sy = frameInset, sw = w - frameInset * 2, sh = h - frameInset * 2
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (opts.mode === 'pad') {
    ctx.fillStyle = opts.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const margin = Math.round(canvas.width * opts.marginFrac)
    const destSize = canvas.width - margin * 2
    ctx.drawImage(imgEl, sx, sy, sw, sh, margin, margin, destSize, destSize)
  } else {
    ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  }
}
</script>
</body></html>`

const workDir = mkdtempSync(path.join(tmpdir(), 'traidor-icons-'))
const htmlPath = path.join(workDir, 'crop.html')
writeFileSync(htmlPath, CROP_HTML)

const browser = await chromium.launch()
try {
  for (const t of targets) {
    const page = await browser.newPage({ viewport: { width: t.size, height: t.size } })
    await page.goto('file://' + htmlPath.replace(/\\/g, '/'))
    await page.evaluate(async (opts) => {
      const canvas = document.getElementById('c')
      canvas.width = opts.size
      canvas.height = opts.size
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = 'file://' + opts.src
      })
      window.renderIcon(img, opts)
    }, { ...t, src: path.resolve(sourceImage).replace(/\\/g, '/') })
    const outPath = path.join(outDir, t.file)
    await page.locator('#c').screenshot({ path: outPath })
    await page.close()
    console.log('wrote', outPath)
  }
} finally {
  await browser.close()
  rmSync(workDir, { recursive: true, force: true })
}
