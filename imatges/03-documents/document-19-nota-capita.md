# DOCUMENT-19 — Nota del Capità

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | document-19-nota-capita |
| **Categoria** | Webapp Document (Evidència Probatoria) |
| **Acte** | III — L'Alba |
| **Estació** | Rectoria — Caixa de les Almoines |
| **Rol en Gameplay** | Pista Visual + Context Motiu Traïció |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 2:2.5 (375×280 px aproximat — format billet compact) |
| **Dimensions Mòbil Card** | 375×280 px (visible complet sense scroll) |
| **Dimensions Total** | 750×560 px (hi cap sense reducció) |
| **Format** | JPG |
| **Compressió** | 80% quality |
| **Mida Fitxer** | ~120–150 KB |
| **Comportament** | Card visible + Tap fullscreen modal + Pinch-zoom (és text curt) |

---

## Descripció Narrativa

**Context Joc:**
Els jugadors obren la Caixa de les Almoines i troben aquesta **nota curtíssima, cruel i directa** del Capità de la Guarnició de Vic. No és un full oficial, sinó un **billet privat** — una amenaça escrita pel militar que va forçar Bernat a traïr els conjurats.

La nota revela:
1. **El motiu de la traïció:** En Jaume, fill de Bernat, és pres a Vic
2. **La promesa:** "el vostre fill dorm a casa" = alliberat si arriba la carta
3. **La contrasenya fatal:** "l'alba ve de Vic" — els jugadors han de dir esto a l'Emissari
4. **L'ultimàtum:** Noms a trenc d'alba o Jaume segueix a la presó

**Contingut de la Nota:**
- Format: Full petit de paper militar blanc, secó, oficial
- Text manuscrit: Breu, brutal, en castellà amb algunes paraules en català
- Signature: "El Capità" (sense nom, pura autoritat)
- Data: (sense data específica)
- Atmosfera: Cruel, calculada, ordre militar

**Pista Clau:**
Aquesta nota **explica per quin motiu Bernat va traïr**. Els jugadors entenen que no era malvat, sinó desesperit: tenia un fill pres. Els porta a una decisió moral al final: acceptar el tracte que Bernat ofereix (fugir amb els camins segurs) o rebutjar-lo (lliurar-lo als dragons).

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Military note from a garrison captain, 1705 Spain. White paper, official military style, hand-written but brief and cold.

CRITICAL TEXT (handwritten, sparse):
"Els noms a trenc d'alba, i el vostre fill dorm a casa. 
Qui porti la carta dirà: l'alba ve de Vic."

Signed: "El Capità" (no personal name, pure military authority)

Translated essence: 
"Names at dawn, and your son sleeps at home. Whoever brings the letter will say: dawn comes from Vic."

VISUAL TONE:
- Paper is white, military-grade (not parchment), thin but robust
- Writing is fast, authoritative, cold (not calligraphic)
- Minimal decoration or formality—pure threat
- Ink is black (military standard)
- Edges are clean (folded military dispatch, not worn)
- Perhaps a wax seal (simple, red, just a crown or castle—Spanish military mark)

PHYSICAL DETAILS:
- Paper shows one or two fold creases (military dispatch folded in thirds)
- No coffee stains—this is a fresh threat
- Signature "El Capità" is large and forceful
- Bottom margin blank (economical military writing)

VISUAL STYLE: Photograph of aged military note. Zenital lighting. Natural shadows. 
Black ink on aged white paper (aging is subtle—this is newer than other docs, from ~May 1705).

Dimensions: Compact (2:2.5 aspect ratio, 375×280 px). Entire note must fit in frame without zoom.

Negative: modern office paper, printed fonts, contemporary ink, decorative borders,
colored paper, elaborate seals, parchment (it's NOT parchment—it's military paper),
people, hands, any bright colors.
```

---

## Paràmetres Midjourney

```
/imagine --ar 2:2.5 --quality 2 --niji 6 [PROMPT]
```

**Aspect ratio exact: 375÷280 = 1.339, arrodonit a 2:2.5 (0.8) o custom 4:3 (1.33)**
```
/imagine --ar 4:3 --quality 2 --niji 6 [PROMPT]
```

---

## Renderització en Webapp

### Card View (Quadern d'Evidències)
```
Visible: 375×280 px (complet sense scroll)
Comportament: Static card
Tap/Click: Obri modal fullscreen (mateix size)
```

### Modal Fullscreen
```
Viewport: 375×812 px (mòbil)
Image: 375×280 px (nota complet visible, centrat)
Comportament:
  - Pinch-zoom enabled per veure signatura i detalls
  - Context tooltip: "Nota del Capità — Motiu de la traïció"
  - Text visible i llegible sense zoom
