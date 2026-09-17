# DOCUMENT-17 — Carta Original de Bernat

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | document-17-carta-bernat |
| **Categoria** | Webapp Document (Evidència Probatoria) |
| **Acte** | III — L'Alba |
| **Estació** | Rectoria — Caixa de les Almoines |
| **Rol en Gameplay** | Pista Visual + Evidència Resolució |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:4 (portrait vertical) |
| **Dimensions Mòbil Card** | 375×500 px (visible inicial) |
| **Dimensions Total** | 800×1000 px (si scroll necessari) |
| **Format** | JPG |
| **Compressió** | 75% quality |
| **Mida Fitxer** | ~200–250 KB |
| **Comportament** | Card visible + Tap fullscreen modal + Pinch-zoom |

---

## Descripció Narrativa

**Context Joc:**
Els jugadors han obert la Caixa de les Almoines amb el codi dels 4 elements. Dins troben la carta original que Bernat va escriure al Virrei Velasco, revelant els noms dels conjurats. La carta té un segell de lacre (ploma + clau) que és IDÈNTIC al missatge inicial que Bernat va enviar al principi del joc—la pista clau per acusar-lo de traïdor.

**Contingut de la Carta:**
- Format: Pergamí plegat, vell, amb taques de tinta
- Text manuscrit: Noms dels conjurats (no completament llegibles a la distància)
- Signature: "Bernat, Mestre d'Escola de la Guixa"
- Segell: Lacre vermell amb símbols de **ploma (escritura) + clau (secret/confiança)**
- Data: Variant A (15 de maig de 1705)
- Atmosfera: Pergamí envellit, tinta violàcia medieval, lacre vell

**Pista Clau:**
El segell de ploma + clau és EXACTAMENT el mateix del primer missatge que Bernat va enviar als jugadors—és la prova definitiva de la identitat del traïdor.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval handwritten letter document, 1705 Catalan. Aged parchment with folds and creases from carrying. 
Manuscript text in Old Catalan cursive script (illegible but visible handwriting, not decorative).

Signed by hand: "Bernat, Mestre d'Escola de la Guixa"

CRITICAL DETAIL: Red wax seal (lacre vermell) in lower right with embossed symbols of a quill pen 
(writing, authority) and a skeleton key (secrets, trust). The seal impression is deep and visible. 
The wax is aged, slightly cracked but intact. This is the EXACT same seal as the opening message 
of the game—visual proof of traitor identity.

Physical details: Parchment is cream-tan, worn at edges. Ink is violet-brown (period-accurate for medieval ink). 
Water stains and splotches of aged tinta. Creases from being folded and carried. No plastic, no modern binding.

Visual style: Photograph of aged medieval document. Sepia tones, natural aging patina. 
Lighting: Top-down view (zenital light), soft shadows, texture visible.
Dimensions: Portrait (3:4 aspect).

Negative: modern text, digital fonts, contemporary paper, plastic seals, bright colors, 
people, hands, decorative flourishes, printed text, typing marks, signatures that look digital.
```

---

## Paràmetres Midjourney

```
/imagine --ar 3:4 --quality 2 --niji 6 [PROMPT]
```

**Amb Master Style Nocturna (Acte III):**
```
/imagine --ar 3:4 --sref [MASTER_STYLE_ALBA_URL] --quality 2 [PROMPT]
```

---

## Renderització en Webapp

### Card View (Quadern d'Evidències)
```
Visible: 375×500 px (50% de la imatge)
Comportament: Static card
Tap/Click: Obri modal fullscreen
```

### Modal Fullscreen
```
Viewport: 375×812 px (mòbil)
Image dentro modal: 375×500 px (primera meitat visible)
Comportament: 
  - Scroll vertical within modal per veure resta
  - Double-tap per zoom 2×
  - Pinch-zoom enabled
  - Pinch-zoom target: Segell per veure detall ploma+clau
```

### CSS/Next.js
```jsx
<img src="/documents/carta-bernat.jpg" 
     alt="Carta Original Bernat"
     className="w-full h-auto"
     style={{maxHeight: "600px"}} />
     
