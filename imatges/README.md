# 📸 IMATGES — El Traïdor de la Guixa

Estructura de carpetes per a generació i gestió d'imatges (37 total).

---

## 📁 ESTRUCTURA

```
imatges/
├─ README.md (aquest fitxer)
├─ 01-cartells/          6 imatges (A2 físic, 300 dpi)
├─ 02-scenes/            5 imatges (webapp hero, 9:16)
├─ 03-documents/         7 imatges (cartes, declaracions, 3:4)
├─ 04-portraits/         4 imatges (personatges, 3:4)
├─ 05-icons/             5 imatges (UI botons, 1:1)
├─ 06-maps/              2 imatges (interactius SVG, 1:1)
└─ master-styles/        3 imatges (referència visual, 1:1)
```

---

## 🚀 WORKFLOW RÀPID

### 1. Seleccionar Imatge
```bash
cd imatges/01-cartells
cat cartell-01-serrat-bruixes.md
```

### 2. Copiar Prompt
- Prompt està dins cada fitxer `.md`
- Format llest per Midjourney/Flux

### 3. Generar
```bash
# Midjourney exemple
/imagine --ar 2:3 [PROMPT_FROM_FILE]
```

### 4. Guardar Resultat
```bash
# Copiar imatge generada a carpeta corresponent
cp downloaded-image.jpg 01-cartells/cartell-01-serrat-bruixes.jpg
```

### 5. Validar
- Revisar checklist al final de fitxer `.md`
- Confirmar aspecte ratio, resolució, contrast

---

## 📋 CONTINGUT PER CARPETA

### 01-CARTELLS/ (6 imatges)
Cartells físics A2, impressió 300 dpi, format 2:3

```
cartell-01-serrat-bruixes.md     Quadrat Polibi, fogueres
cartell-02-font-ferro.md          Recepta tinta, taula torns
cartell-03-planes-bones.md        Mapa grid 4×4, regles patrulla
cartell-04-cementiri.md           Làpides, fragment carta
cartell-05-pla-masset.md          Control emissari, passaport
cartell-06-rectoria.md            Caixa almoines, elements
```

### 02-SCENES/ (5 imatges)
Escenes narratives webapp, 9:16 (375×667), JPG

```
scene-07-vigies-fogueres.md       Turons nit, fogueres
scene-08-font-ferro-agua.md       Font diürna, recollida aigua
scene-09-patrol-night.md          Patrulla nocturna, carrer
scene-10-cemetery-night.md        Cementiri nit, làpides
scene-11-rectoria-day.md          Rectoria dia, context
```

### 03-DOCUMENTS/ (7 imatges)
Cartes i documents pergamí, 3:4 (375×500), JPG

```
document-17-carta-bernat.md       Carta original traïdor, segell
document-18-carta-falsa.md        Carta falsa rector, quasi idèntica
document-19-nota-capita.md        Nota capità, billet curt
document-20-declaracio-rector.md  Declaració jurament, signature
document-21-calligrafia.md        Exercici nens escola
document-22-taula-vigies.md       Taula senyals fogueres
document-23-llibreta-torns.md     Registre diàri font
```

### 04-PORTRAITS/ (4 imatges)
Retrats personatges, 3:4 (240×320 card, 375×500 modal), PNG

```
portrait-24-bernat-master.md      Mestre escola, ~60 anys
portrait-25-ramon-rector.md       Rector, 40–50 anys
portrait-26-emissari-agent.md     Agent capità, severo
portrait-27-anton-sacristan.md    Escolà jove, dutxós
```

### 05-ICONS/ (5 imatges)
Icones UI navegació, 1:1 (48×48 o 60×60), PNG

```
icon-28-mapa.md                   Botó MAPA (48×48)
icon-29-quadern.md                Botó QUADERN (48×48)
icon-30-scanner.md                Botó ESCANEJA QR (60×60, central)
icon-31-historia.md               Botó HISTÓRIA (48×48)
icon-32-salvos.md                 Botó SALVOS (48×48)
```

### 06-MAPS/ (2 imatges)
Mapes interactius SVG, 1:1 (330×330), SVG

```
map-35-guixa.md                   Mapa poble Guixa, 1:1
map-36-planes-bones-grid.md       Grid 4×4 patrulla, 1:1
```

### MASTER-STYLES/ (3 imatges)
Referència visual per coherència, ús `--sref` Midjourney

```
master-diurna.md                  Acte I (investigació), llum natural
master-nocturna.md                Acte II (traïció), clarobscur
master-alba.md                    Acte III (alba), urgència
```

---

## 📝 FORMAT CADA FITXER

