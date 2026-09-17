# CARTELL-06 — Rectoria: La Clau de les Almoines

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | cartell-06-rectoria |
| **Categoria** | Cartell Físic A4 |
| **Acte** | II/III — La Traïció & Alba |
| **Estació** | Rectoria |
| **Rol en Gameplay** | Narratiu + Transició a Joc 7 |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:4 (portrait) |
| **Dimensions** | 210×297 mm (A4) — cartell petit, discret |
| **DPI** | 300 (impressió) |
| **Format** | JPG color |
| **Laminat** | Sí, mate (protecció símbol, portabilitat) |
| **Ús** | Físic (interior rectoria o entrada, narratiu) |
| **Comportament Web** | N/A (peça de transició, sense webapp interactiu) |
| **Nota** | Cartell OPCIONAL: la mecànica real és webapp-based (joc 7) |

---

## Descripció Narrativa

**Context:**
La nit del 15 de maig, algú va intentar entrar a la rectoria. Mossèn Ramon es va defensar però es va desmayar. Abans de caure, va llençar la clau de la caixa de les almoines a la foscor (entre el Pla del Masset i la rectoria). La clau és l'única que obre la caixa crítica.

**Contingut del Cartell:**
- **Títol (Central, Urgent):** "LA CLAU... TROBEU-LA ABANS QUE ÉLL"
- **Missatge del Rector (3–4 línies):** Context de l'atac, defensa, desmay, clau llançada
- **Ubicació de la Clau:** "Està per terra, entre el Pla i la rectoria. Més amunt de la porta no hi serà."
- **Stakes:** "Qui la trobi pot obrir la caixa de les almoines. L'Emissari la cerca amb fanal."
- **Context (Part Inferior):** "Aquesta clau és L'ÚNICA que obri la caixa. Quan la trobin, la webapp es desbloqueja sola."
- **QR Opcional:** Accés directe a joc 7 (alternativa a cercar clau física)
- **Decoració:** Claus, candeles, caixa de les almoines (discret), urgència visual

**Atmosfera:**
Missatge urgent, manuscrit curseivo (no perfecte, por pressió). Tinta marró antiga. Pergamí envellit, lleugerament danyat (simular atac). Urgència narrativa: "L'Emissari la cerca". Estil: nota deixada pel rector, desperada però resoluta.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval Catalan rector's urgent message, 1705. Create a handwritten-style 
note from a wounded priest (mossèn Ramon) describing a nocturnal attack and 
a critical key hidden in darkness. 

CONTENT:
- Large bold urgent header: "LA CLAU... TROBEU-LA ABANS QUE ÉLL" (find it before HE finds it)
- Body text (handwritten-style, shaky but legible cursive): 
  "La nit del 15, algú va entrar a la rectoria amb intent de robar.
  Em vaig defensar, però em vaig desmayar.
  Abans de caure, vaig llençar la clau a la foscor.
  Està per terra, entre el Pla i la rectoria.
  Més amunt de la porta no hi serà.
  Qui la trobi pot obrir la caixa de les almoines."
- Secondary text (italicized, smaller): 
  "Aquesta clau és L'ÚNICA que obri la caixa.
  L'Emissari la cerca amb fanal. No es rendeixi.
  Quan la trobin, la webapp es desbloqueja sola."

DECORATIVE ELEMENTS: 
- Small keys scattered (not prominent, subtle)
- Candles/candlelight motif
- Alms box symbol (small, understated)
- Shadows suggesting darkness and urgency
- No bright colors, subdued medieval palette

STYLE: Aged parchment (cream) with dark brown ink. Handwritten quality (cursive, slightly shaky) 
suggesting desperation of moment written. Watermark or simple seal of rector (cross or symbol). 
Text hierarchy: large for urgency (header), medium for narrative (body), small for clarity (meta). 
Color: cream parchment, brown ink, subtle red/rust accents for urgency only.

QR PLACEHOLDER: 3×3 cm, bottom-right, for optional direct game 7 access.

Dimensions: A4 (210×297 mm). Ready for 300 DPI print, matte lamination (weatherproof).