// En modal fullscreen:
<div className="modal">
  <img src="/documents/carta-bernat.jpg" 
       onDoubleClick={() => setZoom(2)}
       style={{transform: `scale(${zoom})`}} />
</div>
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 3:4
- [ ] Visible mòbil 375×500 px sense distorsió
- [ ] Total altura 800×1000 px (si scroll needed)
- [ ] Generat mínimo 1500px width per a sharp scaling

**Visual i Autenticitat Medieval:**
- [ ] Pergamí envellit visible (textura, desgast)
- [ ] Tinta violàcia medieval (no negre modern)
- [ ] Taques d'aigua i envelliment autentical
- [ ] Creases de plegat visible
- [ ] Text manuscrit (no imprès, no digital)
- [ ] Signature manuscrita de mà

**Pista Clau: Segell de Lacre**
- [ ] Segell de lacre VERMELL visible (no gris)
- [ ] Símbol de ploma (writing quill) clarament visible
- [ ] Símbol de clau (key) clarament visible
- [ ] Segell és IDÈNTIC al segell del missatge inicial (verificar visió tàndem)
- [ ] Profunditat de seal impression visible (3D effect)
- [ ] Wax aging visible (cracks, pàtina)

**Contrast i Llegibilitat:**
- [ ] Text llegible sense zoom (base 14–16px equivalent)
- [ ] Signature llegible sense zoom
- [ ] Contrast text vs pergamí: WCAG AA
- [ ] Segell contrast: vermell vs negre background

**Comportament Webapp:**
- [ ] Card fits 375×500 sense crop crucial
- [ ] Zoom 2× allows players to see seal detail
- [ ] Scroll vertical reveals bottom half of document
- [ ] Pinch-zoom smooth (no lag)

---

## Status Producció

- [ ] **PER_DISSENYAR**
- [ ] EN_CURS
- [ ] REVISAT (verificar matching amb segell missatge inicial)
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] OPTIMITZAT (data: _____)
- [ ] TESTAT WEBAPP (data: _____)

---

## Comparació Segell: Validació Crítica

**Missatge Inicial (Bernat, Acte I):**
- ID: doc-XX-missatge-bernat
- Segell: Ploma + Clau
- Identitat: Codi XYZ

**Carta Original (Bernat, Acte III):**
- ID: document-17-carta-bernat
- Segell: Ploma + Clau (SAME AS ABOVE)
- Evidència: Tracció revelada

**Validació:**
- [ ] Segells són visuals idèntiques (mateix disseny, mida, proporcions)
- [ ] Color vermell lacre matching
- [ ] Profunditat i impressió matching
- [ ] Jugadors poden comparar a Quadern (tap each → zoom)

---

## Notas Addicionals

### Inspiració Artística
- **Documentos medievals:** Vaticani Archives, British Library medieval documents
- **Estil:** Fotografia zenital de document antic (no dramatitzat)
- **Referència:** Cartes XV–XVI secolo (real historical examples)

### Variants A/B/C
- **Variant A (Standard):** Data 15 de maig de 1705
- **Variant B:** Data 14 de maig de 1705
- **Variant C:** Data 16 de maig de 1705

**Per gameplay, tots els segells són IDÈNTIQUES (ploma + clau).**

### Context Gameplay
- **Descoberta:** Part del "joc 7–8: Caixa de les Almoines"
- **Comportament:** Jugadors obren caixa, troben 3 cartes (original, falsa, nota capità)
- **Comparació:** Quadern permet comparar segell d'aquesta carta amb missatge inicial
- **Conclusió:** Segells idèntiques = prova de culpa de Bernat

### Seguritat Gameplay
- **Fons:** Textura pergamí (no information leaking)
- **Text:** Manuscrit ilegible (saben els noms pels altres pistes, no per aquesta carta)
- **Segell:** Ultra-clear, és l'única cosa que importa veure detall

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Crítica per gameplay (pista clau)  
**Próxim:** Generar + Validar segell matching → Upload webapp
