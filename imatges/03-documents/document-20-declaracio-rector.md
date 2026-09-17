# DOCUMENT-20 — Declaració del Rector

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | document-20-declaracio-rector |
| **Categoria** | Webapp Document (Evidència Probatoria) |
| **Acte** | II — La Traïció / III — L'Alba |
| **Estació** | Pla de Masset (desbloqueig en Joc 6) |
| **Rol en Gameplay** | Pista Visual + Evidència Absolució |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:4 (portrait vertical) |
| **Dimensions Mòbil Card** | 375×500 px (visible inicial) |
| **Dimensions Total** | 800×1000 px (si scroll necessari) |
| **Format** | JPG |
| **Compressió** | 75% quality |
| **Mida Fitxer** | ~180–220 KB |
| **Comportament** | Card visible + Tap fullscreen modal + Pinch-zoom |

---

## Descripció Narrativa

**Context Joc:**
Els jugadors han acusat l'Anton l'Escolà com a traïdor. De repent, l'Anton arriba corrents: "El rector! L'han ferit!". I llavors, com a evidència desbloqueada, apareix aquesta declaració jurada del Rector Mossèn Ramon.

La declaració és un document oficial del rector, signat amb solemnitat religiosa, confirmant que Anton va vetllar-lo tota la nit del 15 al 16 de maig mentre ell estava malalt de febres. Esta és la **coartada perfecta que salva l'Anton** i força els jugadors a repensar qui és realment el traïdor.

**Contingut del Document:**
- Format: Full de pergamí blanc crema, vell, amb taques i envelliment
- Text manuscrit: Declaració jurada en català medieval (1705)
- Signature: "Mossèn Ramon, Rector de la Guixa" (signature gran i ferma)
- Data: 16 de maig de 1705
- Segell: Cera vermella amb creu (segell parroquial)
- Atmosfera: Document oficial, però feble (escrit mentre estava malalt), autoritat religiosa

**Pista Clau:**
La declaració prova que l'Anton tenia una coartada sòlida. Els nens han d'adonar-se que no pot ser ell. Llavors miren enrere i descobreixen que Bernat és el traïdor real.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval handwritten declaration document, 1705 Catalan. Aged parchment, cream-white with yellow-brown tones from age.
Manuscript text in formal Old Catalan cursive script for an official religious declaration ("Juro als sagrats evangelis...").

CRITICAL DETAIL: The declaration is signed by "Mossèn Ramon, Rector de la Guixa" in a strong, confident hand.
At the bottom, a red wax seal (wax lacre vermell) with a cross (segell parroquial). The seal is slightly 
damaged from age but still visible and impressive—it's an official parish seal.

Key Text (partially visible but in focus):
"Juro als sagrats evangelis que Anton de Manlleu ha passat la nit del 15 al 16 de maig vetllant-me mentre 
tremolava de febre. No va sortir de la Rectoria en tota la nit."

