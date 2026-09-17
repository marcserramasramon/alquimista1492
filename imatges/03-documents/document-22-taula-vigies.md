# DOCUMENT-22 — Taula dels Vigies i Fogueres

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | document-22-taula-vigies |
| **Categoria** | Webapp Document (Pista Visual + Taula Data) |
| **Acte** | I — La Investigació |
| **Estació** | Serrat de les Bruixes (Joc 1) |
| **Rol en Gameplay** | Pista Visual + Evidència Conclusió (Sap Escriure) |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:4 (portrait vertical, pergamí vell amb taula) |
| **Dimensions Mòbil Card** | 375×500 px (visible inicial) |
| **Dimensions Total** | 800×1066 px (si scroll necessari per taula) |
| **Format** | JPG |
| **Compressió** | 75% quality |
| **Mida Fitxer** | ~200–240 KB |
| **Comportament** | Card visible + Tap fullscreen modal + Scroll/pinch-zoom per taula |

---

## Descripció Narrativa

**Context Joc:**
Els jugadors han resolt correctament el codi de fogueres al Serrat de les Bruixes (Joc 1). Com a recompensa, aquesta evidència es desbloqueja: la **Taula dels Vigies**, un document oficial que documenta els avisos de fogueres entre els turons de vigilància de la plana de Vic.

La taula mostra les seqüències de senyals de fogueres la nit del 15 de maig de 1705 — la nit que es va escriure la carta traïdora. Un informador dins de Vic ha confirmat que la carta va ser escrita de mà pròpia (no imprès).

**Conclusió Crítica:**
**El traïdor sap escriure.** Aquesta informació descarta els personatges que només saben signar amb una creu (Pere del Molí, Joan el traginer).

**Contingut de la Taula:**
- Format: Pergamí oficial de vigilancia, amb header parroquial
- Contingut: Taula de data/hora/senyal de fogueres entre turons
- Anotació: Text oficial que resume "Un informador dins Vic ha confirmat que la carta és manuscrita de mà pròpia"
- Conclusió: "El delator sap escriure de mà"
- Data: 15-16 de maig de 1705
- Signatura: Senyal de vigia (no signature personal)

**Pista Clau:**
Els jugadors aprenen que el traïdor sap escriure — no pot signar amb una creu. Isso elimina els sospitosos que sabem que signen amb creu (Pere del Molí, Joan).

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval parish vigilance table, 1705 Catalonia. Aged parchment with official header.
Document records signal fires between hilltop watchers during the night of May 15-16, 1705.

TABLE STRUCTURE (visible in manuscript):
Header: "Senyals dels Vigies · Nit del 15 al 16 de maig de 1705"
Columns: "Hora" (Time), "Turó" (Hill), "Senyal" (Signal), "Significat" (Meaning)

Example rows:
- "22:00 · Serrat de les Bruixes · Foc gran · Alertas vigilancia"
- "22:30 · Turó de Vic · 3 fogueres · Carta detectada a escriu"
- "23:15 · Serrat de les Bruixes · Foc petit · Confirmat a mà pròpia"

Below table, a formal note in Old Catalan (partially legible):
"Un informador dins de Vic ha confirmat que la carta del delator és escrita de mà pròpia, no impresa.
CONCLUSIÓ: El delator sap escriure."

Signature area: Simple mark (vigia seal—no personal name).

VISUAL DETAILS:
- Parchment is cream-tan, worn at edges, aged stains visible
- Ink is brown-black (official writing, not casual)
- Table is ruled with ruler lines (medieval official format)
- Header has small decorative initial (medieval parish style)
- Water marks visible (stored in damp archive)
- Creases from being rolled or stored in wooden chest

STYLE: Photograph of aged official document. Zenital lighting. Sepia tones, natural aging.
Table text must be readable at card size (375×500px) or slightly zoomable.

Dimensions: Portrait (3:4 aspect). Entire table must fit in frame or be scrollable in modal.

