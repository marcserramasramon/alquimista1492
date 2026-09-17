# PLANTILLA DE ESPECIFICACIONS VISUALS
## El Traïdor de la Guixa — Sistema de Coherència Visual

**Versió:** 1.0 | **Data:** 17 de setembre de 2026

---

## PREFACI: Principis de Coherència

El joc combina **elements físics impresos** (cartells a l'escenari) amb una **webapp medieval**. La coherència visual és crítica per:
- ✓ Immersió narrativa (1705, Pacte dels Vigatans)
- ✓ Legibilitat de pistes (jugadors sota estrès, llum exterior/interior)
- ✓ Impacte emocional per acte (I: Investigació → II: Traïció → III: Decisió moral)
- ✓ Accessibilitat (contrast alt, text gran, sense mode fosc)

---

## I. PLANTILLA ESTANDARDITZADA

Cada imatge es defineix amb aquest format (JSON o Markdown estructurat):

```json
{
  "_meta": {
    "id_unic": "[CATEGORIA]_[NUM]_[DESCRIPTOR]",
    "estat_producció": "[PER_DISSENYAR | EN_CURS | REVISAT | APROVAT]",
    "data_creació": "[ISO 8601]"
  },

  "context_narratiu": {
    "acte": "[Acte I: Investigació | Acte II: La Traïció | Acte III: L'Alba]",
    "estació": "[Serrat Bruixes | Font Ferro | Planes Bones | Cementiri | Pla Masset | Rectoria | Altre]",
    "rol_en_gameplay": "[Pista Visual | Document Probatori | Ambientació | Inventari | Recompensa Visual]"
  },

  "suport_i_distribució": {
    "suport_primari": "[Cartell Físic A2 | Cartell A3 | Webapp Hero | Webapp Item | Webapp Navbar]",
    "subtipus": "[Impressió Laminat | PNG Screen | SVG Interactiu | Fotografia Document]",
    "resolució": "[300 dpi (print) | 1024px (web) | 128px (icon)]",
    "espai_per_QR": "[Sí/No: ubicació]",
    "espai_per_text": "[Sí/No: zona reservada per CSS overlay]"
  },

  "subjecte_principal": {
    "objecte_o_escena": "[Descripció molt concreta: ex. 'Caixa de fusta medieval amb cadenat d'origen romà']",
    "estat_fisica": "[Desgastat, oxidat, intacte, ensangontat, cremat, mullat, etc.]",
    "period_historic": "[Medieval (XVI–XVII), exactitud 1705]",
    "materials_visibles": "[Fusta, ferro, pergamí, vidre, pedra, teixit, ceràmica]"
  },

  "element_clau_pista": {
    "existeix_pista": "[Sí/No]",
    "tipus_pista": "[Escrita (lletres/números) | Símbol (segell, marca) | Detall (color, proporció, danys) | Posició (ubicació espacial)]",
    "resolució_requerida": "[La pista es veu a 1m? A 50cm? Només amb zoom?]",
    "indici_narratiu": "[Què revela al jugador (ex: 'El traïdor sap de lletra' / 'Ja havia estat aquí']",
    "nivell_de_dificultad": "[Obvi | Mediano | Subtil | Ultra-oculta (necessita pista negativa)]"
  },

  "estil_visual_i_atmosfera": {
    "epoca_historica": "[Medieval tardà (XVI–XVII), Osona, rural]",
    "genere_artistic": "[Gravat medieval | Aquarel·la antiga | Miniatura iluminada | Fotografia de document envellit | Cartografia medieval]",
    "paleta_de_colors": {
      "color_dominant_1": "[Nom + Hex, ex: Or Vell #D4AF37]",
      "color_dominant_2": "[Nom + Hex]",
      "color_dominant_3": "[Nom + Hex]",
      "color_accentuat": "[Opcional, ex: Vermell Siena #A0522D]",
      "descripcio": "[Inspiració: pergamí envellit, tinta medieval, oxidació]"
    },
    "tonalitat_emocional": "[Investigació tranquil·la | Tensió creixent | Horror | Solemnitat | Urgència]",
    "il·luminacio_conceptual": "[Natural matinal | Clarobscur nocturn | Focus d'oli | Lluna | Sense especificar]"
  },

  "especificacions_tecniques": {
    "aspect_ratio": "[16:9 (hero web) | 1:1 (quadrat) | 3:4 (vertical) | 2:3 (cartell portrait) | Custom]",
    "format_sortida": "[PNG transparent | JPG | SVG | PDF (print)]",
    "dimensions_finals": "[WIDTHxHEIGHT en pixels o mm]",
    "espai_negatiu": "[Sí: descripció de zona lliure per CSS]",
    "estila_tipografica": "[Serif antiga (Cardo, EB Garamond) | Sans (Inter) | Monospace (Courier)]",
    "contrast_minima": "[WCAG AA per a text? Sí/No]",
    "sans_text_ilegible": "[Prioritat zero]"
  },

  "variants_i_adaptacions": {
    "variants_narratives": "[A/B/C per Acte I | Sense variants | Una per Acte]",
    "adaptacio_per_idioma": "[Català obligatori | Sense text | Tancat, no cal adaptació]",
    "adaptacio_per_accessible": "[Iconografia compatible? Text alternativo requerit?]"
  },

  "validació_gameplay": {
    "llegibilitat_exterior": "[Dia soleado: readable des de 1m? 2m?]",
    "llegibilitat_webapp": "[Mòbil 375px width: legible? Tablet?]",
    "temps_de_comprensio": "[<5seg per veure pista | 10-20seg per desentranyar | >1min per resoldre enigma]",
    "nivell_stress_jugador": "[Baja: tranquil·la exploració | Alta: pressa, soroll extern]"
  },

  "producció_i_logistica": {
    "prioritat": "[CRÍTICA (joc no funciona sense aquesta) | ALTA (millora experiència) | MITJANA | BAIXA (cosmètica)]",
    "complex_producció": "[Simple: generar + imprimir | Mitjà: retocs post-generació | Complicat: manual drawing]",
    "cost_estimat": "[€10–20 per print A2 laminat | Cost de generació AI zero]",
    "deadline": "[Abans de data X]"
  },

  "negative_prompt": {
    "no_incloure": "[Llista de coses que NO VOL: persones modernes, cotxes, text digital, filtres moderns, rostres deformats, etc.]"
  },

  "notas_especials": {
    "context_per_illustrador": "[Informació addicional, inspiracions, enllaços, restriccions]"
  }
}
```

---

## II. CATEGORIES ESTANDARDITZADES

### A) Tipus de Suport

| Suport | Ús | Resolució | Aspect Ratio | Espai Negatiu |
|--------|-----|-----------|--------------|---------------|
| **Cartell Físic A2** | Material exterior, estació del joc | 300 dpi (imprint) | 2:3 (420×594 mm) | QR 5×5 cm cantonada |
| **Cartell A3** | Alternativa portàtil | 300 dpi | 2:3 (297×420 mm) | QR 5×5 cm |
| **Webapp Hero** | Banner capdamunt pantalla | 1024 px width | 16:9 | 30% dreta: espai per botons |
| **Webapp Item** | Inventari, evidència | 512–1024 px | 1:1 o 3:4 | Sí: zoom espai superior |
| **Webapp Navbar** | Icona petita (botó) | 128 px | 1:1 quadrat | No, tota la imatge visible |
| **Document Screenshot** | Carta, nota, registre | 800–1000 px | 3:4 (portrait) | Per veure text complet |

### B) Funcions en Gameplay

| Funció | Requisit Visual | Prioritat | Exemple |
|--------|-----------------|-----------|---------|
| **Pista Directa** | Element clau és central, inequívoc, contrastant | CRÍTICA | Segell de la carta (ploma+clau) |
| **Pista Subtil** | Detall cimero necessita zoom o atenció prolongada | ALTA | Errada a la làpida (Corminas vs Coromines) |
| **Ambientació** | Estableix atmosfera i immersió, sense ser resoluble | MITJANA | Escena nocturna del cementiri |
| **Document Probatori** | Legible com a "evidència" al quadern, aspecto antic | ALTA | Carta de Bernat amb segell |
| **Inventari Visual** | Icona o objecte aïllat, identificable a cop de vista | BAIXA | Icona FOC (flama medieval) |
| **Recompensa/Èxit** | Icona positiva, ombra/glow opcional | BAIXA | Marcador "✓ RESOLT" amb or vell |

### C) Tons Emocionals per Acte

| Acte | Tonalitat | Il·luminació | Paleta Dominanta | Efecte Atmosfèric |
|------|-----------|--------------|------------------|------------------|
| **Acte I: Investigació** | Curiositat, prudència | Llum natural, claura | Marró + or vell + verd salat | Sigil medieval, seguretat |
| **Acte II: La Traïció** | Tensió, confusió, dubte | Clarobscur, ombres allargades | Negre + marró oxidat + vermell siena | Foscor, perill, traïció revelada |
| **Acte III: L'Alba** | Urgència, decisió moral, resolució | Llum d'alba freda / focus final | Negre carbó + or últim + blanc (alba) | Clímax, decisió irrevocable |

---

## III. PALETA ESTANDARDITZADA (webapp + print)

### Colors Base (WAI-WCAG AA)

```
Fons Principal:      #F5E6D3 (beige pergamí)
Text Principal:      #1a1a1a (negre fosc)
Text Secundari:      #4a3728 (marró fosc)
Accents Positius:    #D4AF37 (or vell)
Accents Perill:      #A0522D (siena vermell)
Descartat/Neutral:   #999999 (gris medieval)
Èxit:                #6B8E23 (verd oliva)

[En print 300 dpi: reproduïr amb tinta CMYK estàndard]
```

### Principis de Color

- **Nocturn:** Afegir azul fosc (#1a2e3d) sense saturar; mantenir calor amb or
- **Diari:** Beige + verd + marró naturals; evitar artificialitat
- **Distres:** Or vell sempre sobre negre o marró; mai sobre beige

---

## IV. VARIANT NARRATIVE (Actes I / II / III)

Algunes imatges varien segons acte o variant A/B/C del joc:

```
Variant de Dia:
  • Acte I:     Dia clau = 12 de maig (Font Ferro)
  • Acte I:     Dia clau = 11 de maig (variant B, llavors = 13 variant C)
  
Variant d'Escena:
  • Rectoria de Dia (Acte I) 
  • Rectoria en Atac (Acte II: ferida, desordre)
  • Caixa Oberta (Acte III: descoberta)
```

Quan sigui relevant, indicar **[VARIANT A]**, **[VARIANT B]**, **[VARIANT C]** a l'ID.

---

## V. CHECKLIST DE VALIDACIÓ

Per cada imatge finalitzada, validar:

- [ ] **Narratiu:** Coherent amb text de historia.md, jocs.md, evidencies.md
- [ ] **Visual:** Colors dins paleta; no elements moderns; datació 1705 OK
- [ ] **Gameplay:** Pista visible en temps real-play (no requereix 30 min d'anàlisi)
- [ ] **Print:** 300 dpi, dimensions correctes, text llegible a 1m
- [ ] **Web:** PNG transparent o JPG; escalable sense pixelació; càrrega <100KB
- [ ] **Accessible:** Contrast WCAG AA; sense text ilegible; simbol universal
- [ ] **Estil:** Gravat medieval o aquarel·la; zero photos modernes/futuristes

---

## VI. TEMPLATE COMPACT (per copiar-pegar)

```markdown
### [ID_IMATGE]
**Suport:** [Cartell A2 | Webapp | Item]  
**Funció:** [Pista | Ambientació | Document]  
**Acte:** [I/II/III]  

**Subjecte:** [Descripció breu de l'objecte principal]  

**Pista Clau:**  
- [Text/detall que revela el jugador]  
- Visibility: [Obvi / Mediano / Subtil]  

**Atmosfera:**  
- Tonalitat: [Investigació / Tensió / Urgència]  
- Il·luminació: [Natural / Nit / Focus]  
- Paleta: [3–4 colors]  

**Especificacions:**  
- Aspecte: [Ratio]  
- Dimensions: [px/mm]  
- Text: [Sí/No]  
- Variants: [A/B/C?]  

**Validació Gameplay:**  
- Llegible exterior / Mòbil / Tablet: [✓/✗]  
- Temps comprensió: [<5seg / 10–20seg / >1min]  

**Negative Prompt:**  
- No: [llista de coses a evitar]  

**Notas:**  
- [Context addicional]
```

---

## VII. EXEMPLE COMPLETAT (plantilla complet)

```json
{
  "_meta": {
    "id_unic": "DOC_CARTA_BERNAT_ORIGINAL",
    "estat": "PER_DISSENYAR",
    "data_creació": "2026-09-17"
  },

  "context_narratiu": {
    "acte": "Acte III: L'Alba",
    "estació": "Rectoria - Caixa de les Almoines",
    "rol_en_gameplay": "Document Probatori (evidència clau per acusar)"
  },

  "suport_i_distribució": {
    "suport_primari": "Webapp Item + Pantalla Física (simulada)",
    "subtipus": "PNG transparent (fotografia document)",
    "resolució": "1024 px width (web)",
    "espai_QR": false,
    "espai_per_text": false
  },

  "subjecte_principal": {
    "objecte": "Pergamí plegat (carta medieval) amb text manuscrit i segell de lacre",
    "estat_fisica": "Envellit, taques de tinta, plec visible del transport",
    "period_historic": "15 de maig de 1705",
    "materials_visibles": "Pergamí, tinta violàcia, lacre vermell"
  },

  "element_clau_pista": {
    "existeix_pista": true,
    "tipus_pista": "Símbol (segell de ploma + clau)",
    "resolució_requerida": "Visible a 1m (zoom disponible a web)",
    "indici_narratiu": "El segell és IDÈNTIC al del missatge inicial de Bernat → prova de traïció",
    "nivel_dificultad": "Mediano (necessita comparació amb altre document)"
  },

  "estil_visual_i_atmosfera": {
    "epoca": "Medieval tardà (1705), notariat medieval",
    "genere": "Fotografia de document antic (hiperrealista)",
    "paleta": {
      "color_1": "Or vellit + Marró #8B7355",
      "color_2": "Negre tinta #1a1a1a",
      "color_3": "Vermell lacre #C41E3A",
      "descripció": "Pergamí envellit amb taques autèntiques"
    },
    "tonalitat": "Traïció revelada, evidència de culpa",
    "il·luminacio": "Clarobscur: focus lateral que ressalta segell"
  },

  "especificacions_tecniques": {
    "aspect_ratio": "3:4 (portrait, com carta real)",
    "format": "PNG transparent",
    "dimensions": "800×1000 px",
    "espai_negatiu": false,
    "estil_tipographic": "Sense text (imatge pura del document)",
    "contrast": true,
    "sans_text_ilegible": true
  },

  "variants": {
    "variants_narratives": "Cap (única carta original)",
    "adaptacio_idioma": "Document medieval, sense traduccions modernes",
    "accessible": "Zoom disponible; simbol universal (segell = autoritat)"
  },

  "validació_gameplay": {
    "llegibilitat_exterior": "N/A (webapp)",
    "llegibilitat_mobile": "✓ Legible a 375px; zoom 1:1 per veure detall segell",
    "temps_comprensio": "5–10 seg per veure; 20–30 seg per identifi car identitat segell",
    "stress_jugador": "ALTA (moment clímax)"
  },

  "producció": {
    "prioritat": "CRÍTICA",
    "complex": "Mitjà (generació + retocs)",
    "cost": "Zero (AI) / €50–100 (illustrador professional)",
    "deadline": "Abans fase 3"
  },

  "negative_prompt": "NO: text legible en format nou, mans humans, elements moderns (pluma boli, teclat), fotografia de document digital, sobresaturació de color, plastic brillant"
}
```

---

## VIII. WORKFLOW RECOMANAT

### Per a cada imatge nova:

1. **Omplir template** (15 min)
   - ID + context + subjecte + pista clau

2. **Definir paleta i estil** (5 min)
   - Triar 3–4 colors de la paleta estandarditzada
   - Assignar tonalitat emocional (Acte I/II/III)

3. **Redactar prompt** (10 min)
   - Traduir plantilla a prompt natural (anglès)
   - Afegir "negative_prompt" per AI

4. **Generar** (varies minuts)
   - Midjourney / Flux / Stable Diffusion
   - O assignar a illustrador

5. **Validar** (15 min)
   - Checklist: narratiu, visual, gameplay, print, accessible, estil
   - Retocs si cal

6. **Aprovar** (État → APROVAT)

---

## IX. RECURSOS I ANNEXOS

### Paleta Estesa (opteu per especificacions)

```css
/* Webapp theme (Next.js) */
--color-parchment: #F5E6D3;
--color-text-dark: #1a1a1a;
--color-text-secondary: #4a3728;
--color-gold-old: #D4AF37;
--color-siena-red: #A0522D;
--color-olive-green: #6B8E23;
--color-gray-medieval: #999999;
--color-night-dark: #1a2e3d;
```

### Fonts Recomanades

- **Títols Medieval:** Cardo, EB Garamond (Serif ancien)
- **Text Webapp:** Inter, -apple-system (Sans, moderne però neutre)
- **Monospace (Códigos):** Courier New (pseudomedieval)

### Inspiració Artística

- Gravats medievals (XVI–XVII): Dürer, Lucas Cranach
- Aquarel·la històrica: John Singer Sargent, N.C. Wyeth
- Mapas medievals: Waldseemüller, Ortelius
- Fotografia de document antic: Biblioteca del Congreso, Internet Archive

---

**Darrera actualització:** 17 de setembre de 2026  
**Responsable:** Sistematització de coherència visual  
**Próxim pas:** Omplir plantilles específiques per cada imatge (37 total)