```markdown
# [ID] — [Títol Imatge]

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | [ex: cartell-01-serrat-bruixes] |
| **Categoria** | [Cartell / Scene / Document / Portrait / Icon / Map] |
| **Acte** | [I / II / III] |
| **Estació** | [Serrat Bruixes / Font Ferro / ...] |

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | [2:3 / 9:16 / 3:4 / 1:1] |
| **Dimensions Mòbil** | [375×667 / 375×500 / 48×48] |
| **Format** | [JPG / PNG / SVG] |
| **Comportament** | [Static / Scroll / Tap-zoom / Interactive] |

## Descripció Narrativa

[Descripció detallada de l'objecte, atmosfera, context medieval]

## PROMPT PER GENERAR (Midjourney/Flux)

```
[PROMPT complet en anglès, 200-400 paraules]
[Inclou: escena, materiales, llum, paleta, estil, exclusions]
```

## Paràmetres Midjourney

```
/imagine --ar [2:3|9:16|3:4|1:1] --niji 6 --stylize 200 --quality 2 [PROMPT]
```

O bé:

```
/imagine --ar [2:3|9:16|3:4|1:1] --sref [MASTER_STYLE_URL] [PROMPT]
```

## Checklist Validació

- [ ] Aspecte ratio correcte
- [ ] Resolució adequada (375px mòbil o A2 300dpi print)
- [ ] Text llegible (mínimo 14–16px)
- [ ] Contrast WCAG AA
- [ ] Sense elements moderns (pre-1800)
- [ ] Medieval autentic (1705, Osona)
- [ ] Materials visibles (pedra, fusta, ferro, terra)
- [ ] Zero anacronismes
- [ ] Mida archivo optimitzada (<400KB JPG, <150KB PNG)

## Status Producció

- [ ] PER_DISSENYAR
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)

## Notas Addicionals

[Qualsevol informació extra, inspiració, restriccions especials]
```

---

## 🔗 RELACIONS AMB DOCS SISTEMA

Cada imatge està documentada a:
- `LLISTA_IMATGES_COMPLETA.md` — Inventari complet (37)
- `PLANTILLA_SPECIFICACIONS_IMATGES.md` — Sistema plantilla
- `GUIA_ASPECTE_RATIOS_MOBIL_v2_SIMPLIFIED.md` — Aspecte ratios mobile-only
- `PLANTILLA_MASTER_STYLE_ASSET.md` — Coherència visual

---

## ⚡ WORKFLOW PRODUCCIÓ (PÀS A PAS)

### FASE 1: MASTER STYLES (Avui, 3-4h)

```bash
cd master-styles/
cat master-nocturna.md         # Copiar prompt
# Generar amb Midjourney
# Guardar --sref URL a CACHE.md
```

### FASE 2: CARTELLS (Dia 2-3, 6-8h)

```bash
cd 01-cartells/
for file in cartell-*.md; do
  cat $file | grep -A 50 "PROMPT"    # Copiar prompt
  # Generar cada cartell
  # Guardar resultat: cartell-XX.jpg
done
```

### FASE 3: WEBAPP IMAGES (Dia 3-5, 12-16h)

```bash
cd 02-scenes/
for file in scene-*.md; do
  # Idem: copiar prompt → generar → guardar
done

cd 03-documents/
# Idem

cd 04-portraits/
# Idem

cd 05-icons/
# Idem (aspecte ratio 1:1 més ràpid)

cd 06-maps/
# Generar SVG (format vector, no raster)
```

### FASE 4: VALIDACIÓ (Dia 5-6, 4-6h)

```bash
# Verificar cada imatge
# Checklist validació
# Optimitzar mides si necessari
# Copiar a public/images/
```

---

## 📊 ESTIMACIÓ TEMPORAL

| Fase | Tasca | Temps |
|------|-------|-------|
| 1 | Master Styles (3 imatges) | 3–4 h |
| 2 | Cartells (6 imatges) | 6–8 h |
| 3 | Scenes (5 imatges) | 2–3 h |
| 3 | Documents (7 imatges) | 3–4 h |
| 3 | Portraits (4 imatges) | 2–3 h |
| 3 | Icons (5 imatges) | 2–3 h |
| 3 | Maps (2 imatges) | 2–3 h |
| 4 | Validació totes (37) | 4–6 h |
| — | **TOTAL** | **~25–35 h** |

---

## 🎯 COMANDAS RÀPIDES

### Copiar totes els prompts a text

```bash
cd imatges/
find . -name "*.md" -type f -exec grep -l "PROMPT" {} \; | sort
```

### Comptar imatges per categoria

```bash
ls -1 01-cartells/ 02-scenes/ 03-documents/ 04-portraits/ 05-icons/ 06-maps/ | wc -l
# Resultat: 29 (+ 3 master styles = 32 total webapp, + 6 cartells fysic = 38 total)
```

### Validar que tots els fitxers hi són

```bash
expected=37
actual=$(find . -name "*.md" -type f | wc -l)
echo "Esperats: $expected, Actuals: $actual"
```

---

## ✅ CHECKLIST CARPETA INICIAL

- [ ] Totes 6 subcarpetes creades
- [ ] README.md present
- [ ] Fitxers `.md` per cada imatge (29 webapp + 3 master + 6 cartells = 38 total)
- [ ] Cada fitxer té: ID, AR, Dimensions, Prompt, Midjourney params, Checklist
- [ ] Master Styles clarament marcats
- [ ] Status "PER_DISSENYAR" a tots els fitxers

---

## 📞 SUPORT

- Dubtes sobre prompt? → Veure `LLISTA_IMATGES_COMPLETA.md`
- Aspecte ratio? → `GUIA_ASPECTE_RATIOS_MOBIL_v2_SIMPLIFIED.md`
- Coherència visual? → `PLANTILLA_MASTER_STYLE_ASSET.md`
- Template per omplir? → `PLANTILLA_SPECIFICACIONS_IMATGES.md`

---

**Data creació:** 17 de setembre de 2026  
**Status:** ✓ Estructura llesta per producció  
**Próxim:** Generar Master Styles → Generar imatges webapp → Print cartells