Negative: modern fonts, photography, contemporary symbols, digital interface, 3D rendering, 
bright neon colors, digital calligraphy, ornate borders, profusion of decoration.
```

---

## Paràmetres Midjourney

```
/imagine --ar 3:4 --niji 6 --stylize 200 --quality 2 [PROMPT]
```

**Alternativa amb Master Style Alba:**
```
/imagine --ar 3:4 --sref [MASTER_STYLE_ALBA_URL] --niji 6 [PROMPT]
```

---

## Paràmetres Altres Motors

### Flux Pro
```
flux --aspect 3:4 --seed 0 --steps 50 [PROMPT]
```

### Stable Diffusion XL
```
--sampler euler --steps 30 --guidance_scale 7.5 --aspect 3:4 [PROMPT]
```

---

## Mecànica del Joc: Integració

### OPCIÓ A: Cercar Física la Clau (IMMERSIÓ TOTAL)

1. **Ubicació física:** Entre el Pla del Masset i la Rectoria (camí de nit)
2. **Cartell:** Dins la rectoria o entrada, indica "entre el Pla i aquí"
3. **Cerca:** Els jugadors caminen i busquen físicament
4. **Pista física:** Trobar un prop (clau de juguete, símbol, etiqueta QR)
5. **Desbloqueig:** Trobar la clau desbloqueja joc 7 (accés webapp automàtic)
6. **Alternativa:** Si no troben, QR codi permet accés directo (sense penalització)

### OPCIÓ B: Cartell Narratiu Solament (SIMPLE)

1. **Cartell:** Context narratiu dins rectoria
2. **Webapp:** Jog 7 es desbloqueja automàticament (entrada directa)
3. **Ús:** Els jugadors llegeixen cartell (atmosfera), entren webapp sense cercar
4. **Avantatge:** Simple, sense logística física, focus webapp

---

## Comportament en Joc

1. **Físic/Narratiu:** Cartell col·locat dins rectoria o entrada (visible)
2. **Context:** Jugadors descobreixen que Mossèn Ramon va defensar-se, va llançar clau
3. **Urgència:** L'Emissari la cerca — carrera narrativa
4. **Desbloqueig:** 
   - Via cercar física (opció A), o
   - Via QR directe (opció B), o
   - Automàtic accés webapp (sense cerca)
5. **Webapp:** Accés a joc 7 (Caixa de les Almoines - desxifra segells)

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 3:4 (A4 210×297 mm)
- [ ] Resolució 300 DPI
- [ ] Text deixa llegible des de 1 metre (urgència, context)
- [ ] Manuscript handwriting simulat (no digital, organic)

**Visual i Estil:**
- [ ] Pergamí envellit visible (cream, envellit)
- [ ] Tinta marró medieval (no negre sharp)
- [ ] Títol URGENT: gran, bold, negre
- [ ] Cos manuscript cursive (shaky, per pressió)
- [ ] Context secundari: italicada, més petita
- [ ] Claus i candeles: discretos (no protagonistes)
- [ ] Urgència visual: sense marges blancs excessius
- [ ] Marca rector: creu simple o segell (autenticitat)

**Contrast i Llegibilitat:**
- [ ] Contrast WCAG AAA (#F5E6D3 beige vs #3d2817 marró)
- [ ] Títol: 24pt+ bold, negre
- [ ] Cos: 14pt medium, manuscript style
- [ ] Context: 12pt italic, llegible però subtil
- [ ] Sense antialiasing pixelat

**Contingut Narratiu:**
- [ ] Context atac clar ("algú va entrar", "em vaig defensar", "em vaig desmayar")
- [ ] Ubicació clau específica ("entre el Pla i la rectoria", "per terra", "no més amunt de la porta")
- [ ] Stakes alts ("única clau", "caixa crítica")
- [ ] Urgència ("Emissari la cerca", "troben", "desbloqueja")
- [ ] Autenticitat: manuscrit, segell rector, edat

**QR Técnic (Opcional):**
- [ ] QR blanc quadrat, 3×3 cm (més petit que A2)
- [ ] URL correcta (verificar token joc 7)
- [ ] Contrast QR negre/blanc
- [ ] Ubicació: bottom-right (subtil)

**Impressió i Laminat:**
- [ ] JPG color (CMYK per print)
- [ ] Mida archivo: < 5 MB (A4 és petit)
- [ ] Laminat mate (protecció, simbol pot estar intempèrie)
- [ ] Sense artefactes de compressió

**Decisió Mecànica:**
- [ ] Decidit: cerca física (sí/no)
- [ ] Si SÍ: pista física (clau juguete, etiqueta) preparada
- [ ] Si NO: QR funciona com accés directo
- [ ] Validat: QR escaneig a mòbils de prova

---

## Status Producció

- [ ] **PER_DISSENYAR** ← Estado inicial
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] IMPRÈS I LAMINAT (data: _____)
- [ ] INSTAL·LAT A RECTORIA (data: _____)

---

## Notas Addicionals

### Inspiració Artística
- Manuscrits de sacerdots 1700s: notes urbans, cartes de refugi
- Estil: "handwritten manuscript", urgència visual
- Referència: cartes de monestirs medievals Catalonia

### Variants
**Una única versió** — igual per a totes les variants.

### Material Físic Recomanat
- Cartó flexible 200gsm (petit, portable)
- Plastificat mate 125 microns
- Format A4 (cabe dins butxaca)
- Opcional: clip o corda si es deixa al terra

### Ubicació Rectoria
- **Interior:** Entrada, porxo, taula
- **Exterior (Optional):** Cartell fixat fora rectoria (simula nota del rector)
- **Clau Física (Optional):** Amagada vora cartell o entre Pla i Rectoria (si cerca integrada)

### Mecànica Flexible
**Recomanació:** Cartell narratiu (A4, pequeno) + QR opcional (accés webapp sempre garantit).

Si temps limitat: cartell narratiu solament, accés webapp automàtic (sense cerca física).
Si immersió prioritat: integrar cerca física de clau (logística més complexa).

### Alternativa: Cartell Integrat a Rectoria
Ubicar cartell al porxo rectoria simulant nota deixada pel rector. Mecànica natural: jugadors arriben rectoria (física o webapp), troben cartell, busquen clau (opcional), accedeixen jog 7.

### Alternativa: Cartell Pur Narratiu (SEM CERCA)
Context i atmosfera solament. Jog 7 es desbloqueja per webapp automaticament. Els jugadors no busquen clau física (simple, sense logística).

### Cost Estimat
- Impressió A4 300 dpi: €1–2
- Laminat mate: €1–2
- Clau juguete (optional): €2–5
- **Total:** €4–9 (molt barat, A4 és petit)

---

## Arxius Relacionats

- `docs/cartells/cartell-06-rectoria.md` — Especificacions estació
- `GUIA_ASPECTE_RATIOS_MOBIL_v2_SIMPLIFIED.md` — Dimensions
- `PLANTILLA_MASTER_STYLE_ASSET.md` — Coherència visual

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Llist per generar (opcional, flexible en mecànica)  
**Próxim:** Generar amb Midjourney → Imprimir → Laminat → Decidir cercar física o webapp-only