Negative: modern fonts, printed text, contemporary paper, bright colors, plastic seals,
people, hands, 20th century materials, typed text, digital marks.
```

---

## Paràmetres Midjourney

```
/imagine --ar 3:4 --quality 2 --niji 6 [PROMPT]
```

**Amb Master Style (Acte I Vigilancia):**
```
/imagine --ar 3:4 --sref [MASTER_STYLE_INVESTIGATION_URL] --quality 2 [PROMPT]
```

---

## Renderització en Webapp

### Card View (Quadern d'Evidències)
```
Visible: 375×500 px (taula visible sencera o amb preview)
Comportament: Static card + tag "Desbloqueïda a Joc 1"
Tap/Click: Obri modal fullscreen
```

### Modal Fullscreen
```
Viewport: 375×812 px (mòbil)
Image: 375×500 px + scroll if needed for full table
Comportament:
  - Taula visible sencera (scroll vertical si necessari)
  - Pinch-zoom per veure detalls de text
  - Context tooltip: "Taula dels Vigies — Avisos de fogueres, nit del 15-16 de maig"
```

### CSS/Next.js
```jsx
<div className="card-evidence">
  <img src="/documents/taula-vigies.jpg" 
       alt="Taula dels Vigies"
       className="w-full h-auto"
       style={{maxHeight: "600px"}} />
  <p className="conclusion">
    <strong>Conclusió:</strong> El traïdor sap escriure de mà. 
    No pot signar amb una creu.
  </p>
  <p className="suspects-eliminated">
    Descartats: Pere del Molí (signa amb creu), Joan (signa amb creu)
  </p>
</div>

// En modal fullscreen:
<div className="modal modal-info">
  <p className="tag-new">Desbloqueïda en Joc 1</p>
  <img src="/documents/taula-vigies.jpg" style={{width: "100%"}} />
  <div className="table-conclusion">
    <h3>Conclusió de Vigilància</h3>
    <p>Un informador dins de Vic ha confirmat que la carta és escrita de mà pròpia.</p>
    <strong>El delator sap escriure.</strong>
  </div>
</div>
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 3:4
- [ ] Taula visible 375×500 px (sencera o scrollable)
- [ ] Generat mínimo 1500px width

**Visual i Autenticitat:**
- [ ] Pergamí envellit (crema-marró)
- [ ] Tinta marró-negra medieval
- [ ] Línies de taula (regles, no impressió moderna)
- [ ] Taques d'envelliment naturals
- [ ] Creases de storage visible
- [ ] Header parroquial decorat (inicial medieval)

**Taula i Text:**
- [ ] Taula es veu completa o scrollable
- [ ] Text rows: Hora, Turó, Senyal, Significat
- [ ] Nota de conclusió llegible
- [ ] Contrast text vs. pergamí: WCAG AA
- [ ] Signature/marca vigia visible

**Gameplay Context:**
- [ ] Marcat com a desbloqueïda (tag, highlight)
- [ ] Conclusió clara: "Delator sap escriure"
- [ ] Sospitosos descartats: Pere, Joan

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
**Joc 1 — Serrat de les Bruixes:** Jugadors resolen correctament el codi de fogueres
1. **Desbloqueig:** Aquesta taula dels vigies
2. **Lectura:** "La carta és escrita de mà pròpia"
3. **Conclusió:** El traïdor sap escriure
4. **Descart:** Pere del Molí (signa amb creu), Joan (signa amb creu)

### Proves que Usen Aquesta Evidència
- **Prova 4 (Joc 6):** "Sap de lletra" — els jugadors utilitzen esta evidència per acusar Bernat

### Connexió amb Altres Proves
- **Cementiri (Joc 4):** Fragment de carta copiada de làpida (requereix saber escriure)
- **Font (Joc 2):** Tinta de gales, escriptura elegant medieval
- **Planes Bones (Joc 3):** Llum a l'escola a un quart d'onze (mentre escriu carta)

---

## Notas Addicionals

### Inspiració Artística
- **Referència:** Registres officials de vigies (Arxius de la Corona d'Aragó, vigilancia costanera)
- **Estil:** Fotografia de document oficial medieval. Taula clara, text legible.
- **Paleta:** Crema pergamí, tinta marró, or decoratiu

### Context Històric
Els vigies de la plana de Vic eren sentinelles que guardiaven contra invasions. Durant les guerres de successió, els vigies monitoritzaven avisos de moviments de tropes. El sistema de fogueres era un codi ràpid per comunicar alertas a través de distàncies.

### Nota de Seguretat
- **Public:** Els jugadors veuen les senyals de fogueres i la conclusió
- **Private:** La conclusió es registra al servidor per tractar futurs sospitosos
- **No revela:** Quins sospitosos saben escriure (els jugadors ho dedueixen)

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Crítica per gameplay (Joc 1, desbloqueig)  
**Próxim:** Generar + Validar taula llegibilitat → Upload webapp
