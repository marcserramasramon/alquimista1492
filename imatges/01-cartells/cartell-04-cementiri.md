# CARTELL-04 — Cementiri: La Signatura del Difunt

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | cartell-04-cementiri |
| **Categoria** | Cartell Físic A2 |
| **Acte** | I — La Investigació |
| **Estació** | Cementiri |
| **Rol en Gameplay** | Pista Visual + Document Probatori |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 2:3 (landscape) |
| **Dimensions** | 420×594 mm (A2) |
| **DPI** | 300 (impressió) |
| **Format** | JPG b/n o color soft (monocrom o sèpia) |
| **Laminat** | Sí, mate (protecció humitat cementiri) |
| **Ús** | Físic (exterior, cementiri vell, fora de reixa) |
| **Comportament Web** | N/A (no es renderitza webapp) |
| **Nota Important** | **Làpides FICTICIES. No corresponen a tombes reals de la Guixa.** |

---

## Especificacions Tècniques

## Descripció Narrativa

**Context:**
El cartell mostra còpies de les inscripcions de tres làpides velles del fossar. Els noms estan gravats amb errades del picapedrer (PUQ en lloc de PUIG, CORMINAS, etc.). Segons la narrativa, el traïdor va copiar els noms d'aquestes làpides quan va falsificar la carta. Les errades són la clau per identificar-lo.

**Contingut del Cartell:**
- **Títol:** "LÀPIDES VELLES DEL FOSSAR" (negre sobre pergamí crem)
- **Subtítol:** "Còpia de les inscripcions, tal com les va gravar el picapedrer"
- **Nota clara:** "Làpides ficticies. No corresponen a tombes reals de la Guixa."
- **Tres Làpides (Part Central):**
  - AQUÍ IAU ANTONI PUCH · MORÍ LO ANY 1695
  - AQUÍ IAU JOSEPH CORMINAS, PAGÈS · MORÍ LO ANY 1698
  - AQUÍ IAU MARIA SARRAT · MORÍ LO ANY 1701
  - (Variants A/B/C alteren els noms: PUQ, CORMINES, SERRAT, etc.)
- **Context (Part Inferior):** "Aquestes làpides estan a la intempèrie des de fa dècades. Els noms estan gravats amb errades del picapedrer. Qui va escriure la carta va copiar els noms d'aquí, no dels registres ben escrits."
- **Decoració:** Caixa rectangular simulant pedra tallada per cada làpida, petita creu, símbols funeris
- **QR:** Blanc quadrat (5×5 cm) cantonada inferior dreta

**Atmosfera:**
Còpia de làpides medievals, serif (estil notari), text en negre sobre fons clar. Textura de pedra gravada visible. Errades del picapedrer subtils però clau. Context narratiu que explica la logica de les errades.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval Catalan cemetery placard, 1705. Create aged stone-carved tombstone 
rubbings or reproductions showing three epitaphs in Old Catalan, each displaying 
variations of spelling errors from the stoneworker (picapedrer):

EPITAPH 1: AQUÍ IAU ANTONI PUCH · MORÍ LO ANY 1695
EPITAPH 2: AQUÍ IAU JOSEPH CORMINAS, PAGÈS · MORÍ LO ANY 1698
EPITAPH 3: AQUÍ IAU MARIA SARRAT · MORÍ LO ANY 1701

Each epitaph within a stone-frame box (rectangular border simulating carved stone edge). 
Use serif font (medieval notary style, 18–20pt) with intentional letter variations 
showing carver mistakes (PUQ for PUIG, CORMINAS vs COROMINES, SARRAT vs SERRAT variations 
depending on variant A/B/C). 

Aged parchment background with subtle stone texture. Include small decorative cemetery 
symbols: simple cross at top-center, stoneworker's tools, death motifs (discrete, 
medieval — no modern skulls or gothic horror). 

IMPORTANT NOTE visible below epitaphs (14pt italic): "Aquestes làpides estan a la 
intempèrie des de fa dècades. Els noms estan gravats amb errades del picapedrer. 
Qui va escriure la carta va copiar els noms d'aquí, no dels registres ben escrits."

DISCLAIMER (small, top-left): "Làpides ficticies. No corresponen a tombes reals."

Add QR placeholder (5×5 cm) bottom-right. Color: cream parchment, dark brown medieval 
ink (serif), subdued grays for stone texture. Monocrom or soft sepia acceptable.

Dimensions: A2 (420×594 mm). Ready for 300 DPI print, matte lamination (cemetery humidity).

