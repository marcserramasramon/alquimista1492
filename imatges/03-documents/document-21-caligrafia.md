# DOCUMENT-21 — Exercici de Cal·ligrafia

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | document-21-caligrafia |
| **Categoria** | Webapp Document (Pista Visual) |
| **Acte** | I — La Investigació / II — La Traïció |
| **Estació** | Pla de Masset (desbloqueig en Joc 6) |
| **Rol en Gameplay** | Pista Visual + Evidència Connexió Bernat-Registre |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:4 (portrait vertical, paper escolar vell) |
| **Dimensions Mòbil Card** | 375×500 px (visible inicial) |
| **Dimensions Total** | 800×1000 px (si scroll necessari) |
| **Format** | JPG |
| **Compressió** | 75% quality |
| **Mida Fitxer** | ~200–250 KB |
| **Comportament** | Card visible + Tap fullscreen modal + Pinch-zoom (per veure escritura) |

---

## Descripció Narrativa

**Context Joc:**
Al desbloquejarse quan jugadors acusen l'Anton (primer intent), aquesta pàgina d'exercici escolar apareix com a evidència nova. És una pàgina de l'escola de la Guixa on els nens practiquen de lletra copiant **noms reals de difunts del registre parroquial**.

Els noms que els nens van practicar copiar apareixen exactament igual (però amb errades del picapedrer copiades) a **la carta del delator que va escriure al Virrei**. Això revela dos descobriments crítics:

