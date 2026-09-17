# GUIA: ASPECTE RATIOS — MOBILE-ONLY (375×812 px)
## El Traïdor de la Guixa

**Versió:** 2.0 Simplified | **Data:** 17 de setembre de 2026  
**Context:** Joc 100% MOBILE-ONLY. Cap desktop. Una sola resolució per imatge.

---

## 🎯 PRINCIPI CLAU

**NO HI HA DESKTOP.**

Això significa:
- ✅ Una sola resolució per imatge (mòbil 375×812)
- ✅ Una sola versió per cada imatge (NO picture tags, NO media queries)
- ✅ Aspecte ratios simples i únics
- ✅ La imatge generada per IA és LA FINAL (sense retalls, sans media queries)
- ✅ Zero complexitat de responsive design

---

## 📐 ASPECTE RATIOS FINALS (Mobile-Only)

### Resum Complet: 37 Imatges

| Categoria | Cas d'Ús | Aspecte Ratio | Mòbil (375px) | Comportament |
|-----------|----------|--------------|---------------|-------------|
| **CARTELLS (6)** | Impressió Física | 2:3 | N/A (print) | N/A |
| **SCENES (5)** | Hero Banner, Context | **9:16** | 375×667 px | Static, NO scroll |
| **DOCUMENTS (7)** | Carta, Declaració, etc | **3:4** | 375×500 visible | Scroll vertical si > 500px altura |
| **RETRATS (4)** | Personatge Card | **3:4** | 240×320 | Tap fullscreen modal |
| **ICONES (5)** | Botons UI, Navegació | **1:1** | 48×48 o 60×60 px | Fixa, NO zoom |
| **MAPES (2)** | Interactiu SVG | **1:1** | 330×330 px | SVG interactive (pinch-zoom) |

---

## 📋 ASPECTE RATIO PER CADA IMATGE

### CARTELLS FÍSICS (6)

```
Categoria: Cartell Fysic A2 Impressió

┌─────────────────────────────────────┐
│ Cartell 1: Serrat de les Bruixes    │
├─────────────────────────────────────┤
│ Format:         A2 (420×594 mm)     │
│ Aspect Ratio:   2:3                 │
│ DPI:            300 (print)         │
│ Ús en Webapp:   NO (físic només)    │
│ Nota:           Escaneja QR → entra │
│                 a webapp            │
└─────────────────────────────────────┘

IDEM per Cartell 2–6
```

---

### SCENES/NARRATIVES (5)

```
Categoria: Webapp Hero / Context Background

Aspecte Ratio: 9:16 (PORTRAIT, mòbil vertical)
Dimensions:   375×667 px (ompleix 375 width + deixa 145 px per header/footer)

Exemple per Scene 7 (Vigies a la Nit):
┌─────────────────────┐
│ width:  375 px      │ ← Full mòbil width
│ height: 667 px      │ ← 812 - 145 (header cronometre + nav inferior)
│ AR:     9:16        │
└─────────────────────┘

Generació IA:
  Midjourney: /imagine --ar 9:16 [prompt]
  Resultat:   Imatge 9:16 (qualsevol mida, será escalada a 375×667)

Renderització Next.js:
  <img src="/scenes/vigies.jpg" alt="..." 
       style={{ width: "100%", height: "auto", maxHeight: "667px" }} />

Idem per Scene 8–11 (5 total)
```

---

### DOCUMENTS (7)

```
Categoria: Carta, Declaració, Taula, Evidència

Aspecte Ratio: 3:4 (PORTRAIT, vertical)
Visible en Card:  375×500 px (card inicial)
Total Altura:     800×1000 px (si necessita scroll)

Comportament:
  1. Card mostra 375×500 px (visible)
  2. Usuari TAP → modal fullscreen (375×812 - headers)
  3. Si imatge > 600px altura → scroll vertical within modal
  4. Pinch-zoom: doble tap zoom 2× per veure pista

Exemple per Document 17 (Carta Bernat Original):
┌──────────────────────────────────┐
│ Generar:        --ar 3:4         │
│ Mida resultat:  800×1000 px      │
│ Mòbil card:     375×500 (50%)    │
│ Mòbil modal:    Fullscreen scroll│
│ Zoom:           Pinch-zoom 2×    │
└──────────────────────────────────┘

Idem per Document 18–23 (7 total)
```