Negative: modern fonts, 3D stone renders, photographic realism, contemporary symbols, 
religious iconography (crosses too prominent), bright colors, digital artifacts.
```

---

## Paràmetres Midjourney

```
/imagine --ar 2:3 --niji 6 --stylize 200 --quality 2 [PROMPT]
```

**Alternativa amb Master Style Diurna:**
```
/imagine --ar 2:3 --sref [MASTER_STYLE_DIURNA_URL] --niji 6 [PROMPT]
```

---

## Paràmetres Altres Motors

### Flux Pro
```
flux --aspect 2:3 --seed 0 --steps 50 [PROMPT]
```

### Stable Diffusion XL
```
--sampler euler --steps 30 --guidance_scale 7.5 --aspect 2:3 [PROMPT]
```

---

## Comportament en Joc

1. **Físic:** Cartell col·locat al cementiri (fora de la reixa de tombes reals)
2. **Protecció:** Laminat mate per resistir humitat, rosada del cementiri
3. **Jugador escaneja QR** → Entrada a webapp estació 4
4. **Webapp mostra:** Joc "Signatura del Difunt" (comparar escriptures, identificar errades)
5. **Làpides del cartell** són referència per jugadors
6. **Errades subtils** (PUCH vs PUQ, CORMINAS vs COROMINES, SARRAT vs SERRAT) són clau de desxifra
7. **Validació:** Les respostas comparen errades del cartell amb la carta falsa

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 2:3 (A2 420×594 mm)
- [ ] Resolució 300 DPI
- [ ] Text llegible des de 1,5 metres
- [ ] Marges de seguretat (16mm tots costats)

**Visual i Estil:**
- [ ] Pergamí envellit visible
- [ ] Trois caixes/marcs de pedra clara (3 làpides diferenciades)
- [ ] Text serif (font notari, 18–20pt)
- [ ] Errades del picapedrer subtils però visibles (PUQ, CORMINAS, etc.)
- [ ] Dates en números àrabs (1695, 1698, 1701) clares
- [ ] Context narratiu llegible (14pt italicada)
- [ ] Disclaimer de làpides ficticies visible (top-left, petit)
- [ ] Creu i símbols funeris (discretos, medievals)
- [ ] Textura de pedra gravada visible

**Contrast i Llegibilitat:**
- [ ] Contrast WCAG AAA (#F5E6D3 beige vs #1a1a1a negre)
- [ ] Text serif: 18pt mínimo, negreta per dates
- [ ] Context text: 14pt italic, llegible però subtil
- [ ] Disclaimer: 10–12pt, clar però no dominant

**Contingut Medieval:**
- [ ] Noms reals de personatges (Puch, Corminas, Sarrat, Sarrat)
- [ ] Errades variables per variant (A/B/C)
- [ ] Escriptura pseudo-medieval (XVI–XVII)
- [ ] Zero anacronismes

**QR Técnic:**
- [ ] QR blanc quadrat, 5×5 cm
- [ ] URL correcta (verificar token estació-4)
- [ ] Contrast QR negre/blanc
- [ ] Ubicació: cantonada inferior dreta

**Impressió i Laminat:**
- [ ] JPG monocrom o sèpia (CMYK per print)
- [ ] Mida archivo: < 10 MB
- [ ] Laminat mate (protecció humitat cementiri)
- [ ] Sense artefactes de compressió

**Consideracions Historiques i Ètics:**
- [ ] Disclaimer clar que àpides són ficticies
- [ ] Nota que no corresponen a tombes reals
- [ ] Ubicació: fora de la reixa (no prop tombes reals)
- [ ] Respecte al cementiri: instruccions per jugadors de no tocar tombes reals

---

## Status Producció

- [ ] **PER_DISSENYAR** ← Estado inicial
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] IMPRÈS I LAMINAT (data: _____)
- [ ] INSTAL·LAT AL CEMENTIRI (data: _____)

---

## Notas Addicionals

### Inspiració Artística
- Làpides medievals reals: gravats de pedra XIX century (fotografia de rubbing)
- Estil: "gravat medieval", fonts serif notari
- Referència: làpides del cementiri de Vic, Osona (inspiració local)

### Variants
**IMPORTANT:** Cada variant té errades DIFERENTES. **Necessita 3 cartells separats.**

| Camp | Variant A | Variant B | Variant C |
|------|-----------|-----------|-----------|
| **Làpida 1** | ANTONIO PUCH | ANTONIO PUCH | ANTONIO PUQ |
| **Làpida 2** | JOSEPH CORMINAS | JOSEP CORMINAS | JOSEPH CORMINES |
| **Làpida 3** | MARIA SARRAT | MARIA SARRAT | MARIA SERRAT |

**Producció:** Imprimir **3 cartells separats**, etiquetats per variant.

### Material Físic Recomanat
- Cartó rígid 350gsm
- Plastificat mate 125 microns
- Reforç de cantonades
- Fixació: suports metàl·lics o cordes (robust)

### Ubicació Cementiri
- **Fora de la reixa** de tombes reals
- **Altura:** 100–150 cm (consultable de a prop)
- **Protecció:** Allunyat de làpides reals, segur
- **Nota:** Clarificar als jugadors que són ficticies

### Consideració Historica
Aquestes làpides són ficticies i narratives, no corresponen a tombes reals de la Guixa. La finalitat és gameplay (desxifra d'errades) i narrativa (revelar delator). Si es juga al cementiri real:
- Collocar cartell **fora de la reixa**
- Clarificar que són fictícies
- Respectar tombes reals: cap tocs, cap escriptura, cap dany

### Cost Estimat
- Impressió A2 300 dpi: €5–8
- Laminat mate: €3–5
- Suports + instal·lació: €10–20
- **Total per cartell:** €20–30 (× 3 variants = €60–90)

---

## Arxius Relacionats

- `docs/cartells/cartell-04-cementiri.md` — Especificacions estació
- `GUIA_ASPECTE_RATIOS_MOBIL_v2_SIMPLIFIED.md` — Dimensions
- `PLANTILLA_MASTER_STYLE_ASSET.md` — Coherència visual

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Llist per generar (3 variants)  
**Próxim:** Generar 3 variants amb Midjourney → Imprimir → Laminat → Instal·lació cementiri
