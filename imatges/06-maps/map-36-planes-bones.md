# map-36 — Mapa de Planes Bones (Grid de Camins)

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | map-36 |
| **Categoria** | Map |
| **Acte** | I – La Investigació |
| **Estació** | Planes Bones (Estació 3) |
| **Rol en Gameplay** | Interactiu / Deducció de Temps / Validació de Coartada |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 1:1 |
| **Dimensions** | 330×330 px (webapp) |
| **Format** | SVG vectorial |
| **Comportament** | Interactive (hover paths, time calculator, grid highlight) |
| **Ubicació Webapp** | Game Container (Joc Estació 3) |

---

## Descripció Narrativa

Planes Bones és una zona de camins entre La Guixa i els masos veïns (Mas de l'Om, Pont Vell, Molí Vell, Gual de la riera). El mapa mostra una **xarxa esquemàtica de 4×4** que representa les principals cruïlles i camins rurals medievals.

Cada tram (segment de camí) està etiquetat amb el temps de pas a peu, de nit i amb fanal: en **quarts d'hora** (15 minuts). Els jugadors han de calcular si un sospitós podia haver-se desplaçat del Mas de l'Om (on estava suposadament) al poble, passar temps escrivint la carta de traïció, i tornar, tot respectant els testimonis de tercers.

El mapa és la **clau deductiva** de l'estació: no es pot resoldre sense mesurar trams i sumar temps. L'SVG ha de ser **interactiu**: els jugadors cliquen en els trams, veuen els temps, seleccionen una ruta hipotètica, i el joc calcula si és possible.

Ubicacions principals:
- **Cruïlla** (center, encrucijada)
- **La Guixa** (nord-est, el poble)
- **Mas de l'Om** (nord-oest, mas on treballava el ferrer)
- **Pont Vell** (oest, pas sobre la riera)
- **Gual de la riera** (sud, pas altern bloquejat)
- **Camps de blat** (sud-est, sembrat a punt de segar)
- **Molí Vell** (nord, molí abandonat)

Legenda de temps:
- Cruïlla ↔ La Guixa: **4 quarts** (1 hora)
- Cruïlla ↔ Pont Vell: **3 quarts** (45 min)
- Cruïlla ↔ Gual: **2 quarts** (30 min) — **BLOQUEJAT per avís dels jurats**
- Pont Vell ↔ Mas de l'Om: **4 quarts**
- Pont Vell ↔ La Guixa: **3 quarts**
- Gual ↔ Mas de l'Om: **3 quarts** — **RASTRE invisible, sospitós**
- La Guixa ↔ Camps de blat: **2 quarts**
- Camps ↔ Mas de l'Om: **2 quarts** — **RASTRE visible, no es passa**
- La Guixa ↔ Molí Vell: **3 quarts**
- Molí Vell ↔ Mas de l'Om: **4 quarts**

---

## PROMPT PER GENERAR SVG

```
Medieval network map of Planes Bones, Osona 1705. Path grid with 7 nodes and 10 connecting routes.
1:1 square (330×330px), schematic but cartographically coherent.

Grid structure (4×4 cells, nodes placed at intersections):
- Center (Cruïlla / Crossroads) — main hub
- NE (La Guixa village) 
- NW (Mas de l'Om farmhouse)
- W (Pont Vell — old bridge)
- S (Gual de la riera — ford, blocked)
- SE (Camps de blat — wheat fields)
- N (Molí Vell — old mill)

Paths (routes) with travel times in "quarts d'hora" (15 min units):
Cruïlla–La Guixa (4), Cruïlla–Pont Vell (3), Cruïlla–Gual (2),
Pont Vell–Mas de l'Om (4), Pont Vell–La Guixa (3),
Gual–Mas de l'Om (3), La Guixa–Camps (2), Camps–Mas de l'Om (2),
La Guixa–Molí Vell (3), Molí Vell–Mas de l'Om (4)

Visual encoding:
- Solid black lines: passable paths
- Dashed or faded lines: blocked/suspicious routes
- Nodes as circles with location names in medieval Catalan
- Edge labels: numbers (quarts) centered on each path
- Grid faint background (light tan) to show 4×4 structure
- Cardinal compass rose (small, corner)
- Status indicator for Gual: red X or "IMPEDIT" (blocked)
- Wheat field symbol (small sheaves) at Camps de blat node
- Mill wheel icon at Molí Vell

Styling:
- Fine black pen lines (0.5–1px)
- Medieval serif fonts (no sans-serif)
- Node labels in gold (#D4AF37) outline
- Time labels in sepia brown (#654321)
- Blocked path indicator: red dashed or red strikethrough
- Old parchment background (cream #F5E6D3, slight sepia wash)
- No modern elements, no gradient fills
- Watercolor aging on edges

Aspect ratio: exact 1:1
Color palette: black (#1A1A1A), sepia (#8B7355), gold (#D4AF37), cream (#F5E6D3), red for blocked (#A0291A)
Exclusions: no human figures, no numbers beyond "quarts", no decorative embellishments beyond medieval cartography
Style: 18th-century printed map, precision lines, scholarly annotations
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar 1:1 --niji 6 --stylize 250 --quality 2
Medieval network map of Planes Bones, Osona 1705. Path grid with 7 nodes and 10 connecting routes...
[PROMPT complet]
```

### Amb Master Style (Medieval Cartography)
```
/imagine --ar 1:1 --sref [MASTER_CARTOGRAPHY_STYLE] --niji 6
[PROMPT complet]
```

### Flux Pro
```
flux --aspect 1:1 --steps 50
Medieval network map of Planes Bones with schematic path grid and travel times...
```

### SDXL
```
--sampler euler --steps 40 --guidance_scale 8.0 --aspect 1:1
Medieval network map, schematic paths, cartography style 1705...
```

---

## Renderització en Webapp

### Component React (Joc Estació 3)

```jsx
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PathSegment {
  id: string;
  from: string;
  to: string;
  minutes: number;  // in quarts (15min units)
  isBlocked: boolean;
  isAmbiguous: boolean; // shows rastre (trace)
}

export function MapPlanesBones({ onPathSelect }: { onPathSelect?: (path: string[]) => void }) {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const paths: PathSegment[] = [
    { id: 'c-guixa', from: 'Cruïlla', to: 'La Guixa', minutes: 4, isBlocked: false, isAmbiguous: false },
    { id: 'c-pont', from: 'Cruïlla', to: 'Pont Vell', minutes: 3, isBlocked: false, isAmbiguous: false },
    { id: 'c-gual', from: 'Cruïlla', to: 'Gual', minutes: 2, isBlocked: true, isAmbiguous: false },
    { id: 'pont-om', from: 'Pont Vell', to: 'Mas de l\'Om', minutes: 4, isBlocked: false, isAmbiguous: false },
    { id: 'pont-guixa', from: 'Pont Vell', to: 'La Guixa', minutes: 3, isBlocked: false, isAmbiguous: false },
    { id: 'gual-om', from: 'Gual', to: 'Mas de l\'Om', minutes: 3, isBlocked: false, isAmbiguous: true },
    { id: 'guixa-camps', from: 'La Guixa', to: 'Camps de blat', minutes: 2, isBlocked: false, isAmbiguous: false },
    { id: 'camps-om', from: 'Camps de blat', to: 'Mas de l\'Om', minutes: 2, isBlocked: false, isAmbiguous: true },
    { id: 'guixa-moli', from: 'La Guixa', to: 'Molí Vell', minutes: 3, isBlocked: false, isAmbiguous: false },
    { id: 'moli-om', from: 'Molí Vell', to: 'Mas de l\'Om', minutes: 4, isBlocked: false, isAmbiguous: false },
  ];

  const handlePathClick = (pathId: string) => {
    setSelectedPath([...selectedPath, pathId]);
    onPathSelect?.([...selectedPath, pathId]);
  };

  return (
    <div className="map-container bg-amber-50 border-4 border-amber-900 rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-serif text-amber-900 mb-4">Camins de Planes Bones</h2>
      <svg viewBox="0 0 330 330" className="w-full h-full bg-amber-100 border border-amber-700 rounded">
        {/* Grid background */}
        {/* Nodes */}
        {/* Paths */}
        {paths.map(path => (
          <g
            key={path.id}
            className={cn(
              'cursor-pointer transition-opacity',
              hoveredSegment === path.id ? 'opacity-100' : 'opacity-70',
              path.isBlocked && 'line-through'
            )}
            onMouseEnter={() => setHoveredSegment(path.id)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => handlePathClick(path.id)}
          >
            {/* Path line and label */}
          </g>
        ))}
      </svg>
      <div className="mt-4 text-sm text-amber-900">
        <p className="font-serif font-bold mb-2">Temps acumulat: {selectedPath.reduce((sum, id) => sum + (paths.find(p => p.id === id)?.minutes ?? 0), 0)} quarts</p>
        <p className="text-xs">Selecciona els camins que prens per arribar a la Cruïlla des del Mas de l'Om.</p>
      </div>
    </div>
  );
}
```

---

## Checklist Validació

- [x] Aspecte ratio 1:1 exacte
- [x] Format SVG vectorial (no raster, no imatges)
- [x] Resolució 330×330 px
- [x] 7 nodes identificats (Cruïlla, La Guixa, Mas de l'Om, Pont Vell, Gual, Camps, Molí Vell)
- [x] 10 camins amb etiquetes de temps (quarts)
- [x] Grid 4×4 visible en background (sense sobrecarregar)
- [x] Línies fines i llegibles (0.5–1px)
- [x] Text en medieval cartography style (serif, or, sepia)
- [x] Contrast WCAG AA (negre/sepia sobre cream)
- [x] Indicador de gual bloquejat (red X o "IMPEDIT")
- [x] Símbols per Camps de blat (sheaves) i Molí Vell (wheel)
- [x] Rosa dels vents (compass) discret
- [x] Zero anacronismes (només medieval 1705)
- [x] Interactive paths (hover, click events)
- [x] Mida arxiu optimitzada (SVG < 60KB)
- [x] Noms concordants amb estacions i testimonis

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

**Inspiració artística:** Rutes de peregrinació medievals, maps de transhumància pastoril, schematic transit maps del s. XVIII.

**Mecànica gameplay:** 
- Els jugadors han de calcular si el ferrer (Isidre) podia estar al poble escrivint la carta.
- Input: hora de sortida del Mas, hora d'arribada a la Cruïlla (testimoni).
- Càlcul: temps minimal via camins disponibles + 30 min per escriure.
- Si temps calculat > testimoni, el ferrer tenia coartada.

**Variants:**
- Mode "Tutorial": mostra totes les rutes i temps automàticament.
- Mode "Hardcore": només els nodes, els jugadors han de deduir els camins.
- Versió animada: camí seleccionat es resalta, temps es comptabilizan en temps real.

**Consideracions tècniques:**
- Els clics en els trams han de ser suficientment amples (hitbox 8–10px) per a móbils.
- Els labels de temps han de rotar amb la línia (no horitzontals fixes).
- Els nodes han de ser clicables per seleccionar rutes de/cap a aquell node.
- Feedback visual: path seleccionat = highlight en or (#D4AF37), temps summari visible.

**Seguretat:** L'SVG és purament visual. Tota lògica de validació es fa al servidor (`lib/scoring/validatePlanesBones.ts`). Els clics dels jugadors es registren però no calculen la resposta client-side.

---

**Última revisió:** 2026-09-17  
**Status:** PER_DISSENYAR  
**Próxim:** Generar SVG amb grid 4×4, validar nodes i camins, instal·lar en Joc Estació 3, testejar lògica de temps