---

### RETRATS PERSONATGES (4)

```
Categoria: Card Personatge (Bernat, Mossèn Ramon, Emissari, Anton)

Aspecte Ratio: 3:4 (PORTRAIT)
Mida en Card:  240×320 px (quadern, compact)
Mida fullscreen: 375×500 px (tap → modal)

Comportament:
  1. Card mostra 240×320 (lista)
  2. Tap → modal amb 375×500
  3. No pinch-zoom (retrat static)

Generació IA:
  Midjourney: /imagine --ar 3:4 --quality 2 [prompt retrat]
  Resultat: Qualsevol mida 3:4 (será escalada a 240×320 per card)
```

---

### ICONES UI (5)

```
Categoria: Botons, Navegació Inferior, Elements UI

Aspecte Ratio: 1:1 (QUADRAT)
Mida Fixa:     48×48 px (botons) o 60×60 px (botó central)

Llista:
  - Icon 28: MAPA (48×48)
  - Icon 29: QUADERN (48×48)
  - Icon 30: ESCANEJA QR (60×60, central, més gran)
  - Icon 31: HISTÓRIA (48×48)
  - Icon 32: SALVOS (48×48)

Generació IA:
  Midjourney: /imagine --ar 1:1 --quality 2 [prompt icon]
  Resultat: Qualsevol mida 1:1 (será escalada a 48×48 final)

Criteris:
  ✓ Contrast WCAG AAA
  ✓ Sense text (text en label)
  ✓ SVG o PNG (sharp at 48px)
  ✓ Minimo 48×48 px (tactilitat)

Renderització:
  <img src="/icons/map-48.png" alt="" width="48" height="48" />
```

---

### MAPES INTERACTIUS (2)

```
Categoria: Mapa Guixa General + Planes Bones Grid

Aspecte Ratio: 1:1 (QUADRAT)
Mida:          330×330 px (mòbil, dins viewport)
Format:        SVG (interactive, NO raster)

Mapa 35 (Guixa General):
  ├─ SVG base: 600×600 px viewBox
  ├─ Render mòbil: 330×330 (75% viewport width)
  ├─ Comportament: Pinch-zoom + pan (llibreria leaflet)
  └─ Touch: Tap per info, drag per pan

Mapa 36 (Planes Bones Grid):
  ├─ SVG base: 600×600 px (4×4 grid)
  ├─ Render mòbil: 330×330
  ├─ Comportament: Tap casella → highlight + resolució
  └─ Touch: Tap cell, visual feedback

Generació IA:
  Flux/SD (SVG vector): /imagine --ar 1:1 --style raw [prompt mapa]
  Resultat: SVG vectorial (NO raster) per a escalat sense pixelació
  
  O Raster (PNG):
  Midjourney: /imagine --ar 1:1 [prompt]
  Resultat: Raster (escalable via CSS, però menys nítid que SVG)
```

---

## 🎬 RESUMO: ASPECTE RATIOS ÚNIQUES

```
CARTELLS:     2:3   (fysic, no web)
SCENES:       9:16  (375×667 mòbil)
DOCUMENTS:    3:4   (375×500 visible, scroll si major)
RETRATS:      3:4   (240×320 card, 375×500 modal)
ICONS:        1:1   (48×48 o 60×60 fix)
MAPS:         1:1   (330×330, SVG interactive)
```

**No hi ha més complexitat. Una sola resolució per imatge.**

---

## 💻 IMPLEMENTACIÓ NEXT.JS (SIMPLIFICADA)

### Scene Component

```jsx
// components/SceneHero.tsx
export function SceneHero({ imageId }: { imageId: string }) {
  return (
    <div className="w-full bg-[#F5E6D3]">
      <img 
        src={`/images/scenes/${imageId}.jpg`}
        alt="Scene context"
        className="w-full h-auto max-h-[667px]"
      />
    </div>
  )
}

// Ús:
// <SceneHero imageId="vigies-fogueres" />
// → Automatically 375×667 in mobile viewport
```

