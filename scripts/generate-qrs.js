const fs = require('fs')
const path = require('path')
const QRCode = require('qrcode')

const outputDir = path.join(__dirname, '..', 'public', 'qr')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Configurable base URL (fallback to relative / standard path)
const baseUrl = process.env.BASE_URL || 'https://traidor-guixa.vercel.app'

const STATIONS = [
  {
    id: 'serrat-bruixes',
    file: 'cartell-01-serrat-bruixes',
    number: 1,
    title: 'Serrat de les Bruixes',
    subtitle: 'El Codi de Fogueres',
    path: '/s/serrat-bruixes',
  },
  {
    id: 'font-ferro',
    file: 'cartell-02-font-ferro',
    number: 2,
    title: 'Font del Ferro',
    subtitle: "Tinta i Torns d'Aigua",
    path: '/s/font-ferro',
  },
  {
    id: 'planes-bones',
    file: 'cartell-03-planes-bones',
    number: 3,
    title: 'Planes Bones',
    subtitle: 'La Ronda de la Patrulla',
    path: '/s/planes-bones',
  },
  {
    id: 'clau-forja',
    file: 'objecte-pedra-can-vinyals',
    number: 3.5,
    title: 'Pedra Gran de Can Vinyals',
    subtitle: 'La Clau de la Forja (Objecte Perdut)',
    path: '/s/clau-forja',
  },
  {
    id: 'cementiri',
    file: 'cartell-04-cementiri',
    number: 4,
    title: 'Cementiri de la Guixa',
    subtitle: 'La Signatura del Difunt',
    path: '/s/cementiri',
  },
  {
    id: 'pla-masset',
    file: 'cartell-05-pla-masset',
    number: 5,
    title: 'Pla del Masset',
    subtitle: "Control de l'Emissari / Acusació",
    path: '/s/pla-masset',
  },
  {
    id: 'caixa-almoines',
    file: 'cartell-06-rectoria',
    number: 6,
    title: 'Rectoria',
    subtitle: 'La Clau de les Almoines',
    path: '/s/caixa-almoines',
  },
]

const TEAMS = [
  { code: 'EQUIP1', name: 'Els Sometents', file: 'equip-01-sometents' },
  { code: 'EQUIP2', name: 'Els Bandolers', file: 'equip-02-bandolers' },
  { code: 'EQUIP3', name: 'Els Bruixots', file: 'equip-03-bruixots' },
  { code: 'EQUIP4', name: 'La Guixa Alta', file: 'equip-04-guixa-alta' },
  { code: 'EQUIP5', name: 'La Guixa Baixa', file: 'equip-05-guixa-baixa' },
  { code: 'EQUIP6', name: 'El Serrat', file: 'equip-06-serrat' },
  { code: 'EQUIP7', name: 'Els Moliners', file: 'equip-07-moliners' },
  { code: 'EQUIP8', name: 'Els Carboners', file: 'equip-08-carboners' },
]

async function generateAll() {
  console.log(`Generant codis QR amb base URL: ${baseUrl}...`)

  // 1. Estacions
  for (const st of STATIONS) {
    const targetUrl = `${baseUrl}${st.path}`
    const svgPath = path.join(outputDir, `${st.file}.svg`)
    const pngPath = path.join(outputDir, `${st.file}.png`)

    // SVG
    const svgString = await QRCode.toString(targetUrl, {
      type: 'svg',
      width: 600,
      margin: 2,
      color: { dark: '#1c1917', light: '#ffffff' },
    })
    fs.writeFileSync(svgPath, svgString)

    // PNG
    await QRCode.toFile(pngPath, targetUrl, {
      width: 600,
      margin: 2,
      color: { dark: '#1c1917', light: '#ffffff' },
    })

    console.log(`✓ Estació ${st.number} (${st.title}): ${st.file}.svg / .png`)
  }

  // 2. Equips
  for (const t of TEAMS) {
    const targetUrl = `${baseUrl}/e/${t.code}`
    const svgPath = path.join(outputDir, `${t.file}.svg`)
    const pngPath = path.join(outputDir, `${t.file}.png`)

    const svgString = await QRCode.toString(targetUrl, {
      type: 'svg',
      width: 600,
      margin: 2,
      color: { dark: '#1c1917', light: '#ffffff' },
    })
    fs.writeFileSync(svgPath, svgString)

    await QRCode.toFile(pngPath, targetUrl, {
      width: 600,
      margin: 2,
      color: { dark: '#1c1917', light: '#ffffff' },
    })

    console.log(`✓ Equip ${t.code} (${t.name}): ${t.file}.svg / .png`)
  }

  console.log(`\nTots els fitxers generats correctament a: ${outputDir}`)
}

generateAll().catch((err) => {
  console.error('Error generant QRs:', err)
  process.exit(1)
})
