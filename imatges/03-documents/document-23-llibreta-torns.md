# DOCUMENT-23 — Llibreta de Torns de la Font

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | document-23-llibreta-torns |
| **Categoria** | Webapp Document (Pista Visual + Taula Data) |
| **Acte** | I — La Investigació |
| **Estació** | Font del Ferro (Joc 2) |
| **Rol en Gameplay** | Pista Visual + Evidència Conclusió (Dia Recollida Tinta) |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:4 (portrait vertical, llibreta escolar/amo de casa) |
| **Dimensions Mòbil Card** | 375×500 px (visible inicial) |
| **Dimensions Total** | 800×1066 px (si scroll necessari per taula completa) |
| **Format** | JPG |
| **Compressió** | 75% quality |
| **Mida Fitxer** | ~210–260 KB |
| **Comportament** | Card visible + Tap fullscreen modal + Scroll per taula completa |

---

## Descripció Narrativa

**Context Joc:**
Els jugadors han resolt correctament el joc de la tinta a la Font del Ferro (Joc 2). Com a recompensa, aquesta evidència es desbloqueja: la **Llibreta de Torns de la Font**, un registre diari de qui va venir a recollir aigua per a les diverses tasques domèstiques i artesanals.

La llibreta cobreix els dies del 10 al 16 de maig de 1705. Els jugadors han de descobrir que:
1. **La tinta es fa remullant 3 dies** (del 12 al 15 de maig)
2. **L'aigua es recull 3 dies ABANS** (dia 12 de maig)
3. **Marianna de l'Hostal estava al mercat de Vic el dia 12** (per tant, no va poder recollir l'aigua)
4. **Conclusió:** Marianna est descartada com a traïdora

**Contingut de la Llibreta:**
- Format: Llibreta vella de amo de casa o encarregat de la font
- Contingut: Taula de dies (10-16 de maig), amb noms de qui va venir cada dia
- Anotació: "Aviós: dia 12 havia mercat a Vic — Marianna no va venir"
- Tinta: Marró envellit, escriptura caligràfica però clara
- Data: Datada 1705, és un document viu (actualitzat dia per dia)