Physical details: Parchment is cream-tan, worn at edges, light stains from age. Ink is brown-black (period iron gall ink).
Signature is large and authoritative (rector's hand). Small water marks and creases from handling.
The seal wax shows cracks from time but is intact and visible.

Visual style: Photograph of aged medieval document. Zenital lighting (top-down). Sepia-warm tones, natural aging patina.
No plastic, no modern binding, no contemporary elements.

Dimensions: Portrait (3:4 aspect). Text must be legible at portrait card size (375×500px).

Negative: modern text, digital fonts, contemporary paper, plastic seals, bright colors, hands holding document,
decorative flourishes, printed text, typing marks, people, any anacronisms.
```

---

## Paràmetres Midjourney

```
/imagine --ar 3:4 --quality 2 --niji 6 [PROMPT]
```

**Amb Master Style (Acte II/III Transition):**
```
/imagine --ar 3:4 --sref [MASTER_STYLE_REVELATION_URL] --quality 2 [PROMPT]
```

---

## Renderització en Webapp

### Card View (Quadern d'Evidències)
```
Visible: 375×500 px (full document visible)
Comportament: Static card, highlight border (nova evidència desbloqueïda)
Tap/Click: Obri modal fullscreen
```

### Modal Fullscreen
```
Viewport: 375×812 px (mòbil)
Image dentro modal: 375×500 px (document complet visible sense scroll)
Comportament: 
  - Pinch-zoom enabled per veure signature i seal
  - Double-tap per zoom 2×
  - Context tooltip: "Declaració oficial del Rector — Coartada de l'Anton"
```

### CSS/Next.js
```jsx
<img src="/documents/declaracio-rector.jpg" 
     alt="Declaració del Rector"
     className="w-full h-auto"
     style={{maxHeight: "600px", border: "3px solid var(--accent-gold)"}} />
     
// En modal:
<div className="modal modal-success">
  <p className="tag-new">Desbloqueïda</p>
  <img src="/documents/declaracio-rector.jpg" 
       onDoubleClick={() => setZoom(2)}
       style={{transform: `scale(${zoom})`}} />
  <p className="caption">Coartada de l'Anton verificada. Bernat és el traïdor.</p>
</div>
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 3:4
- [ ] Document complet visible 375×500 px sense distorsió
- [ ] Generat mínimo 1500px width per a sharp scaling
- [ ] Proportions pergamí realistes

**Visual i Autenticitat Medieval:**
- [ ] Pergamí envellit visible (textura, desgast natural)
- [ ] Tinta marró-negra medieval (no negra modern)
- [ ] Taques d'envelliment, taca d'aigua légera
- [ ] Creases subtils de holding/storage
- [ ] Text manuscrit formal (cursiva oficial, no casual)
- [ ] Signature del rector gran i confiada

**Segell Parroquial:**
- [ ] Segell de lacre VERMELL visible a baix
- [ ] Creu clara dins el segell (croix pattée o similar)
- [ ] Wax aging visible (cracks, patina natural)
- [ ] Depth i impressió 3D visible
- [ ] Contrast vermell vs pergamí clara

**Text i Llegibilitat:**
- [ ] Text "Juro als sagrats evangelis..." parcialment llegible
- [ ] Signature "Mossèn Ramon" clarament llegible
- [ ] Data "16 de maig de 1705" visible
- [ ] Contrast text vs pergamí: WCAG AA
- [ ] Sense blur o distorsió

**Gameplay Context:**
- [ ] Es mostra desbloqueïda (marcat als efectes webapp)
- [ ] Border o highlight distintiu (és novetat)
- [ ] Mood: oficial, formal, però humà (rector malalt escrivint)

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
**Joc 6 — Pla de Masset (Acusació):** Quan jugadors acusen incorrectament l'Anton
1. Àudio de l'Anton: "El rector! L'han ferit! He estat vetllant-lo tota la nit!"
2. **DESBLOQUEIG:** Aquesta declaració + Full cal·ligrafia
3. Resultat: Els jugadors veuen que Anton té coartada
4. Pensen de nou: Bernat ha de ser el traïdor

### Comparació Amb Altres Proves
- **Contra:** Taula vigies, llibreta torns, ruta patrulla, fragments cementiri
- **Pro:** Declaració rector (veritat) vs. el delator que escriu amb accés al registre
- **Key insight:** Bernat sap escriure + Bernat tenia accés a la tinta + Bernat estava a l'escola quan hi havia llum

---

## Notas Addicionals

### Inspiració Artística
- **Referència:** Declaracions notarials medievals (Arxius de la Corona d'Aragó)
- **Estil:** Fotografia zenital de document autentic (sem dramatizació)
- **Paleta:** Crema, marró, or vell, vermell lacre

### Variants de Text (PENDENT)
- **Variant A (Standard):** Anton de Manlleu, nit del 15 al 16
- **Variant B:** Similar, date alternative
- **Variant C:** Similar, signature variant

**Tots els variants mantenen la mateixa estructura i segell.**

### Nota de Seguretat Gameplay
- **Public:** Aquesta és l'evidència que DESCARTA l'Anton
- **Proves:** Anton no pot ser culpable si aquesta declaració és veritable
- **No revela:** La identitat de Bernat (però força el pensament)

---

**Última revisió:** 17 de setembre de 2026  
**Status:** URGENT — Joc 6 depèn d'aquesta  
**Próxim:** Generar + Validar signature del rector → Upload webapp immediatament
