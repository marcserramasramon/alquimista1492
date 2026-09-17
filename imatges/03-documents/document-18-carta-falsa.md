# DOCUMENT-18 — Carta Falsa del Rector

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | document-18-carta-falsa |
| **Categoria** | Webapp Document (Evidència Interactive) |
| **Acte** | III — L'Alba |
| **Estació** | Rectoria — Caixa de les Almoines |
| **Rol en Gameplay** | Pista Visual + Evidència Resolució (Joc 7) |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:4 (portrait vertical) |
| **Dimensions Mòbil Card** | 375×500 px (visible inicial) |
| **Dimensions Total** | 800×1100 px (scroll necessari) |
| **Format** | JPG |
| **Compressió** | 75% quality |
| **Mida Fitxer** | ~220–270 KB |
| **Comportament** | Card visible + Tap fullscreen modal + Tap-seal para validar |

---

## Descripció Narrativa

**Context Joc:**
Els jugadors han obert la Caixa de les Almoines amb la clau que van recuperar de la foscor. Dins troben tres documents: la carta falsa del rector, la carta original de Bernat (traïdor), i la nota del capità.

La carta falsa és la contingència que el rector va preparar per enganyar l'Emissari. Conté:
- **Noms falsos** de persones que no participen del Pacte dels Vigatans
- **Ubicació falsa** (no Sant Sebastià)
- **Hora falsa** de l'alba
- **Segell de Bernat** (que els jugadors han d'aprendre a identificar)

Els jugadors han de **validar que el segell és correcte** i seleccionar entre 4 segells falsos per segellar la carta correctament. Si encerten, la lliuren a l'Emissari.

**Contingut de la Carta:**
- Format: Pergamí plegat, similar a la carta original de Bernat
- Text manuscrit: Noms falsos (no reals), ubicació falsa, hora falsa
- Signature: "Bernat, Mestre d'Escola de la Guixa" (falsificació del rector)
- Segell: Vuit llocs per escollit el segell correcte (4 opcions válid 1x, 3 fals)
- Data: Variant A (15 de maig de 1705)
- Atmosfera: Pergamí envellit, BUT aparentment sospitós si es mira amb cura

**Mecànica Crítica:**
Aquesta és una carta **interactive** a la webapp. Els jugadors han de:
1. Veure la carta falsa
2. Comparar-la amb la carta original de Bernat (alle en el Quadern)
3. Identificar el segell correcte de Bernat (ploma + clau)
4. Seleccionar l'opció de segell correcta
5. Si correcte: la carta es segella i es prepara per lliurar-la

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval forged letter document, 1705 Catalan. Aged parchment with folds and creases. 
The letter appears similar to a real medieval document but contains false information—intentionally deceptive.

Handwritten text in Old Catalan cursive:
"[False names of non-conspirators]
Location: [False location—not Sant Sebastià]
Hour of dawn: [False time]"

Signed by hand: "Bernat, Mestre d'Escola de la Guixa"

CRITICAL SECTION: Bottom of letter has EIGHT WAX SEAL IMPRESSIONS IN A ROW (seal options):
- **SEAL 1 (CORRECT):** Red wax (lacre vermell) with embossed quill pen + skeleton key — THIS IS BERNAT'S REAL SEAL
- **SEAL 2 (FALSE):** Red wax with different symbols (lion rampant + scales)
- **SEAL 3 (FALSE):** Purple wax (anachronistic) with cardinal's hat
- **SEAL 4 (FALSE):** Brown wax with simple cross
- [Remaining seals: additional false options]

The player must recognize and click Seal 1 (quill + key) as the correct seal.

Physical details: Parchment is cream-tan, worn, deliberately distressed. Ink is violet-brown (same as traitor's real letter).
Creases from folding. Writing looks like Bernat's hand BUT the reader should notice subtle differences
if they compare carefully to the original letter (different letter proportions, slightly uneven baseline).

Visual style: Photograph of aged medieval document. Zenital lighting. Sepia tones.
The seals at bottom are clearly visible and distinct from each other (color, symbols).

Dimensions: Portrait (3:4 aspect). All eight seals must be visible and clickable-size.

Negative: modern text, digital fonts, contemporary paper, bright colors, people, hands,
decorative flourishes, printed text, 3D rendering, unrealistic aging.
```

---

## Paràmetres Midjourney

```
/imagine --ar 3:4 --quality 2 --niji 6 [PROMPT]
```

**Amb Master Style (Acte III Revelation):**
```
/imagine --ar 3:4 --sref [MASTER_STYLE_ALBA_URL] --quality 2 [PROMPT]
```

---

## Renderització en Webapp (INTERACTIVE)

### Card View (Quadern d'Evidències)
```
Visible: 375×500 px (carta visible, seals en baix a petit)
Comportament: Static card
Tap/Click: Obri modal fullscreen interactive
```

### Modal Fullscreen (INTERACTIVE GAME)
```
Viewport: 375×812 px (mòbil)
Image: 375×500 px (carta + seals visibles)
Comportament INTERACTIVE:
  - Mostra la carta al top
  - A baix: 8 seals per clickar (grid 4x2 o scroll horizontal)
  - Drag/drop OR tap seal per seleccionar
  - Validació en temps real: "Seal 1 (quill+key) ✓ CORRECTE"
  - Si incorrecte: "Seal incorrect. Torna-ho a provar."
  - Si correcte: Animació (seal s'il·lumina, gold glow) + "Carta segellada ✓"
```

### JavaScript (Interactivitat)
```jsx
function selectSeal(sealId, sealImageUrl) {
  const correctSeal = "seal_1_quill_key";
  
  if (sealId === correctSeal) {
    // Animate seal selection
    animateSealCorrect(sealId);
    showMessage("Carta segellada correctament ✓");
    unlockNextStep("ready_to_deliver_letter");
    playSound("seal_validation.mp3");
  } else {
    showError("Aquest segell és fals. Comprova el segell de Bernat.");
    playSound("seal_error.mp3");
  }
}

// Tap-to-zoom seals for detail inspection
let selectedSeal = null;
function inspectSeal(sealId) {
  selectedSeal = sealId;
  showZoomedView(`/seals/${sealId}.jpg`);
}
```

### CSS/Next.js
```jsx
<div className="letter-modal">
  <img src="/documents/carta-falsa.jpg" 
       alt="Carta Falsa del Rector"
       className="w-full h-auto mb-4" />
  
  <div className="seals-selector">
    <p className="instruction">Selecciona el segell correcte de Bernat:</p>
    <div className="seals-grid">
      {seals.map((seal) => (
        <button 
          key={seal.id}
          className={`seal ${selectedSeal === seal.id ? 'selected' : ''}`}
          onClick={() => selectSeal(seal.id)}
          onDoubleClick={() => inspectSeal(seal.id)}>
          <img src={seal.image} alt={seal.label} />
          <span>{seal.label}</span>
        </button>
      ))}
    </div>
  </div>
  
  <button className="btn-primary" disabled={!isCorrectSeal}>
    Segellar la carta
  </button>
</div>
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 3:4
- [ ] Carta visible 375×500 px sense distorsió
- [ ] 8 seals visibles i clickables (mínimo 48px cada)
- [ ] Generat mínimo 1500px width

**Visual i Autenticitat:**
- [ ] Pergamí envellit (textura, desgast)
- [ ] Tinta violàcia medieval (match amb carta original)
- [ ] Taques d'envelliment naturals
- [ ] Creases de plegat visible
- [ ] Text manuscrit (cursiva, no imprès)

**Segells (CRÍTIC):**
- [ ] **Seal 1 (CORRECTE):** Lacre VERMELL amb ploma + clau (match amb Document-17)
- [ ] Seal 2-4 (FALSE): Clarament diferents (colors, símbol)
- [ ] Tots els segells: depth 3D visible (impression en wax)
- [ ] Contrast color clar entre false i correcte

**Interactivitat Gameplay:**
- [ ] Seals són clickables (mínimo 48×48 px)
- [ ] Feedback visual en seleccionar
- [ ] Validació en temps real (backend)
- [ ] Animació si correcte (gold glow o similar)

**Text i Llegibilitat:**
- [ ] Text carta llegible (even si parcial)
- [ ] Signature "Bernat" clarament visible
- [ ] Data visible

---

## Status Producció

- [ ] **PER_DISSENYAR**
- [ ] EN_CURS
- [ ] REVISAT (validar seals matching Document-17)
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] OPTIMITZAT (data: _____)
- [ ] IMPLEMENTAT INTERACTIVITAT (data: _____)
- [ ] TESTAT WEBAPP (data: _____)

---

## Context Gameplay Crític

### Moment de Desbloqueig
**Joc 7 — Caixa de les Almoines:** Jugadors obren la caixa
1. Descobreixen 3 cartes: original, falsa, nota capità
2. Reben instrucció: "Segellar la falsa amb el segell correcte de Bernat"
3. **Mecànica:** Trien el segell correcte entre 8 opcions

### Validació Segell
**Backend va validar:**
- El segell triat (ID) és correcte (seal_1_quill_key)
- La carta és segellada (update database)
- Els jugadors estan llestos per entregar-la a l'Emissari

### Lógica de Prova
Els jugadors han vist:
- La carta ORIGINAL de Bernat (document-17) amb segell ploma+clau
- La FALSA (aquesta) que el rector va preparar
- Saben que el segell correcte és ploma+clau (l'han vist al document-17)

---

## Comparació Crítica: Seals

| Seal | Color | Símbol | Vàlid? | Context |
|------|-------|--------|--------|---------|
| **Seal 1** | Vermell (lacre) | Ploma + clau | ✓ CORRECTE | Match Document-17 |
| Seal 2 | Vermell | Lleó rampant + balança | ✗ Fals | Símbol judicial (anacrrònic) |
| Seal 3 | Violeta | Barret cardenal | ✗ Fals | Religiós (no Bernat) |
| Seal 4 | Marró | Creu simple | ✗ Fals | Parroquial (no Bernat) |
| Seal 5-8 | Varis | Varis | ✗ Falsos | Distracció |

---

## Notas Addicionals

### Inspiració Artística
- **Referència:** Cartes medievals forjades (British Library, documents XVII-XVIII)
- **Estil:** Fotografia document antic. Seals en alt contrast.
- **Paleta:** Crema pergamí, marró tinta, vermell lacre viu

### Variants de Noms Falsos (PENDENT)
- **Variant A:** [False names list A]
- **Variant B:** [False names list B]
- **Variant C:** [False names list C]

Tots els variants: **Seal 1 sempre és correcte (ploma+clau).**

### Nota de Seguretat
- **Public:** Els jugadors han de reconèixer el seal correcte
- **Private:** Backend valida la selecció i marca la carta com a segellada
- **No revela:** La solució final fins que hagin segellar correctament

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Crítica per gameplay (Joc 7)  
**Próxim:** Generar + Implementar interactivitat + Validar seals → Upload webapp