1. **Bernat tenia accés diari al registre de difunts** (com a mestre d'escola)
2. **Els nens aprenen de lletra exactament de la mateixa manera que el delator va escriure la carta** (copiant noms de difunts)

**Contingut del Document:**
- Format: Full escolar vell, grogós, desgastat
- Exercicis de lletra en forma de repeticions i còpies de noms
- Noms de difunts: Josep Vilardell (1699), Maria Rovira (1698), Josep Vilardell (1690)
- Handwriting: infantil però cuidat, amb correccions del mestre
- Marca: "Escola de la Guixa, any de 1705" a la capçalera
- Atmosfera: Paper d'escola ancient, paper porós, tinta desgastada

**Pista Clau:**
Els noms copiats aquí apareixen (amb errades) a la carta del delator. Bernat era el **únic amb accés constant** a aquests materials. Això connecta Bernat amb la capacitat d'escriure la carta de forma forjada.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval schoolboy handwriting practice page, 1705 Catalonia. Aged yellowed paper, thin and worn at edges.

PRACTICE CONTENT: Rows of names copied repeatedly in childish but careful cursive script. 
Copybook format: lines repeated 3-5 times each for penmanship practice.

Names visible (handwritten):
- "Josep Vilardell" (repeated 3 times, progressively steadier hand)
- "Maria Rovira" (2 times)
- "Josep Vilardell" (1 more time)

Below, in a different, adult hand (teacher's correction): "Bé. Noms del registre. Aprendre lletra copiants els nostres difunts."
Translation implied: "Good. Names from the register. Learn letters by copying our dead."

Header at top (printed or stamped): "Escola de la Guixa · Exercici de lletra · Any MDCCV" (year 1705)

VISUAL DETAILS:
- Paper is yellowed, cream-brown, thin and fragile-looking (not modern paper)
- Ink is brown (schoolboy ink, not refined)
- Coffee stain or age spots visible (left corner, center)
- Margin notes in different hand (adult corrections)
- No eraser marks—corrections written over
- Worn creases from folding and storage in a wooden chest
- Absolutely NO modern elements, no pencil, no ballpoint marks

STYLE: Photograph of aged paper. Zenital lighting (top-down). Natural shadow only. 
Brown-sepia tones from aging. Texture visible (paper fiber, ink penetration).

Dimensions: Portrait (3:4 aspect). Text must be legible at card size (375×500px).

NEGATIVE: modern paper, printed fonts, digital text, plastic, ballpoint pen, pencil, contemporary marks,
color ink, people, hands, decorative borders, 20th+ century aesthetic, bright whites, any bright colors.
```

---

## Paràmetres Midjourney

```
/imagine --ar 3:4 --quality 2 --niji 6 [PROMPT]
```

**Amb Master Style (Acte I/II):**
```
/imagine --ar 3:4 --sref [MASTER_STYLE_SCHOOL_URL] --quality 2 [PROMPT]
```

---

## Renderització en Webapp

### Card View (Quadern d'Evidències)
```
Visible: 375×500 px (full page visible)
Comportament: Static card + tag "Desbloqueïda a Joc 6"
Tap/Click: Obri modal fullscreen amb zoom
```

### Modal Fullscreen
```
Viewport: 375×812 px (mòbil)
Image dentro modal: 375×500 px (full page visible)
Comportament: 
  - Pinch-zoom enabled per veure detalls de les lletres
  - Double-tap per zoom 2× (per comparar lletra infantil vs. carta traïdor)
  - Context tooltip: "Exercici d'escola — Noms copiats del registre de difunts"
```

### CSS/Next.js
```jsx
<img src="/documents/caligrafia-escola.jpg" 
     alt="Exercici de Cal·ligrafia de l'Escola"
     className="w-full h-auto"
     style={{maxHeight: "600px", opacity: 0.95}} />
     
// En modal fullscreen:
<div className="modal modal-info">
  <p className="tag-new">Desbloqueïda en Joc 6</p>
  <img src="/documents/caligrafia-escola.jpg" 
       onDoubleClick={() => setZoom(2)}
       style={{transform: `scale(${zoom})`, transformOrigin: "center"}} 
       onPinchZoom={(scale) => setZoom(scale)} />
  <p className="caption">Exercici de lletra de l'escola. Noms del registre de difunts. Els mateixos noms apareixen a la carta del delator.</p>
  <p className="hint">💡 Bernat tenia accés diari a aquests materials.</p>
</div>
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 3:4
- [ ] Full escolar complet visible 375×500 px sense distorsió
- [ ] Generat mínimo 1500px width per a sharp handwriting legibilitat
- [ ] Proporcions paper escolar realistes

**Visual i Autenticitat Medieval:**
- [ ] Paper envellit (grogós, no blanc modern)
- [ ] Textura visible (porós, no glossy)
- [ ] Tinta marró ancient (no negra moderna)
- [ ] Taques de café/envelliment naturals
- [ ] Creases de doblec visible (guardat plegat a una caixa)
- [ ] Escritura infantil però cuidada (cursiva) — és práctica

**Contingut de Text:**
- [ ] "Josep Vilardell" visible, repetit 3-5 vegades
- [ ] "Maria Rovira" visible
- [ ] Lletres són progressivament més fermes (cada repetició)
- [ ] Anotació adult (mestral correctió) llegible
- [ ] Header "Escola de la Guixa · 1705" visible

**Contrast i Llegibilitat:**
- [ ] Noms llegibles sense zoom (base 12–14px equivalent)
- [ ] Contrast tinta vs. paper: WCAG AA
- [ ] Anotació mestral distintiva (lletra adult diferent)

**Gameplay Context:**
- [ ] Es mostra com a desbloqueïda (tags, highlight)
- [ ] Mood: escolar ancient, humà, infantil però oficial
- [ ] Connexió clara amb registre de difunts (header, text)

---

## Status Producció

- [ ] **PER_DISSENYAR**
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] OPTIMITZAT (data: _____)
- [ ] TESTAT WEBAPP (data: _____)

---

## Context Gameplay Crític

### Moment de Desbloqueig
**Joc 6 — Pla de Masset (Acusació):** Quan jugadors acusen incorrectament l'Anton (primer intent)
1. Àudio de l'Anton: "He estat vetllant-lo tota la nit del 15!"
2. **DESBLOQUEIG:** Declaració rector + **Aquesta pàgina d'exercici**
3. Resultat: Els jugadors veuen que Anton és innocent
4. Conexió clau: Els mateixos noms que apareixen aquí apareixen a la carta traïdora

### Proves Vàlides que Usen Aquesta Evidència
- **Prova 5 (Joc 6):** "Full cal·ligrafia + noms registre" — permet acusar Bernat vàlidament
- **Justificació:** Bernat tenia accés diari, sap escriure, i els nens practiquen copiants noms de difunts

### Comparació amb Altres Evidències
- **Serrat de les Bruixes:** "Sap escriure" (traïdor no signa amb creu)
- **Font del Ferro:** "Dos càntirs escola" (per a tinta)
- **Planes Bones:** "Llum escola nit 15" (Bernat allà escrivint)
- **Cementiri:** "Noms copiats de làpida" (els mateixos noms que els nens practiquen)
- **Esta pàgina:** Connecta tots els elements (accés, saber escriure, noms, escola)

---

## Notas Addicionals

### Inspiració Artística
- **Referència:** Copybooks medievals (Biblioteca Nacional de Catalunya, Museu Nacional)
- **Estil:** Fotografia de document autentic, sense dramatització
- **Paleta:** Grogós, marró, tinta sèpia

### Variants de Noms (PENDENT)
Els noms específics podem variar segons la versió, però la mecànica és idèntica:

- **Variant A:** Josep Vilardell, Maria Rovira, Josep Vilardell
- **Variant B:** Jaume Coromines, Francesca Puig, Josep Vilardell
- **Variant C:** Maria Serrat, Antoni Masó, Josep Vilardell

**Tots els variants:** Els mateixos noms apareixen a la carta del delator (amb errades del picapedrer copiades).

### Context Educació Medieval
Els nens de l'época aprenien de lletra copiant documents reals: registres de difunts, contractes, noms de sants. Bernat, com a mestre, ensenyava aquesta pràctica i tenia accés constant al registre parroquial (arxiu de l'església).

---

**Última revisió:** 17 de setembre de 2026  
**Status:** URGENT — Joc 6 depèn d'aquesta  
**Próxim:** Generar + Validar que els noms coincideixin amb els de la carta → Upload webapp
