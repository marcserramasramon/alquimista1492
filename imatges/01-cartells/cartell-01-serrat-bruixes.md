# CARTELL-01 — Serrat de les Bruixes: El Codi de Fogueres

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | cartell-01-serrat-bruixes |
| **Categoria** | Cartell Físic A2 |
| **Acte** | I — La Investigació |
| **Estació** | Serrat de les Bruixes |
| **Rol en Gameplay** | Pista Visual + Taula Desxifra |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 2:3 (landscape) |
| **Dimensions** | 420×594 mm (A2) |
| **DPI** | 300 (impressió) |
| **Format** | JPG color |
| **Laminat** | Sí, mate (anti-reflexi exterior) |
| **Ús** | Físic (exterior, pluja) |
| **Comportament Web** | N/A (no es renderitza webapp) |

---

## Descripció Narrativa

**Context:**
Els vigies dels turons de vigilància es passen avisos amb fogueres. La nit del 15 de maig de 1705, els vigies van transmetre un missatge que ningú del poble sabia llegir.

**Contingut del Cartell:**
- Títol: "SENYALS DE FOC DE LA PLANA" (negre sobre pergamí beige)
- Subtítol: Explicació breu (pseudo-medieval, 3–4 línies)
- **Taula Central:** Quadrat de Polibi 5×5
  - Fila 1–5 (números verticals, esquerra)
  - Columna 1–5 (números horizontals, dalt)
  - Lletres: A–Z (sense J ni W) + Ç + punt (espai)
- **Decoració:** Petits símbols de fogueres/flames als marges, creuetes, símbol de muntanya
- **QR:** Blanc quadrat (5×5 cm) cantonada inferior dreta
  - URL: `https://app.traidor.cat/s/[TOKEN-STATION-1]`

**Atmosfera:**
Medieval autentic. Pergamí envellit. Gravat medieval. Sense tecnologia moderna.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval Catalan station placard, 1705 era. Set in the mountain pass of Serrat de les Bruixes. 
Create a historically accurate decipherment chart: a 5×5 grid of letters (A–Z, Ç, space dot) 
with numbers 1–5 on both axes representing fire beacon signal codes. 

Add a decorative header in Old Catalan script reading "SENYALS DE FOC DE LA PLANA" with explanation text below 
about watchers transmitting messages using bonfires. Include a decorative border of mountain peaks and 
small fire signal icons (flames, bonfire sketches) at the top and sides.

Visual style: Aged parchment beige background with dark brown medieval ink. Grid lines are sharp and dark. 
The letters are clear sans-serif, 18pt size. Numbers are bold serif, 24pt size. 

Include a white square placeholder at the bottom right corner (5×5 cm, representing QR code placement).

Medieval/XVI–XVII secolo aesthetic. No modern elements. High contrast for outdoor readability (2 meters away). 
Dimensions: A2 (420×594 mm). Ready for 300 DPI print and matte lamination.

Negative: modern text, digital fonts, photography, people, animals, contemporary symbols, 
bright colors, neon effects, 3D rendering.
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

1. **Físic:** Cartell col·locat al Serrat de les Bruixes (muntanya)
2. **Protecció:** Laminat mate per resistir vent, rosada, sol
3. **Jugador escaneja QR** → Entrada a webapp estació 1
4. **Webapp mostra:** Joc interactiu de desxifra (input text box)
5. **Taula de Polibi** dels cartell és referència per jugadors

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 2:3 (A2 420×594 mm)
- [ ] Resolució 300 DPI (impressió clara)
- [ ] Text llegible des de 2 metres de distància
- [ ] Marges de seguretat (16mm tots costats, no content al llindar)

**Visual i Estil:**
- [ ] Pergamí envellit visible (no gris modern)
- [ ] Tinta marró fosc medieval
- [ ] Taula 5×5 clara, sans-serif negre
- [ ] Números negreta/serif
- [ ] Símbol de fogueres discrets (no protagonistes)
- [ ] Zero tecnologia moderna (no text digital, no icones modernes)

**Contrast i Llegibilitat:**
- [ ] Contrast WCAG AAA (#F5E6D3 beige vs #1a1a1a negre)
- [ ] Text mínimo 18pt (números 24pt)
- [ ] Sense antialiasing pixelat (clean lines)

**Contingut Medieval:**
- [ ] Data 1705 implícita o explícita
- [ ] Escriptura pseudo-medieval (XVI–XVII)
- [ ] Lletres Ç (Catalan specific)
- [ ] Zero anachronismes (no plastic, no modern binding)

**QR Técnic:**
- [ ] QR blanc quadrat, 5×5 cm (proporció 1:1)
- [ ] URL correcta (verificar token station-1)
- [ ] Contrast suficient QR negre/blanc (verificat amb scanner)
- [ ] Ubicació: cantonada inferior dreta (no obstrueix taula)

**Impressió i Laminat:**
- [ ] JPG color (CMYK per print)
- [ ] Sense artefactes de compressió
- [ ] Mida archivo: < 10 MB (per a imprimir)
- [ ] Laminat mate (no brillant, mejor legibilitat exterior)

---

## Status Producció

- [ ] **PER_DISSENYAR** ← Estado inicial
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] IMPRÈS I LAMINAT (data: _____)
- [ ] INSTAL·LAT AL SERRAT (data: _____)

---

## Notas Addicionals

### Inspiració Artística
- Gravats medievals: Albrecht Dürer, Lucas Cranach
- Cartografia XVI–XVII: Waldseemüller, Ortelius
- Estil: "Waldseemüller map aesthetic" (antic, nets, clàssic)

### Variants
- **Variant A:** Missatge = "SAP DE LLETRA" (xifra FOC = 4)
- **Variant B:** Missatge = "ESCRIU" (variant dia 14, xifra 4)
- **Variant C:** Missatge = "LLEGEIX" (variant dia 16, xifra 4)

**Cartell 01 utiliza VARIANT A (dia 15 de maig standard)**

### Material Físic Recomanat
- Cartó rígid 350gsm (no flexible)
- Plastificat mate 125 microns
- Reforç de cantonades (corners reinforced)
- Fixació: cadena de ferro (outdoor resistant)

### Seguretat Instal·lació
- Col·locació: 150–180 cm altura (alçada vista)
- Localització: Visible, segura (no pas pel gual, no obstrucció camí)
- Protecció: Allunyat de rosada directa si possible, però resistant
- Vigilancia: Verificar integritat el dia anterior del joc

### Cost Estimat
- Impressió A2 300 dpi: €5–8
- Laminat mate: €3–5
- Suports + instal·lació: €10–20
- **Total per cartell:** €20–30

---

## Arxius Relacionats

- `LLISTA_IMATGES_COMPLETA.md` — Detalls cartell 1
- `GUIA_ASPECTE_RATIOS_MOBIL_v2_SIMPLIFIED.md` — Especificacions físic
- `PLANTILLA_MASTER_STYLE_ASSET.md` — Coherència visual

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Llist per generar  
**Próxim:** Generar amb Midjourney → Imprimir → Laminat → Instal·lar