**Pista Clau:**
Els jugadors aprenen que el dia 12 (quan es va recollir l'aigua per a la tinta), Marianna estava a Vic. Per tant, no pot haver fet la tinta. Marianna es descarta.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval household ledger, 1705 Catalonia. Aged parchment notebook with handwritten daily entries.
Document records daily water collection rotations at Font del Ferro (iron spring water—only source with iron for medieval ink).

LEDGER STRUCTURE (visible manuscript):
Header: "Torns de Recollida d'Aigua · Font del Ferro · 10–16 de maig de 1705"

Daily entries (rows):
- "Dia 10: Pere del Molí, Isidre el Ferrer"
- "Dia 11: Pere, Anton l'Escolà, Bernat"
- "Dia 12: Anton, Isidre, Bernat" [NOTE: Marianna al mercat de Vic—no va venir]
- "Dia 13: Pere, Isidre, Bernat"
- "Dia 14: Marianna de l'Hostal, Joan el traginer"
- "Dia 15: Marianna, Anton"
- "Dia 16: Marianna, Bernat"

Side note (in different, older hand—previous record):
"Tinta de gales: 3 dies remull
Aigua ferro: Font del Ferro (aquesta font)
Data recollida: 12 de maig
Data escriptura carta: 15 de maig"

VISUAL DETAILS:
- Parchment is off-white to tan, aged and worn
- Ink is brown (household ink, not formal medieval)
- Handwriting is daily-life casual but organized (amo de casa, not scribe)
- Margins have annotations, corrections, notes
- Water stains visible (stored near the spring, damp)
- Edges are soft from handling
- No decorative elements—practical household ledger

STYLE: Photograph of aged household record. Zenital lighting. Warm sepia tones, natural aging.
Text must be legible at card size (375×500px).

Dimensions: Portrait (3:4 aspect). Entire ledger (or most of it) must fit in frame or be scrollable.

Negative: modern fonts, printed entries, contemporary paper, plastic cover, bright colors,
people, hands, typed text, digital marks, decorative flourishes, too-formal calligraphy.
```

---

## Paràmetres Midjourney

```
/imagine --ar 3:4 --quality 2 --niji 6 [PROMPT]
```

**Amb Master Style (Acte I Investigation):**
```
/imagine --ar 3:4 --sref [MASTER_STYLE_INVESTIGATION_URL] --quality 2 [PROMPT]
```

---

## Renderització en Webapp

### Card View (Quadern d'Evidències)
```
Visible: 375×500 px (entrades diàries visibles)
Comportament: Static card + tag "Desbloqueïda a Joc 2"
Tap/Click: Obri modal fullscreen
```

### Modal Fullscreen
```
Viewport: 375×812 px (mòbil)
Image: 375×500 px + scroll per a entrades completes
Comportament:
  - Llibreta visible amb scroll vertical (sencera o pagined)
  - Pinch-zoom per veure detalls de noms
  - Highlight visual: dia 12 (Marianna absent)
  - Context tooltip: "Torns de la Font — Día 12: Marianna al mercat de Vic"
```

### CSS/Next.js
```jsx
<div className="card-evidence">
  <img src="/documents/llibreta-torns.jpg" 
       alt="Llibreta de Torns de la Font"
       className="w-full h-auto"
       style={{maxHeight: "600px"}} />
  <div className="highlight-critical">
    <p className="strong">Dia 12 de maig:</p>
    <p className="text">Anton, Isidre, Bernat</p>
    <p className="note">⚠️ Marianna estava al mercat de Vic — no va venir</p>
  </div>
  <p className="conclusion">
    <strong>Descartada:</strong> Marianna de l'Hostal no va poder recollir l'aigua per a la tinta.
  </p>
</div>

// En modal fullscreen:
<div className="modal modal-info">
  <p className="tag-new">Desbloqueïda en Joc 2</p>
  <img src="/documents/llibreta-torns.jpg" style={{width: "100%"}} />
  <div className="table-breakdown">
    <table>
      <tr>
        <th>Dia</th>
        <th>Noms</th>
        <th>Nota</th>
      </tr>
      <tr className="highlight">
        <td>12</td>
        <td>Anton, Isidre, Bernat</td>
        <td>Marianna al mercat de Vic</td>
      </tr>
    </table>
  </div>
  <p className="conclusion">
    <strong>Conclusió:</strong> Marianna no va recollir l'aigua per a la tinta. 
    No pot ser el traïdor.
  </p>
</div>
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 3:4
- [ ] Llibreta visible 375×500 px (sencera o scrollable)
- [ ] Generat mínimo 1500px width

**Visual i Autenticitat:**
- [ ] Parchment envellit (tan, no blanc)
- [ ] Tinta marró household (no negra formal)
- [ ] Escriptura casuística, organized (no calligraphic)
- [ ] Taques de humitat (stored near spring)
- [ ] Creases de handling visible
- [ ] Anotacions marginals (notes casuals)

**Taula i Text:**
- [ ] 7 dies visibles (10-16 de maig)
- [ ] Noms llegibles per dia
- [ ] Anotació "Dia 12: Marianna al mercat" clarament visible
- [ ] Nota de tinta visible (context information)
- [ ] Contrast text vs. parchment: WCAG AA

**Gameplay Context:**
- [ ] Marcat com a desbloqueïda (tag, highlight)
- [ ] Dia 12 subratllat o destacat visualment
- [ ] Conclusió clara: "Marianna descartada"

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
**Joc 2 — Font del Ferro:** Jugadors resolen correctament l'enigma de la tinta
1. **Desbloqueig:** Aquesta llibreta de torns
2. **Descoberta:** Dia 12, Marianna estava al mercat de Vic
3. **Conclusió:** No va poder recollir l'aigua per a la tinta
4. **Descart:** Marianna de l'Hostal és inocent

### Proves que Usen Aquesta Evidència
- **Prova 3 (Joc 6):** "Dos càntirs escola dia 12" — els jugadors utilitzen esta evidència per acusar Bernat
  - El dia 12, quan es va recollir l'aigua, només va venir Anton, Isidre, i Bernat
  - Els jugadors han de deduir que Bernat va portar dos càntirs (per a més tinta)

### Connexió amb Altres Proves
- **Serrat (Joc 1):** Traïdor sap escriure
- **Planes Bones (Joc 3):** Llum a l'escola nit 15 (mentre escriu, tinta fresca)
- **Cementiri (Joc 4):** Fragment carta copiada de làpida (necessita accés)

---

## Notas Addicionals

### Inspiració Artística
- **Referència:** Llibretes de casa de labrador (Arxius Comarcals d'Osona, registres locals)
- **Estil:** Fotografia de document household vell. Taula clara, text legible.
- **Paleta:** Tan parchment, marró ink, notes en margin

### Context Històric
La Font del Ferro era una font local que portava aigua amb ferro natural — imprescindible per fer tinta de gales medieval. Els vecins tenien un sistema de torns per a recollir l'aigua per a diverses usos. El registre era mantingut pel regidor o amo de la casa que controlava els torns públics.

### Context Química (Notes)
**Tinta medieval de gales:**
- Gales (tanins de roure) + Aigua de ferro (vitriol) + Goma arabiga
- Temps de preparació: 3 dies de remull per a la reacció química
- Resultat: Tinta negra-violàcia, duradora, us estàndard medieval

**Cronologia (Variant A):**
- Data recollida: 12 de maig
- Remull: 12, 13, 14 de maig (3 dies)
- Tinta presta: 15 de maig (nit)
- Carta escrita: 15 de maig (nit) amb tinta fresca

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Crítica per gameplay (Joc 2, desbloqueig)  
**Próxim:** Generar + Validar taula llegibilitat + Destacar dia 12 → Upload webapp
