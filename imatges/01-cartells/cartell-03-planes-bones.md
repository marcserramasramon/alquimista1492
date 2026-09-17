# CARTELL-03 — Planes Bones: La Ronda de la Patrulla

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | cartell-03-planes-bones |
| **Categoria** | Cartell Físic A1 |
| **Acte** | I — La Investigació |
| **Estació** | Planes Bones |
| **Rol en Gameplay** | Pista Visual + Mapa Esquemàtic |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:2 (landscape) — A1 més gran |
| **Dimensions** | 594×841 mm (A1) |
| **DPI** | 300 (impressió) |
| **Format** | JPG color |
| **Laminat** | Sí, mate (resistir vent, rosada) |
| **Ús** | Físic (exterior, camí visible, estratègic) |
| **Comportament Web** | N/A (no es renderitza webapp) |

---

## Descripció Narrativa

**Context:**
El mapa esquemàtic de Planes Bones mostra els camins nocturns entre masies i cruïlles. Cada tram està marcat amb temps de pas (quarts d'hora) entre nodes clau. El cartell inclou una taula de durades i un avís dels jurats sobre la riera crescuda (gual intransitable) i els blats sense rastre.

**Contingut del Cartell:**
- **Títol:** "CAMINS DE PLANES BONES" amb subtítol "Temps de pas a peu, de nit i amb fanal. Cada ratlla és un quart d'hora."
- **Mapa Central (60%):** Esquema de nodes (La Guixa, Cruïlla, Pont Vell, Gual, Mas de l'Om, Camps de blat, Molí Vell) connectats per camins puntejats
- **Distàncies:** Números de quarts entre nodes (4, 3, 2, etc.)
- **Marques Especials:** Gual marcat "INTRANSITABLE" (rojo), Camps de blat marcat "SEM RASTRE" (rojo)
- **Avís lateral:** Text dels jurats sobre riera crescuda i blats de segar
- **Taula inferior:** Durades de trams (10 files, 2 columnes)
- **Decoració:** Casetes simples, arbres, riu, símbols de camí medieval
- **QR:** Blanc quadrat (5×5 cm) cantonada inferior dreta

**Atmosfera:**
Mapa medieval esquemàtic (no realista geogràfic), estil pàgel/pícaro. Tinta marró, pergamí crem. Avisos en rojo per alertar del perill (gual, blats). Contrast alt per llegibilitat natural.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval Catalan path map, 1705. Create a schematic network map showing 
the valley roads of Planes Bones with seven key locations:
1. La Guixa (center/south)
2. Cruïlla (northeast)
3. Pont Vell (north)
4. Gual (northeast, ford/river crossing)
5. Mas de l'Om (northwest)
6. Camps de blat (southeast, wheat field)
7. Molí Vell (south, old mill)

Each location represented by small cottage/building icon. Connect nodes with 
dashed pathway lines. Label each segment with travel time in quarter-hours 
(quarts d'hora): 4, 3, 2 designations between different paths. 

ADD WARNINGS in red: "GUAL INTRANSITABLE" (impassable ford) and "SEM RASTRE" 
(no footprints in wheat field) to show logical constraints.

TOP: Include a magistrate's warning banner about swollen river stream and 
impassable paths during May 1705. Text in Catalan: context about nighttime 
travel dangers and crop restrictions.

BOTTOM-RIGHT: Time reference table listing all path segments and durations 
(10 rows, clear serif font, 16pt).

Visual style: Aged parchment (cream) with brown medieval ink. Red warnings 
(not neon, subdued). Schematic not geographically accurate — medieval style 
map (simple symbols, clear connections). Decorative elements: small trees, 
river crossing mark, path symbols.

Dimensions: A1 (594×841 mm). Ready for 300 DPI print, matte lamination.

Negative: photographic realism, modern roads, 3D rendering, GPS styling, 
contemporary symbols, digital fonts, bright neon colors, people, vehicles.
```

---

## Paràmetres Midjourney

```
/imagine --ar 3:2 --niji 6 --stylize 200 --quality 2 [PROMPT]
```

**Alternativa amb Master Style Diurna:**
```
/imagine --ar 3:2 --sref [MASTER_STYLE_DIURNA_URL] --niji 6 [PROMPT]
```

---

## Paràmetres Altres Motors

### Flux Pro
```
flux --aspect 3:2 --seed 0 --steps 50 [PROMPT]
```

### Stable Diffusion XL
```
--sampler euler --steps 30 --guidance_scale 7.5 --aspect 3:2 [PROMPT]
```

---

## Comportament en Joc

1. **Físic:** Cartell col·locat a Planes Bones (vora camí visible, lloc estratègic)
2. **Protecció:** Laminat mate per resistir vent, rosada, intempèrie
3. **Jugador escaneja QR** → Entrada a webapp estació 3
4. **Webapp mostra:** Joc "Patrulla Nocturna" (calculer temps entre punts)
5. **Mapa del cartell** és referència per jugadors
6. **Avisos en rojo** (Gual intransitable, blats sense rastre) mostren restriccions narratives
7. **Taula de temps** s'usa per validar respuestas a webapp

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 3:2 (A1 594×841 mm)
- [ ] Resolució 300 DPI
- [ ] Text llegible des de 1,5 metres de distància
- [ ] Marges de seguretat (16mm tots costats)

**Visual i Estil:**
- [ ] Pergamí envellit (crem, no blanc)
- [ ] Mapa esquemàtic, no geogràfic realista
- [ ] Set nodes clars amb symbols de caseta/building
- [ ] Camins puntejats, fàcils de seguir
- [ ] Distàncies en quarts (4, 3, 2, etc.) visibles (18–20pt)
- [ ] Gual marcat "INTRANSITABLE" en rojo (subtil, no neon)
- [ ] Blats marcat "SEM RASTRE" en rojo
- [ ] Taula de temps clara (10 files, 2 columnes, 16pt)
- [ ] Avís dels jurats visible a banda superior esquerra
- [ ] Arbres i riu com decoració discreta

**Contrast i Llegibilitat:**
- [ ] Contrast WCAG AAA (#F5E6D3 beige vs #3d2817 marró)
- [ ] Números de quarts: 20pt bold
- [ ] Noms de ubicacions: 18pt serif
- [ ] Taula text: 16pt, negre sobre blanc
- [ ] Red warnings: subtil (no neon), clarament llegible

**Contingut Medieval:**
- [ ] Noms de masies reals (La Guixa, Cruïlla, Pont Vell, Gual, Mas de l'Om, Camps, Molí)
- [ ] Distàncies coherents (quarts d'hora realistes per a peu de nit)
- [ ] Escriptura pseudo-medieval
- [ ] Zero anacronismes (sense carreteres modernes, GPS, cotxes)

**QR Técnic:**
- [ ] QR blanc quadrat, 5×5 cm
- [ ] URL correcta (verificar token estació-3)
- [ ] Contrast QR negre/blanc
- [ ] Ubicació: cantonada inferior dreta

**Impressió i Laminat:**
- [ ] JPG color (CMYK per print)
- [ ] Mida archivo: < 15 MB
- [ ] Laminat mate (protecció vent, rosada)
- [ ] Sense artefactes de compressió

---

## Status Producció

- [ ] **PER_DISSENYAR** ← Estado inicial
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] IMPRÈS I LAMINAT (data: _____)
- [ ] INSTAL·LAT A PLANES BONES (data: _____)

---

## Notas Addicionals

### Inspiració Artística
- Mapes medievals esquemàtics: mapes de rutes pilgrim (XVI–XVII)
- Estil: "pàgel/pícaro medieval", no cartografia científica
- Referència: portolans i rute maps d'era pre-GPS

### Variants
**Una única versió per a totes les variants** — mapa de camins idèntic. Les hores de sortida (Ferrer vs Pagès) són part de la webapp, no del cartell.

### Material Físic Recomanat
- Cartó rígid 350gsm (A1 és pesat)
- Plastificat mate 125 microns
- Reforç de cantonades (4 suports metàl·lics)
- Fixació: robusta contra vent

### Seguretat Instal·lació
- **Ubicació:** Vora del camí principal a Planes Bones, visible, no obstructor
- **Altura:** 150–180 cm
- **Protecció:** Assegurar bem (A1 és gran i pot volar)
- **Verificació:** Revisar fixació dia anterior

### Cost Estimat
- Impressió A1 300 dpi: €10–15
- Laminat mate: €5–8
- 4 suports metàl·lics + instal·lació: €15–25
- **Total:** €30–48

---

## Arxius Relacionats

- `docs/cartells/cartell-03-planes-bones.md` — Especificacions estació
- `GUIA_ASPECTE_RATIOS_MOBIL_v2_SIMPLIFIED.md` — Dimensions
- `PLANTILLA_MASTER_STYLE_ASSET.md` — Coherència visual

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Llist per generar  
**Próxim:** Generar amb Midjourney → Imprimir → Laminat → 4 suports + instal·lació
