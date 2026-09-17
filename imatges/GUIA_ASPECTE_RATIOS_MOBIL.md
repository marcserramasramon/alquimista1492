# GUIA: ASPECTE RATIOS I RESPONSIVE DESIGN PER MÒBIL
## El Traïdor de la Guixa

**Versió:** 1.0 | **Data:** 17 de setembre de 2026  
**Context:** Joc jugat 100% en MÒBIL (375×812 px, iPhone SE standard), portrait only

---

## PREFACI: Per Què és Crític

**El joc es juga en mòbil a ple sol, amb una mà, sotto estrès.**

- Viewport estàndard: **375×812 px** (iPhone SE, Pixel 4a)
- Orientació: **Portrait ONLY** (no landscape)
- Safe area: **Notch + Home bar** (20–34 px top/bottom)
- Contrast requerít: **WCAG AA mínimo** (llegibilitat exterior)
- Touch targets: **Mínimo 48×48 px** (botons, icones)
- Llegibilitat: **Text base 16px mínimo**

**Errors comuns a evitar:**
- ❌ Imatge 16:9 que es veu comprimida en mòbil (text ilegible)
- ❌ Zoom manual necessari per veure pista (gameplay lent)
- ❌ Scroll horitzontal (usuari perso, perd context)
- ❌ Safe area ignorada (text covat per notch)
- ❌ Imatge alta resolució que mata performance (càrrega lenta)

---

## I. VIEWPORT I SAFE AREAS

### Dimensions Estàndard

```
DEVICE: iPhone SE / Pixel 4a
────────────────────────────────────
Viewport Width:  375 px
Viewport Height: 812 px
Aspect Ratio:    375:812 ≈ 9:19.5 (ull vertical)

Safe Area (Portrait):
├─ Top:          20 px (status bar) + 0 px (no notch iPhone SE)
│                34 px (Notch/Dynamic Island iPhone 14+)
├─ Bottom:       34 px (Home bar) o 0 px (Android con back button)
└─ Sides:        0 px (full width)

Usable Area:
├─ Width:        375 px (full)
└─ Height:       812 - 20 (top) - 34 (bottom) = 758 px
```

### Breakpoints (Responsive)

```
Mobile:   320–480 px  (iPhone 5/SE primera generació)
Mobile+:  375–600 px  (iPhone SE, Pixel 4a) ← NOSTRE TARGET
Tablet:   768–1024 px (iPad, no es juga aquí)
Desktop:  1200+ px    (no suportat, joc físic mòbil només)
```

**Per a dissenyer imatges: usar SEMPRE 375×Y com base mínima.**

---

## II. ASPECTE RATIOS PER CAS D'ÚS

### A) **Cartells Físics (A2 Impressió)**

| Cas d'Ús | Aspect Ratio | Dimensions | Renderització Mòbil |
|----------|--------------|------------|---------------------|
| **Cartell A2 Física** | 2:3 (landscape) | 420×594 mm (300 dpi) | N/A (impressió) |
| **QR dins Cartell** | 1:1 | 5×5 cm (50×50 mm) | N/A |

**Nota:** Els cartells físics no es ven en mòbil; es fotografien i es mostren com context. Però quan el jugador escaneja QR, arriba a la webapp.

**Per a webapp despres de QR:** Veure secció "Cartell Digital Inside App".

---

### B) **Webapp: Hero Banner (Capdamunt Pantalla)**

| Cas d'Ús | Aspect Ratio | Mòbil 375×812 | Recomendació |
|----------|--------------|---------------|--------------|
| **Header/Cronometre** | Custom | 375×140 px | Fixa (no scroll) |
| **Scene Background** | 16:9 (desktop) | **9:16 (mòbil)** | Retallar vertical, NO strech |

**Problema si usem 16:9:**
```
Mòbil 375px width:
  16:9 → 375×210 px (cronometre + títol, OK)
  PERÒ si la imatge és hero que ocupa 60% pantalla:
    375×312 px (massa espai, poca altura per contingut inferior)
```

**Solució recomanada:**

```
Génerer dues versions:
1. Desktop Hero:   16:9  (per a web desktop)
2. Mobile Hero:    9:16  (per a webapp mòbil) ← PRIMÀRIA

Markup Next.js:
  <picture>
    <source media="(min-width: 768px)" srcSet="/images/hero-16-9.jpg" />
    <img src="/images/hero-9-16.jpg" alt="..." />
  </picture>
```

**Alternativa simple (1 sola imatge):**