### Document Modal

```jsx
// components/DocumentViewer.tsx
export function DocumentViewer({ imageUrl }: { imageUrl: string }) {
  const [zoomed, setZoomed] = useState(false)
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg overflow-auto max-h-[90vh] w-[375px]"
        onDoubleClick={() => setZoomed(!zoomed)}
      >
        <img 
          src={imageUrl} 
          alt="Document"
          className={zoomed ? "scale-200 origin-center" : "scale-100"}
          style={{
            transition: "transform 0.2s ease-in-out",
            cursor: "zoom-in"
          }}
        />
      </div>
    </div>
  )
}

// Ús:
// <DocumentViewer imageUrl="/images/documents/carta-bernat.jpg" />
```

### Icon Component

```jsx
// components/NavIcon.tsx
interface NavIconProps {
  icon: string;
  label: string;
  onClick: () => void;
}

export function NavIcon({ icon, label, onClick }: NavIconProps) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#4A3728] hover:bg-[#5A4738] transition"
      aria-label={label}
      title={label}
    >
      <img src={`/icons/${icon}-48.png`} alt={label} width="32" height="32" />
    </button>
  )
}
```

### Map Component (SVG)

```jsx
// components/InteractiveMap.tsx
export function InteractiveMap({ mapType }: { mapType: "guixa" | "planes" }) {
  return (
    <div className="w-full max-w-[330px] aspect-square mx-auto">
      <svg 
        viewBox="0 0 600 600" 
        width="100%" 
        height="100%"
        className="touch-manipulation"
      >
        {/* SVG content loaded from mapType */}
      </svg>
    </div>
  )
}
```

---

## 📦 ESTRUCTURA CARPETES (SIMPLE)

```
public/images/
├─ scenes/
│  ├─ vigies-fogueres.jpg          (375×667, 9:16)
│  ├─ font-ferro-water.jpg         (375×667, 9:16)
│  ├─ patrol-night.jpg             (375×667, 9:16)
│  ├─ cemetery-night.jpg           (375×667, 9:16)
│  └─ rectoria-day.jpg             (375×667, 9:16)
│
├─ documents/
│  ├─ carta-bernat-original.jpg    (375×500 visible, scroll if needed)
│  ├─ carta-falsa-rector.jpg       (375×500)
│  ├─ nota-capita.jpg              (375×280)
│  ├─ declaracio-rector.jpg        (375×500)
│  ├─ calligraphy-exercise.jpg     (375×500)
│  ├─ firebeacons-table.jpg        (375×500)
│  └─ water-ledger-page.jpg        (375×500)
│
├─ portraits/
│  ├─ bernat-master-240.jpg        (240×320)
│  ├─ ramon-rector-240.jpg         (240×320)
│  ├─ emissari-agent-240.jpg       (240×320)
│  └─ anton-sacristan-240.jpg      (240×320)
│
├─ icons/
│  ├─ map-48.png                   (48×48, 1:1)
│  ├─ quadern-48.png               (48×48, 1:1)
│  ├─ scanner-60.png               (60×60, 1:1, central)
│  ├─ historia-48.png              (48×48, 1:1)
│  ├─ salvos-48.png                (48×48, 1:1)
│  └─ [firebeacon, water, etc]-128.png (128×128 per docs)
│
├─ cartells/
│  ├─ cartell-1-serrat-bruixes.jpg (A2, 300 dpi, print)
│  ├─ cartell-2-font-ferro.jpg     (A2, 300 dpi, print)
│  └─ [... 6 cartells total, no web display ...]
│
└─ maps/
   ├─ guixa-map.svg                (600×600 SVG, 330×330 mòbil)
   └─ planes-bones-grid.svg        (600×600 SVG, 330×330 mòbil)
```

---

## ✅ CHECKLIST FINAL: MOBILE-ONLY

Per CADA imatge, validar:

