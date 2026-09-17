# CARTELL-02 — Font del Ferro: Tinta i Torns d'Aigua

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | cartell-02-font-ferro |
| **Categoria** | Cartell Físic A2 |
| **Acte** | I — La Investigació |
| **Estació** | Font del Ferro |
| **Rol en Gameplay** | Pista Visual + Taula de Torns |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 2:3 (landscape) |
| **Dimensions** | 420×594 mm (A2) |
| **DPI** | 300 (impressió) |
| **Format** | JPG color |
| **Laminat** | Sí, mate (resistir humitat font) |
| **Ús** | Físic (exterior, vora font, esquitxades) |
| **Comportament Web** | N/A (no es renderitza webapp) |

---

## Descripció Narrativa

**Context:**
La Font del Ferro és la única font del terme que conté aigua ferròsa. Aquesta aigua s'utilitzava per fer tinta de notari (remullant gales de roure). El cartell mostra la recepte tradicional i una taula de torns d'aigua recollit entre el 10 i el 16 de maig de 1705.

**Contingut del Cartell:**
- **Títol:** "TINTA DE GALES, A LA MANERA DELS NOTARIS" (negre sobre pergamí crem)
- **Recepte medieval:** Instruccions de preparació de tinta (3 nits de remull, gales + water rovellada)
- **Taula Central:** Registre de torns (7 files) amb dates (10-16 de maig) i noms de villans (Moliner, Ferrer, Escolà, Hostalera, Bernat)
- **Destacat:** Dia 12 de maig en negreta (clau narrativa: la carta del traïdor)
- **Decoració:** Fulles de gal·la, gots d'aigua, symbols de tinta medieval
- **QR:** Blanc quadrat (5×5 cm) cantonada inferior dreta

**Atmosfera:**
Pergamí envellit, tinta marró fosca, receptari medieval d'apotecari. Textura visible de gal·les i agua ferròsa. Contrast alt per exterior humit (font propera).

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval Catalan water registry placard, 1705. Set at Font del Ferro, 
a natural iron-rich spring in mountain village of La Guixa, Osona region. 
Create an aged parchment design displaying:

1. TOP SECTION: Historical ink-making recipe titled "TINTA DE GALES, A LA MANERA DELS NOTARIS" 
   written in Old Catalan script. Recipe reads: esclafeu gales de roure (crush oak galls), 
   soak in iron-rich spring water for three nights until water turns black-violet, 
   strain and add gum. Authentic medieval apothecary style.

2. CENTER: Clear registration table showing daily water collection records from May 10–16, 1705. 
   Seven rows with dates and villager names: Moliner, Ferrer, Escolà, Hostalera, Bernat. 
   May 12 row highlighted in bold (key narrative element). Table has clean lines, readable serif fonts.

3. DECORATIVE ELEMENTS: Oak gall leaves, water vessels, ink vials scattered naturally around margins. 
   Small symbols of fountain, drops, medieval writing instruments.

4. BOTTOM-RIGHT: White square placeholder (5×5 cm) for QR code.

Visual style: Aged cream parchment background with weathered texture. Dark brown medieval ink. 
High contrast for outdoor readability (outdoor setting near water). Table text serif 18–20pt, 
bold numbers 24pt. No modern elements, no digital fonts, purely 1700s aesthetic.

Dimensions: A2 (420×594 mm). Ready for 300 DPI print, matte lamination (water-resistant).

Negative: modern fonts, photography, people, animals, plastic, bright colors, 3D rendering, 
contemporary symbols, technology, blur.
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

1. **Físic:** Cartell col·locat a la Font del Ferro (vora la font, lloc natural)
2. **Protecció:** Laminat mate per resistir esquitxades, rosada, humitat
3. **Jugador escaneja QR** → Entrada a webapp estació 2
4. **Webapp mostra:** Joc "Tinta i Torns" (calculer dies, identificar sospitós)
5. **Taula del cartell** és referència per jugadors (data, noms, torns)
6. **Dia 12 destacat** és clau per desxifra: "Si la carta és de la nit del 15, qui va recollir l'aigua el dia 12?"

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 2:3 (A2 420×594 mm)
- [ ] Resolució 300 DPI (impressió clara)
- [ ] Text llegible des de 1,5 metres de distància
- [ ] Marges de seguretat (16mm tots costats)