Usar **1:1 quadrat** com a compromís:
- Desktop: centra, marges laterals beige
- Mòbil: full width, sense wasted space

```
Aspecte Ratio Recomanat per Hero: 1:1 QUADRAT
Dimensió Mòbil: 375×375 px
Escala Desktop: CSS width: 100%; max-width: 600px;
```

---

### C) **Webapp: Imatge d'Item (Inventari, Evidència)**

| Cas d'Ús | Aspect Ratio | Mòbil | Desktop | Comportament |
|----------|--------------|--------|---------|--------------|
| **Carta/Document** | 3:4 (portrait) | 280×370 px | 400×533 px | Tap → full screen zoom |
| **Retrat Personatge** | 3:4 | 240×320 px | 300×400 px | Tap → full screen |
| **Icona UI** | 1:1 | 48×48 px | 64×64 px | No zoom (fixa) |
| **Segell de Lacre** | 1:1 | 120×120 px | 200×200 px | Tap → zoom 2× |
| **Mapa Interactiu** | 1:1 o custom | 330×330 px (grid) | 600×600 px | Pinch-zoom + pan |

**Zoom Behavior:**

```
Mòbil (375×812):
├─ Item es mostra petit (280×370 px per document)
├─ Usuari TAP → fullscreen modal
│  └─ Modal image: min(100vw, 375px) × auto (mantén aspect ratio)
│  └─ Permet pinch-zoom si necessita detall (pista)
└─ Swipe ← / → per navegar entre items (opcional, luxe)
```

---

### D) **Webapp: Document/Pergamí (Scroll Vertical)**

| Cas d'Ús | Aspect Ratio | Mòbil Visible | Total Height | Scroll |
|----------|--------------|---------------|--------------|--------|
| **Carta Bernat** | 3:4 | 375×500 px | 800×1000 px | Vertical |
| **Nota Capità** | Custom | 375×280 px | 400×300 px | No scroll |
| **Declaració Rector** | 3:4 | 375×500 px | 800×600 px | Vertical |

**Pattern Recomanat per Documents:**

```
<div className="modal">
  <div className="modal-image-container">
    <img 
      src="/document.jpg" 
      alt="..." 
      style={{
        width: "375px",        // full mòbil width - 2×16px margin
        height: "auto",        // mantén aspect ratio
        maxHeight: "600px",    // mòbil 812-210 (header) = ~600px
        overflowY: "scroll"    // scroll si més gran
      }}
    />
  </div>
</div>
```

**Per a imatge 800×1000 px (3:4):**
- Mòbil mostra: 375×500 px (50% de la imatge visible)
- Usuari scroll down → veu la resta
- Text legible si mínimo 16px (verifica en imatge generada)

---

### E) **Webapp: Mapa Interactiu (SVG o Canvas)**

| Cas d'Ús | Aspect Ratio | Mòbil | Comportament |
|----------|--------------|--------|-------------|
| **Mapa Guixa** | 1:1 | 330×330 px | Pinch-zoom + pan |
| **Planes Bones Grid** | 1:1 | 330×330 px | Tap caselles + highlight |
| **Ruta Patrulla** | 1:1 o 4:3 | 320×320 o 320×240 | Traçar camí (canvas) |

**Implementació Recomanada:**

```jsx
// Mapa SVG amb zoom
<div style={{
  width: "100%",
  maxWidth: "375px",
  aspectRatio: "1/1",
  overflow: "hidden",
  touchAction: "manipulation"  // Enable pinch-zoom
}}>
  <svg viewBox="0 0 600 600" width="100%" height="100%">
    {/* SVG content, escalable */}
  </svg>
</div>

// Canvas per a traçar camí (Planes Bones)
<canvas 
  width="330" 
  height="330" 
  style={{maxWidth: "100%", height: "auto"}}
/>
```

**Touch Interactions:**

- **Pinch-zoom:** Doble tap zoom 2×, tres dits zoom 1×
- **Pan:** Drag quan zoomat
- **Tap:** Selecciona casella, highlight color or state

---

### F) **Webapp: Icones UI (Botons, Navegació)**

| Cas d'Ús | Aspecte Ratio | Mida | Escala |
|----------|--------------|------|--------|
| **Icona Botó (MAPA, QUADERN, etc)** | 1:1 | 48×48 px | Fixa (no zoom) |
| **Icona Central (ESCANEJA QR / JOC)** | 1:1 | 60×60 px | Fixa (no zoom) |
| **Icona Element (FOC, AIGUA, etc)** | 1:1 | 32×32 px | Fixa |
| **Logo / Marca** | Custom | 200×50 px | Responsive (max-width 90vw) |