```
☐ Aspecte Ratio correcte (9:16 scene, 3:4 doc, 1:1 icon/map)
☐ Dimensions Mòbil (375px width per scene/doc, 48×48 per icon)
☐ Text readable 375px (mínimo 14–16px base)
☐ Contrast WCAG AA (verifica WebAIM)
☐ NO media queries necesàries (mobile-only, una sola versió)
☐ NO <picture> tags (només <img>)
☐ Mida archivo optimitzada (<400KB per JPG, <150KB per PNG)
☐ Format (JPG per fotos scene/doc, PNG per icons transparent)
☐ SVG per maps (scalable sense pixelació)
☐ Touch targets ≥48×48 px (botons, elements interactius)
```

---

## 🎯 ASPECTE RATIO FINAL TAULA (37 IMATGES)

| # | ID | Categoria | AR | Mòbil PX | Format | Comportament |
|----|----|-----------|----|---------|--------|------------|
| 1–6 | CARTELL_* | Fysic | 2:3 | N/A | Print 300dpi | N/A |
| 7–11 | SCENE_* | Webapp | 9:16 | 375×667 | JPG | Static |
| 12–15 | ICON_* | UI | 1:1 | 48×48 | PNG | Static |
| 16 | ALMS_BOX_3D | Webapp | 1:1 | 600×600 | PNG | Static |
| 17–23 | DOC_* | Webapp | 3:4 | 375×500 | JPG | Scroll+Zoom |
| 24–27 | PORTRAIT_* | Card | 3:4 | 240×320 | PNG | Tap Modal |
| 28–32 | ICON_* | NavBar | 1:1 | 48–60×48–60 | PNG | Static |
| 33–34 | SEAL_* | Webapp | 1:1 | 200×200 | PNG | Tap Zoom |
| 35–36 | MAP_* | Webapp | 1:1 | 330×330 | SVG | Interactive |
| 37 | INTERIOR_RECTORIA | Webapp | 4:3 | 375×280 | JPG | Static |

**TOTAL: 37 imatges, 1 versió per imatge, 0 duplicates.**

---

## 🎬 WORKFLOW PRODUCCIÓ (SIMPLIFICAT)

### Pas 1: Generar Imatge

```bash
# Mòbil scene 9:16
midjourney: /imagine --ar 9:16 --niji 6 [prompt]

# Document 3:4
midjourney: /imagine --ar 3:4 --quality 2 [prompt]

# Icon 1:1
midjourney: /imagine --ar 1:1 --quality 2 [prompt icon]

# Map SVG
flux/sd: /imagine --ar 1:1 --style raw [prompt map]
```

### Pas 2: Optimitzar Mida

```bash
# Scene 9:16 → 375×667 JPG
convert scene.jpg -resize 375x667 -quality 70 scene-mobile.jpg

# Document 3:4 → 375×500 JPG
convert doc.jpg -resize 375x500 -quality 75 doc-mobile.jpg

# Icon 1:1 → 48×48 PNG
convert icon.png -resize 48x48 -quality 80 icon-48.png
```

### Pas 3: Copiar a Carpeta

```bash
cp scene-mobile.jpg public/images/scenes/
cp doc-mobile.jpg public/images/documents/
cp icon-48.png public/images/icons/
cp map.svg public/images/maps/
```

### Pas 4: Validar

- [ ] Imatge es veu correcte a 375×812 viewport
- [ ] Text llegible sense zoom
- [ ] Contrast OK
- [ ] Mida archivo OK
- [ ] No necessita retalls posteriors

---

## 📝 NOTA FINAL

**Amb MOBILE-ONLY:**
- ✅ 0 media queries necessàries
- ✅ 0 picture tags necessaris
- ✅ 1 versió per imatge = zero duplicació
- ✅ Temps generació IA més ràpid (una sola resolució target)
- ✅ Stockage 50% menor (una sola versió)
- ✅ Implementació frontend molt més simple

**El sistema anterior amb "Desktop 16:9" era INNECESSARI.**

---

**Darrera actualització:** 17 de setembre de 2026  
**Status:** MOBILE-ONLY simplificat i optimitzat  
**Próxim:** Generar imatges amb Midjourney/Flux amb aspecte ratios correctos