```

### CSS/Next.js
```jsx
<img src="/documents/nota-capita.jpg" 
     alt="Nota del Capità"
     className="w-full h-auto"
     style={{maxWidth: "375px", maxHeight: "280px"}} />
     
// En modal:
<div className="modal modal-warning">
  <p className="tag-new">Dins Caixa de les Almoines</p>
  <img src="/documents/nota-capita.jpg" 
       style={{width: "100%", maxHeight: "500px"}} 
       onDoubleClick={() => setZoom(2)} />
  <p className="caption">Nota del Capità de Vic. Motiu: Jaume, fill de Bernat, és pres a la guarnició.</p>
  <p className="dramatic-quote">"El vostre fill dorm a casa."</p>
</div>
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 4:3 (375×280 px)
- [ ] Nota complet visible sense scroll ni crop
- [ ] Generat mínimo 750×560 px

**Visual i Autenticitat:**
- [ ] Paper blanc (no parchment, no grogós)
- [ ] Tinta negra nítida (no ancient)
- [ ] Foldre creases (militar dispatch)
- [ ] Text manuscrit cold i autoritari (no calligraphic)
- [ ] Signature "El Capità" gran i ferma

**Text i Llegibilitat:**
- [ ] Text "Els noms a trenc d'alba..." llegible sense zoom
- [ ] Signature clara
- [ ] Contrast negre sobre blanc: WCAG AAA
- [ ] Font size equivalent 16–18px (per card)

**Mood i Context:**
- [ ] Sensació de amenaça pura (no formal)
- [ ] Militarisme evident (oficial, económic, froid)
- [ ] Text breu (escalofriante per la brevedad)

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
**Joc 7 — Caixa de les Almoines:** Jugadors obren la caixa
1. Troben 3 documents: carta original, carta falsa, **esta nota**
2. Llegeixen: "Els noms a trenc d'alba" — entenen l'amenaça
3. Descobreixen: "el vostre fill dorm a casa" — motiu de Bernat
4. Aprenen: "l'alba ve de Vic" — contrasenya per a l'Emissari

### Contrasenya Crítica
Text exact: **"L'alba ve de Vic"**
- Els jugadors han de memoritzar esta contrasenya
- La hauran de dir a l'Emissari quan lliuren la carta falsa
- Si no la diuen, l'Emissari sap que és un engany

### Decisió Moral (Final)
La nota revela per què Bernat va traïr. Al final del joc:
- **Opció A:** Jugadors accepten el tracte de Bernat (fugir pels camins segurs)
  - Bernat desapareix, Jaume es reuneix amb seu pare
- **Opció B:** Jugadors rebutgen i lliuren Bernat als dragons
  - Jugadors guanyen igualment (3 min penalty però sense Bernat)

Ninguna opció és "millor"—ambdues són vàlides. La webapp mostra quin percentatge triad cada opció.

---

## Notas Addicionals

### Inspiració Artística
- **Referència:** Notes militars del XVII-XVIII (Spanish archives, Sevilla)
- **Estil:** Fotografia de billet militar. Negre sobre blanc. Minimalista.
- **Paleta:** Blanc paper, tinta negra, possible segell vermell

### Variants de Contrasenya (PENDENT)
La contrasenya pot canviar per variant:
- **Variant A:** "L'alba ve de Vic"
- **Variant B:** "Del Vic ve l'alba"
- **Variant C:** "La Vic brilla a l'alba"

**Tots els variants:** La nota és identificable com a font de la contrasenya.

### Nota de Seguretat Gameplay
- **Public:** Jugadors veuen la nota i la contrasenya
- **Private:** Servidor verifica que la contrasenya és correcta quan lliuren la carta
- **Punció:** Si no diuen la contrasenya o diuen una equivocada, l'Emissari detecta l'engany

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Crítica per gameplay (Joc 7, contrasenya)  
**Próxim:** Generar + Validar text llegible → Upload webapp