**Criteris:**

- ✅ Mínimo 48×48 px per a botons tactils
- ✅ 1:1 quadrat (SVG o PNG, crisp sense scalat)
- ✅ Sense text dins (text en label secundari)
- ✅ Contrast WCAG AAA (negre text sobre or vell: #1a1a1a sobre #D4AF37)

**Markup:**

```jsx
<button 
  className="nav-button"
  style={{
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    backgroundColor: "#4A3728",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}
  aria-label="Mapa"
>
  <img src="/icons/map-48.png" alt="" width="32" height="32" />
</button>
```

---

## III. ASPECTE RATIO TAULA GLOBAL

### Per Cada Imatge de la LLISTA (Complet)

| ID | Categoria | Cas d'Ús | Mòbil AR | Mòbil PX | Desktop AR | Format | Zoom? |
|----|-----------|----------|---------|----------|------------|--------|-------|
| 1 | Cartell | Física A2 | N/A | N/A | 2:3 | Print (300dpi) | N/A |
| 7 | Scene | Hero Background | 9:16 | 375×667 | 16:9 | PNG | No |
| 8 | Scene | Narrativa | 9:16 | 375×667 | 16:9 | PNG | No |
| 17 | Document | Carta Bernat | 3:4 | 375×500 | 3:4 | PNG | **Tap zoom** |
| 18 | Document | Carta Falsa | 3:4 | 375×500 | 3:4 | PNG | **Tap zoom** |
| 19 | Document | Nota Capità | Custom | 375×280 | Custom | PNG | No |
| 28–32 | Icon | UI Buttons | 1:1 | 48×48 | 1:1 | PNG | No |
| 35 | Map | Guixa | 1:1 | 330×330 | 1:1 | SVG | **Pinch zoom** |
| 36 | Map | Planes Bones | 1:1 | 330×330 | 1:1 | SVG | **Tap interact** |

---

## IV. GUIA DE GENERACIÓ IA (Considerant Mòbil)

### Quan Genereu amb Midjourney/Flux

**Paràmetres Midjourney:**

```
Per a Hero Banner (mòbil 9:16):
  /imagine --ar 9:16 --niji 6 --stylize 200 [prompt]

Per a Document Portrait (3:4):
  /imagine --ar 3:4 --quality 2 --niji 6 [prompt]

Per a Item Quadrat (1:1):
  /imagine --ar 1:1 --quality 2 [prompt]

Per a Mapa (1:1):
  /imagine --ar 1:1 --quality 2 --style raw [prompt]
```

**Negative Prompts (Add per a Mòbil):**

```
--niji "avoid: text size too small, centered composition that leaves white space, 
aspect ratio mismatch, fonts unreadable at 375px, disproportionate margins"
```

---

## V. CHECKLIST: IMATGE MÒBIL-READY

Per CADA imatge generada, validar:

```
☐ Aspect Ratio correcte (16:9, 3:4, 1:1, etc.)
☐ Text readable a 375px width (mínimo 16px base)
☐ Contrast WCAG AA (verifica amb WebAIM Contrast Checker)
☐ Sense text tret de necessari (menys és més en mòbil)
☐ Pista visual visible sense zoom (o permès tap-zoom si necessari)
☐ Safe area respectat (no content a top/bottom 40px)
☐ Mida archivo optimitzada (<500KB per PNG, <200KB per JPG)
☐ Format correcte (PNG transparent si necessari, JPG si foto)
☐ Responsive: scalable sense pixelació (SVG per icones si possible)
☐ Touch targets mínimo 48×48px (per elements interactius)
```

---

## VI. IMPLEMENTACIÓ NEXT.JS (Fragment de Codi)

### Hero Banner Responsive

```jsx
// app/(player)/joc/components/GameHero.tsx
import Image from 'next/image'

export function GameHero({ imageId }: { imageId: string }) {
  return (
    <div className="relative w-full bg-[#F5E6D3]">
      <picture>
        {/* Mobile: 9:16 */}
        <source 
          media="(max-width: 480px)" 
          srcSet={`/images/scenes/${imageId}-mobile-9-16.jpg`}
        />
        {/* Desktop: 16:9 */}
        <source 
          media="(min-width: 768px)" 
          srcSet={`/images/scenes/${imageId}-desktop-16-9.jpg`}
        />
        {/* Fallback */}
        <img 
          src={`/images/scenes/${imageId}-mobile-9-16.jpg`}
          alt="Scene context"
          className="w-full h-auto max-h-[670px] object-cover"
        />
      </picture>
    </div>
  )
}
```

### Document Modal (amb Scroll)

```jsx
// components/DocumentViewer.tsx
export function DocumentViewer({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg overflow-auto max-w-[95vw] max-h-[95vh]">
        <img 
          src={imageUrl} 
          alt="Document"
          className="w-full h-auto"
          style={{
            maxWidth: "375px",
            maxHeight: "calc(812px - 100px)"
          }}
        />
      </div>
    </div>
  )
}
```

### Mapa Interactiu (SVG)

```jsx
// components/InteractiveMap.tsx
export function InteractiveMap() {
  const [zoom, setZoom] = useState(1)
  
  return (
    <div 
      className="w-full max-w-[375px] aspect-square overflow-auto"
      style={{ touchAction: "manipulation" }}
    >
      <svg 
        viewBox="0 0 600 600" 
        width="100%" 
        height="100%"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* SVG content */}
      </svg>
    </div>
  )
}
```

---

## VII. OPTIMITZACIÓ D'IMATGES

### Mides Recomanades (Compressió)

| Tipus | Mida Origen | Compressió | Mida Final | Format |
|------|-------------|-----------|-----------|--------|
| **Scene 9:16** | 1875×3328 px | 70% | ~350 KB | JPG |
| **Document 3:4** | 800×1000 px | 75% | ~180 KB | JPG |
| **Icon 1:1** | 512×512 px | 60% | ~50 KB | PNG |
| **Mapa SVG** | Vector | N/A | ~30 KB | SVG |

**Comanda Optimization (ImageMagick):**

```bash
# Mòbil scene 9:16
convert input.jpg -resize 375x667 -quality 70 mobile-scene.jpg

# Document
convert input.jpg -resize 375x500 -quality 75 mobile-doc.jpg

# Icon
convert input.png -resize 48x48 -quality 80 icon-48.png
```

---

## VIII. RESPONSIVE BREAKPOINTS (CSS)

### Tailwind Config (Recomanat)

```js
// tailwindConfig.js
module.exports = {
  theme: {
    screens: {
      'mobile': '320px',
      'mobile-plus': '375px',  // ← NOSTRE TARGET
      'tablet': '768px',
      'desktop': '1200px',
    },
    extend: {
      spacing: {
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
      },
    },
  },
}
```

### Ús a Component

```jsx
<div className="mobile-plus:px-4 mobile-plus:max-w-[375px]">
  {/* Content auto-scales */}
</div>
```

---

## IX. VALIDACIÓ FINAL (Totes les 37 Imatges)

### Checklist Aspecte Ratio + Mòbil

```
CARTELLS (6):
  ☐ Cartell 1–6: Format A2 (2:3 printable) ✓

WEBAPP SCENES (5):
  ☐ Scene 1–5: Aspect 9:16 (mòbil) ✓
  ☐ Text readable 375px ✓

DOCUMENTS (7):
  ☐ Document 1–7: Aspect 3:4 (mòbil scroll) ✓
  ☐ Pista visible sense zoom o permès tap-zoom ✓

RETRATS (4):
  ☐ Portrait 1–4: Aspect 3:4 (item card) ✓
  ☐ Mida mòbil: 240×320 px legible ✓

ICONS (5):
  ☐ Icon 1–5: Aspect 1:1 (48×48, 60×60) ✓
  ☐ Contrast WCAG AAA ✓

MAPES (2):
  ☐ Map 1–2: Aspect 1:1 SVG (interactive, zoom-enabled) ✓
  ☐ Touch targets ≥48×48 px ✓

TOTAL: 37/37 mòbil-ready ✓
```

---

## 🎬 NEXT STEPS

### Immediatament (Avui)
1. Revisar aquesta guia amb equip design + frontend
2. Decidir: **2 versions per cas (mobile + desktop) o 1 sola optimitzada?**
   - Recomanació: **2 versions** (hero scene) o **1 sola** (icon, document)

### Preparació Generació IA
1. Usar paràmetres `--ar` correctes per Midjourney
2. Generar amb safe margins (no content als extrems)
3. Testejar en 375×812 simulator ANTES de final aproval

### Desenvolupament
1. Implementar responsive <picture> tags o CSS media queries
2. Testejar tap-zoom per documents
3. Testejar pinch-zoom per mapes

---

**Darrera actualització:** 17 de setembre de 2026  
**Status:** Guia completa per responsive design + mòbil  
**Pròxim:** Integrar aquesta guia a LLISTA_IMATGES_COMPLETA per cada imatge
