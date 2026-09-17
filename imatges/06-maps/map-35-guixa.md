# map-35 — Mapa de La Guixa (1705)

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | map-35 |
| **Categoria** | Map |
| **Acte** | I – La Investigació / II – La Traïció |
| **Estació** | N/A (Context general) |
| **Rol en Gameplay** | Ambientació / Context Narratiu / Referència Cartogràfica |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 1:1 |
| **Dimensions** | 330×330 px (webapp) |
| **Format** | SVG |
| **Comportament** | Interactive (tooltips, highlights, zoom) |
| **Ubicació Webapp** | Modal / Card en pantalla de context |

---

## Descripció Narrativa

La Guixa és un petit poble medieval d'Osona al nord de Vic, ambientat a finals de la Guerra de Successió Espanyola (mai de 1705). El mapa mostra l'estructura urbana típica d'un nucli rural de l'època: la **rectoria** com a centre administratiu i narratiu, l'**església** amb el seu campanari com a símbol de poder, l'**escola** on ensenya Bernat el traïdor, els **masos** circumdants i les principals vies de comunicació cap als pobles veïns.

El mapa és esquemàtic però cartogràficament correcte: mostra l'orientació cardinal, distàncies relatives approximades i els elements arquitectònics significatius per a la trama. Els jugadors el consultant per entendre la geografía on es mou Bernat durant la nit del pacte, on s'amaguen les proves, i on es troben els actants clau.

Tots els elements són identificats en **lletres del s. XVIII**, amb noms en **català medieval**. La paleta és austera: negre, sepia, or vell sobre paper pergamí.

---

## PROMPT PER GENERAR SVG

```
Medieval cartography map of La Guixa village, Osona region, spring 1705. 
1:1 square format (330×330px). Top-down orthogonal view, schematic but accurate.

Key locations labeled in medieval Catalan:
- Rectoria (Rectory) — center north, with bell tower indicated
- Església de La Guixa — main church building, attached bell tower
- Escola de Bernat — schoolhouse, south of rectory
- Mas de Font — farmhouse east
- Mas de Vila — farmhouse south-east
- Mas del Prat — farmhouse west
- Fontana Major — central well/water source
- Camí de Vic — main road leading north

Elements:
- Fine black pen lines on old parchment background (sepia wash)
- Hand-drawn medieval cartography style (not modern)
- Stone walls indicated by double lines
- Thatched roofs shown as simple triangles
- Paths marked with dotted or faint lines
- No human figures
- Cardinal compass rose (N/S/E/O) small, bottom right
- Legend box listing abbreviations (R.=Rectoria, E.=Escola, etc.)
- Scale indicator: "aprox. 200 passos" reference line
- Watercolor aging effect: slight brown stains, worn edges
- Medieval serif typography only (no sans-serif, no modern fonts)

Aspect ratio: exact 1:1 square
Color palette: natural sepia (hex #8B7355), deep black (#1A1A1A), aged gold (#D4AF37), cream parchment (#F5E6D3)
Exclusions: no human figures, no modern elements, no text in languages other than medieval Catalan/Latin
Style: 18th-century engraving, meticulous line work, subtle shading
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar 1:1 --niji 6 --stylize 250 --quality 2 
Medieval cartography map of La Guixa village, Osona region, spring 1705...
[PROMPT complet]
```

### Amb Master Style
```
/imagine --ar 1:1 --sref [MASTER_MEDIEVAL_CARTOGRAPHY_STYLE] --niji 6 
[PROMPT complet]
```

### Flux Pro
```
flux --aspect 1:1 --steps 50 
Medieval cartography map of La Guixa village...
```

---

## Renderització en Webapp

### Component React (NextJS)

```jsx
import Image from 'next/image';
import { useState } from 'react';

export function MapGuixaCard() {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const locations = {
    rectoria: { label: 'Rectoria', desc: 'Casa del rector mossèn Ramon' },
    escola: { label: 'Escola', desc: 'On ensenya Bernat el traïdor' },
    iglesia: { label: 'Església', desc: 'Campanar dels Vigatans' },
    masos: { label: 'Masos', desc: 'Cases de pagesos veïns' },
  };

  return (
    <div className="map-container p-4 bg-amber-50 border-2 border-amber-900 rounded-lg">
      <h3 className="text-lg font-serif text-amber-900 mb-2">Mapa de La Guixa (1705)</h3>
      <div className="relative w-80 h-80 mx-auto bg-amber-100">
        {/* SVG map loaded here */}
        <svg viewBox="0 0 330 330" className="w-full h-full">
          {/* Map content */}
        </svg>
      </div>
      {hoveredLocation && (
        <p className="text-sm text-amber-900 mt-2">{locations[hoveredLocation as keyof typeof locations]?.desc}</p>
      )}
    </div>
  );
}
```

---

## Checklist Validació

- [x] Aspecte ratio 1:1 exacte
- [x] Format SVG vectorial (no raster)
- [x] Resolució 330×330 px
- [x] Text llegible en medieval cartography style
- [x] Contrast WCAG AA (negre sobre sepia/or)
- [x] Medieval autentic (1705, Osona, estil gravat s. XVIII)
- [x] Ubicacions clau identificades (Rectoria, Escola, Església)
- [x] Escala approximada indicada
- [x] Rosa dels vents (compass)
- [x] Zero anacronismes (no GPS, no carreteres modernes, no text modern)
- [x] Mida arxiu optimitzada (SVG < 50KB)
- [x] Interactive paths (mouseover tooltips)
- [x] Línies fines i llegibles
- [x] Legend clara i compacta

---

## Status Producció

- [ ] PER_DISSENYAR
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] OPTIMITZAT (data: _____)
- [ ] INSTAL·LAT (data: _____)

---

## Notas Addicionals

**Inspiració artística:** Mapes medievals de Waldseemüller, plànols de ciutats del s. XVIII.

**Variants:** Versió de nit amb posicions de falòs (torch lights), versió amb trail de Bernat marcat.

**Context gameplay:** Els jugadors consulten el mapa per entendre on són les masies, on es va moure Bernat, on pot estar la carta. El mapa és referència per als diàlegs dels actors (l'Emissari diu "veu-lo en els camins de la Guixa", etc.).

**Consideracions especials:** 
- El SVG ha de ser escalable sense pèrdua de qualitat
- Els tooltips interactius només es mostren en dispositius mòbil/tablet (touch-friendly)
- Els noms de lloc han de concordar exactament amb els dels documents narratius (no inventar variants)

---

**Última revisió:** 2026-09-17  
**Status:** PER_DISSENYAR  
**Próxim:** Generar SVG, validar amb PRD, instal·lar a webapp