**Visual i Estil:**
- [ ] Pergamí envellit visible (crem, no blanc)
- [ ] Tinta marró medieval (no negre digital)
- [ ] Recepte llegible (3–4 línies, estil apotecari)
- [ ] Taula 7 files clara, noms llegibles (Moliner, Ferrer, Escolà, Hostalera, Bernat)
- [ ] Dia 12 en negreta o destacat clarament
- [ ] Fulles de gal·les i símbols tinta discretos
- [ ] Zero tecnologia moderna

**Contrast i Llegibilitat:**
- [ ] Contrast WCAG AAA (#F5E6D3 beige vs #3d2817 marró)
- [ ] Recepte mínimo 16pt, taula 18pt, dates/noms 20pt
- [ ] Text sharp, sense pixelat
- [ ] Exterior humit: assegurar contrast alt

**Contingut Medieval:**
- [ ] Recepte de tinta autentica (1700s)
- [ ] Escriptura pseudo-medieval (XVI–XVII)
- [ ] Noms de persones reals (villans Guixa)
- [ ] Zero anacronismes (sense plastic, forats moderns)

**QR Técnic:**
- [ ] QR blanc quadrat, 5×5 cm
- [ ] URL correcta (verificar token estació-2)
- [ ] Contrast QR negre/blanc (verificat amb scanner)
- [ ] Ubicació: cantonada inferior dreta

**Impressió i Laminat:**
- [ ] JPG color (CMYK per print)
- [ ] Sense artefactes de compressió
- [ ] Mida archivo: < 10 MB
- [ ] Laminat mate (protecció humitat, anti-reflex)

---

## Status Producció

- [ ] **PER_DISSENYAR** ← Estado inicial
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] IMPRÈS I LAMINAT (data: _____)
- [ ] INSTAL·LAT A LA FONT (data: _____)

---

## Notas Addicionals

### Inspiració Artística
- Receptaris medievals: herbaris d'apotecari (XVI–XVII)
- Estil: "Waldseemüller cartografia" (nets, clàssic, gravat)
- Referència: documents notarials d'época

### Variants
- **Variant A:** Dia 12 destacat (base standard)
- **Variant B:** Dia 11 destacat (variant 2)
- **Variant C:** Dia 13 destacat (variant 3)

**Cartell 02 utiliza VARIANT A (dia 12 standard)**

**Producció:** Imprimir **3 cartells separats**, un per variant (o inserts modulars).

### Material Físic Recomanat
- Cartó rígid 350gsm
- Plastificat mate 125 microns
- Reforç de cantonades
- Fixació: cadena de ferro o cordes (robust contra vent, humitat)

### Seguretat Instal·lació
- **Ubicació:** Vora font, però no obstruint l'accés a l'agua
- **Altura:** 150–180 cm (alçada vista, segura de rociadas)
- **Protecció:** Allunyat del gorg directe, però suportarà esquitxades
- **Verificació:** Revisar dia anterior del joc (humitat, laminat intact)

### Cost Estimat
- Impressió A2 300 dpi: €5–8
- Laminat mate (protecció humitat): €3–5
- Suports + instal·lació: €10–20
- **Total per cartell:** €20–30 (× 3 variants = €60–90)

---

## Arxius Relacionats

- `docs/cartells/cartell-02-font-ferro.md` — Especificacions estació
- `GUIA_ASPECTE_RATIOS_MOBIL_v2_SIMPLIFIED.md` — Dimensions físic
- `PLANTILLA_MASTER_STYLE_ASSET.md` — Coherència visual

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Llist per generar  
**Próxim:** Generar amb Midjourney → Imprimir 3 variants → Laminat → Instal·lar
