# MASTER STYLES — Índex de Coherència Visual
## El Traïdor de la Guixa — 3 Actes, 3 Estils, 1 Paleta

**Data:** 17 de setembre de 2026  
**Responsable:** Master Visual Coherence System  
**Estat:** ✓ Tres Master Styles completes, llestes per generació

---

## I. VISIÓ GENERAL

Els 3 Master Styles estableixen l'ADN visual del joc, separats per **Acte** i **Cicle de Llum:**

| Acte | Master Style | Llum | Temps | Archivo | Ús |
|------|--------------|------|-------|---------|-----|
| **I: Investigació** | MASTER_STYLE_ACT1_DIURNA | ☀️ Diurna | Matinal/Tardana | `master-diurna.md` | Cartells, escenes dia, documents, ítems diurns |
| **II: Traïció** | MASTER_STYLE_ACT2_NOCTURNA | 🌙 Nocturna | Nit medieval | `master-nocturna.md` | Escenes nit (Pla Masset), rectoria nit, documents nocturn |
| **III: Alba** | MASTER_STYLE_ACT3_ALBA | 🌅 Alba | Clarobscur alba (30–60 min pre-surt sol) | `master-alba.md` | Rectoria alba, cementiri alba, epíleg, decisió moral |

---

## II. PALETA CROMÀTICA UNIFICADA

### 7 Colors Base (Idèntics en 3 Master Styles, Mapa Tonal Diferent)

```
┌─────────────────────────────────────────────────────────────┐
│ COLOR           │ HEX       │ DIURNA  │ NOCTURNA │ ALBA     │
├─────────────────────────────────────────────────────────────┤
│ Beige Pergamí   │ #F5E6D3   │ 55%●●●●● │ 5%●      │ 40%●●●●● │
│ Or Vell Medieval│ #D4AF37   │ 5%●     │ 15%●●    │ 10%●     │
│ Negre Carbó     │ #1a1a1a   │ 5%●     │ 60%●●●●● │ 30%●●●   │
│ Marró Medieval  │ #4A3728   │ 30%●●●  │ 25%●●    │ 15%●●    │
│ Gris Medieval   │ #5C5C5C   │ 10%●    │ 25%●●    │ 25%●●    │
│ Ocre Clar       │ #7A6F63   │ 20%●●   │ 5%●      │ 20%●●    │
│ Siena Vermell   │ #A0522D   │ 5%●     │ 0%       │ 0%       │
└─────────────────────────────────────────────────────────────┘

% = Ús relatiu en aquest Acte
●●●●● = Dominants
●● = Accents
● = Mínims / Gairebé absent
```

### Transicions Coherents

```
ACT I (DIURNA):
  Dominants: Beige (#F5E6D3) + Marró (#4A3728) + Ocre (#7A6F63)
  Accents: Gris (#5C5C5C) + Verd (#6B8E23)
  Mapa Tonal: Llum ↔ Ombra moderada (contrast natural dia)

ACT II (NOCTURNA):
  Dominants: Negre (#1a1a1a) + Gris (#5C5C5C) + Marró (#4A3728)
  Accents: Or Vell (#D4AF37) — SEMPRE present (símbol foc/traïció)
  Mapa Tonal: Fosc profund ↔ Or brillant (clarobscur dramàtic)

ACT III (ALBA):
  Transició: Negre → Gris → Beige (gradació temporal)
  Dominants: Gris (#5C5C5C) + Beige (#F5E6D3) + Negre (#1a1a1a) retreating
  Accents: Or pal·lid (#D4AF37) + Marró (#4A3728) clarifying
  Mapa Tonal: Nit residual (foreground fosc) → Alba incipient (background clar)

TRANSICIONS VISUALS:
  Dia → Nit:   Beige/Ocre dessapareixen → Negre+Or dominants (darkening)
  Nit → Alba:  Negre retrocedeix → Gris-Or mix → Beige creixent (lightening)
```

### Principi de Coherència

- **Desaturació Medieval:** 15–20% vs. realitat, consistent en totes 3
- **Sense Neon, sense Digital Gray:** Colors deriven de fonts naturals medievals (foc, lluma, sol)
- **Compatibilitat Webapp:** Paleta idèntica a PRD secció 16
- **Escalabilitat:** Pissa futura (cartell, document, ítem) heretarà paleta del seu Acte

---

## III. MATERIALS MEDIEVALS (CONSTANTS)

Els mateixos materials medievals apareixen en els 3 Actes, variació lumínica:

### 1. Pedra Medieval
- **Diurna:** `#8B7D6B` (gris terrós, llum matinal)
- **Nocturna:** `#5C5C5C` (gris ferro semiombra) → `#1a1a1a` (negre profund ombra)
- **Alba:** `#8B7D6B` (transició) → `#F5E6D3` (beige alba)

### 2. Fusta de Roure
- **Diurna:** `#4A3728` (marró fosc, natural)
- **Nocturna:** `#4A3728` (silhueta negra quasi absoluta)
- **Alba:** `#4A3728` (emerging) → `#8B4513` (més clar amb alba)

### 3. Terra / Sòl
- **Diurna:** `#7A6F63` (ocre clar, sec)
- **Nocturna:** `#6B8E23` quasi `#1a1a1a` (negre ombra)
- **Alba:** `#7A6F63` (damp rosada alba)

### 4. Ferro Forjat (opcional)
- **Diurna:** `#5C5C5C` (patina visible)
- **Nocturna:** `#5C5C5C` (gris-negre ombra)
- **Alba:** `#5C5C5C` (emergent clarifying)

**Nota:** Mateixa **arquitectura medieval** (XVI–XVII, Osona) visible en 3 Actes, **distint tractament lumínic**. Assegura coherència sense repetició.

---

## IV. DISSENY DE LLUM PER ACTE

### Acte I — Diurna (Master-Diurna.md)

- **Font:** Sol matinal o tardà (30–45° elevació)
- **Qualitat:** Difusa a moderada, rajos laterals
- **Contrast:** Moderat (definit però no dramàtic)
- **Temperatura:** 4500–5500K (natural matinal/tardà)
- **Atmosfera:** Pols flotant, aire clar, sense boira densa
- **Sensació:** Tranquil·la, investigativa, seguretat relativa
- **Profunditat de Camp:** f/4–f/5.6, primer pla nítid

### Acte II — Nocturna (Master-Nocturna.md)

- **Font:** Lluna parcial (50%) + foguera residual distanta
- **Qualitat:** Clarobscur clamorós (talla clara entre llum i ombra)
- **Contrast:** EXTREM (carbó negre #1a1a1a vs. or brillant #D4AF37)
- **Temperatura:** Mix 6000K (lluma freda) + 1500–2000K (foc càlid)
- **Atmosfera:** Boira nocturna, vapor visible en clarors, partícules
- **Sensació:** Misteriosa, tensa, perillos, revelació imminent
- **Profunditat de Camp:** f/2.0–f/2.8, aper ampla, sombres nítides

### Acte III — Alba (Master-Alba.md)

- **Font:** Alba incipient (no surt sol complet, 30–60 min pre-surt)
- **Qualitat:** Transició constant, ombres retrocedint
- **Contrast:** Variable, creixent amb alba
- **Temperatura:** Mix 5500K (alba freda) + 1500K (nit residual) = 3500–4500K resultant
- **Atmosfera:** Vapor matinal (rosada), boira alba que es dissipa
- **Sensació:** Urgència, decisió irreversible, temps passant visible
- **Profunditat de Camp:** f/4–f/5.6, primer pla oscur definit, fondo suau (alba mist)

---

## V. ESTIL VISUAL CONSISTENT

### Gravat / Aquarel·la Medieval (Totes 3)

- **Referència Artística:**
  - Albrecht Dürer: gravats XVI «Melancholia» (clarobscur), landscapes
  - Lucas Cranach: scenes XVI, arquitectura medieval, llum natural
  - Pieter Bruegel: escenes rurals, vida medieval
  - Rembrandt: clarobscur dutch (nocturn), atmosfera

- **Acabat Fotogràfic:** Raw, sense filters moderns
- **Gra de Pel·lícula:** 35mm cinema envellit
  - Diurna: 100 ISO (fí)
  - Nocturna: 400 ISO (perceptible grain, night authenticity)
  - Alba: 100–200 ISO (intermig, transició)

- **Línies i Textura:** Visible pinzellades aquarel·la o xancletes d'etching
- **Estil:** Hand-drawn quality medieval, mai synthetic CGI o modern photo

### Exclusions ABSOLUTES (Totes 3)

```
NEVER:
  ❌ Persones, cares, mans, silhuetes humanoïdes
  ❌ Animals con expressió (birds, pets, livestock expressiva)
  ❌ Text llegible, números, rètols moderns o medievals amb contingut
  ❌ Pistes editables (claus, cadenes, cartes, documents resolubels)
  ❌ Tecnologia post-1800 (electric lights, vidre clar modern, pipes, cannons)
  ❌ Cartoon, comic, illustration estil
  ❌ Neon, cyberpunk, filters moderns, oversaturació
  ❌ 3D CGI sintètic evident, airbrushed modern rendering
  ❌ Dark-fantasy gòtic excessiu (medieval historic, no demoniacs)
```

---

## VI. PARÀMETRES ÒPTICS UNIFICATS

### Lent Equivalent (Totes 3)

- **Focal Length:** 35mm–50mm (perspectiva humana natural)
- **Justificació:** Ni distorsió gran-angular; ni compressió tele; permet scaling visual sense deformació

### Enquadrament (Totes 3)

- **Tipus:** Pla General (wide, ample context)
- **Angle:** Eye-level o lleugerament baix (mai picat de sobre)
- **Perspectiva:** Central (vanishing point a arquitectura o alba) o natural

### Profunditat de Camp

- **Diurna:** f/4–f/5.6 (moderada)
- **Nocturna:** f/2.0–f/2.8 (shallow, drama ombra)
- **Alba:** f/4–f/5.6 (moderada, transició suava)

---

## VII. CHECKLIST DE COHERÈNCIA CREUADA

Realitzar **UNA VEGADA** que totes 3 imatges estiguin generades:

### Paleta Colors

- [ ] Els 7 colors base apareixen en les 3 escenes? (Mapa tonal diferent, colors constants)
- [ ] Dessaturació medieval visible i consistent? (15–20% vs. realitat)
- [ ] Transicions coherents? (Dia → Nit shift or / Nit → Alba shift beige)
- [ ] Sense neon, sense digital gray, sense colors aliens?

### Materials Medievals

- [ ] Pedra medieval visible en les 3? (Textura, weathering, lichen discret)
- [ ] Fusta envellida visible en les 3? (Grain, patina, no varnish)
- [ ] Terra/sòl medieval visible en les 3? (Compacted, herba, no artificial surface)
- [ ] Ferro (si present) patinà en les 3?
- [ ] Arquitectura XVI–XVII consistent? (Same buildings, different light)

### Llum i Contrast

- [ ] Transició lumínica coherent? (Dia bright → Nit dark → Alba transitional)
- [ ] Temperatura shift coherent? (Dia 5500K → Nit mix 3500K → Alba mix 4000K)
- [ ] Contrast WCAG accessible en les 3? (Moderat/alt/variable, sempre legible)
- [ ] Ombres coherents? (Diurna: soft / Nocturna: sharp / Alba: retreating)

### Estil Visual

- [ ] Gravat/aquarel·la medieval consistent? (Zero salts a 3D, zero modern photo)
- [ ] Gra analògic visible i coherent? (Diurna fí → Nocturna grit → Alba intermig)
- [ ] Pinzellades/xancletes hand-drawn evident?
- [ ] Zero synthetic CGI en cap?

### Neutralitat Narrativa

- [ ] Les 3 són espais buits sense protagonistes? ✓
- [ ] Cap pista visible en les 3? ✓
- [ ] Context arquitectònic (sense distreure) en les 3? ✓

### Exclusions Validació Final

- [ ] ZERO persones, animals, text en cap? ✓
- [ ] ZERO pistes editables en cap? ✓
- [ ] ZERO tecnologia post-1800 en cap? ✓
- [ ] ZERO cartoon, neon, modern style en cap? ✓

---

## VIII. WORKFLOW DE PRODUCCIÓ

### Fase 1: Generació (1–3 hores)

```
Per cada Master Style (ordre recomanat):

1. Master-Diurna.md
   - Copiar Prompt General (secció VIII.1)
   - Afegir paràmetres Midjourney
   - Generar amb `--ar 16:9 --niji 6 --stylize 200 --quality 2`
   - Validar checklist (secció IX)
   - Si falla, iterar amb adjustments
   - Guardar URL --sref

2. Master-Nocturna.md
   - Copiar Prompt General
   - Afegir paràmetres Midjourney (--stylize 250)
   - Generar
   - Validar checklist
   - Iterar si necessari
   - Guardar URL --sref

3. Master-Alba.md
   - Copiar Prompt General
   - Afegir paràmetres Midjourney (--stylize 220)
   - Generar
   - Validar checklist
   - Iterar si necessari
   - Guardar URL --sref
```

### Fase 2: Validació Creuada (30 min)

```
1. Obrir 3 imatges generades en fixa
2. Comparar lateralment:
   - Paleta colors: coherents?
   - Materials: reconeixibles en les 3?
   - Estil: consistent?
   - Exclusions: respectades?
3. Completar checklist secció VII
4. Si TOTS passed → Fase 3
5. Si alguna falla → Iterar i regenerar
```

### Fase 3: Documentació i Cacheig (20 min)

```
1. Crear MASTER_STYLE_CACHE.md amb:
   - URL diurna --sref
   - URL nocturna --sref
   - URL alba --sref
   - Metadata (data, versió, notes)
   
2. Documentar a LLISTA_IMATGES_COMPLETA:
   - Per cada entrada imatge futura:
     - Acte (I/II/III)
     - Usar --sref [master-apropiat]
     - Mantenir paleta + materials

3. Guardar URLs a notion/wiki del projecte
   (Accessible per tota l'equip creativa)
```

### Fase 4: Ús Continu (ongoing)

```
Totes les imatges derives (cartells, items, documents, scenes):
  - Usar --sref [URL-master-apropiat-per-Acte]
  - Hereten paleta + estil automàticament
  - Crea coherència visual sense repetició mecànica
  - Maintenir neutralitat narrativa + exclusions
```

---

## IX. TEMPLATES PROMPT RÀPID

### Si iterant diurna:

```
[Copy full prompt from master-diurna.md secció VIII.1]
[Modificar NOMÉS:]
  - Ajustos lumínics específics (si primer intent massa fosc/clar)
  - Detalls arquitectònics (si insuficient medieval feel)
  - Materials específics (si lacking texture)
[MANTENIR paleta hex, exclusions, estil]
```

### Si iterant nocturna:

```
[Copy full prompt from master-nocturna.md secció VIII.1]
[Modificar NOMÉS:]
  - Contrast (si no extrem suficient)
  - Or vell intensitat (si residual foc no sufficient)
  - Atmosfera clarobscur (si salts abruptis llum-ombra)
[MANTENIR paleta hex, exclusions, estil]
```

### Si iterant alba:

```
[Copy full prompt from master-alba.md secció VIII.1]
[Modificar NOMÉS:]
  - Velocitat transició (si massa ràpid/lent)
  - Beige alba intensitat (si background no suficientment clar)
  - Vapor alba percepcio (si insuficient atmosfera)
[MANTENIR paleta hex, exclusions, gradació]
```

---

## X. COMPARATIVA RÀPID (3 ACTES)

```
╔════════════════════════════════════════════════════════════════════╗
║               DIURNA (I)     │     NOCTURNA (II)    │    ALBA (III) ║
╟────────────────────────────────────────────────────────────────────╢
║ ESCENARI    Plaça medieval  │ Serrat silhuetats   │ Rectoria alba  ║
║ LLUM        ☀️ Matinal/Tard │ 🌙 Lluna+Foc dist   │ 🌅 Alba 30-60m ║
║ CONTRAST    Moderat         │ EXTREM              │ Variable/Ceix   ║
║ TEMPERATURA 5500K natural   │ 6000K+1500K mix     │ 5500K+1500K mix ║
║ PALETA      Beige/Marró/O   │ Negre/Or dominant   │ Gradació Neg→Bei║
║ ATMOSFERA   Pols clara      │ Vapor ombra         │ Rosada alba     ║
║ SENSACIÓ    Segur/Invest.   │ Misteriós/Tensa     │ Urgència/Moral  ║
║ DIAFRAGMA   f/4–5.6         │ f/2.0–2.8 shallow   │ f/4–5.6 modera  ║
║ GRANA 35mm  100 ISO (fí)    │ 400 ISO (perceptib) │ 100–200 ISO int ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## XI. RECURSOS I INSPIRACIÓ

### Gravats Nocturn Medievals

- **Dürer «Melancholia» (1514):** Clarobscur perfecció, contrast negre/blanc, simbolisme
- **Dürer Landscapes (XVI):** Fusta, arquitectura, perspectiva
- **Cranach Landscapes:** Scenes XVI Alemania (aplicable Osona)

### Aquarel·les Alba/Transició

- **Rembrandt Chiaroscuro:** Clarobscur holandès, atmosfera
- **Turner Watercolors:** Transicions lumínica, atmosfera gradient
- **Sargent Medieval Studies:** Arquitectura XVI–XVII

### Paletes Inline

- [Coolors.co](https://coolors.co) — Medieval palette templates
- [Adobe Color](https://color.adobe.com) — Medieval pigment exploration
- [Pinterest](https://pinterest.com) — Búsqueda "medieval night light" + "gravat XVI alba"

---

## XII. PREGUNTES FREQUENTS

### P: Per què 3 Master Styles i no 1?

**R:** Cada Acte té tonalitat i contrast radicalment diferent. Un single Master Style no capturaria la **transició lumínica dramàtica** dia→nit→alba que és central a la narrativa. Separar per Acte permet que cada etapa visual comunique l'emoció (seguretat investigativa → tensió traïció → urgència alba).

### P: Quina és la paleta vraiment "dominant" (per prioritzar en ambigüitats)?

**R:** 
- **Diurna:** Beige pergamí + Marró medieval (60% paleta)
- **Nocturna:** Negre carbó + Or vell medieval (75% paleta) — Or és omnipresent
- **Alba:** Gris medieval + Beige pergamí (creixent) (50% paleta)

### P: Si una imatge deriva es sent "fora de lloc", com diagnostico?

**R:** Validar:
1. **Paleta:** ±10% hex vs. llista? (Si no, reiterar)
2. **Llum:** Consistent amb Acte? (Si no, ajustar temperatura)
3. **Materials:** Pedra/fusta/ferro medieval visible? (Si no, textura lacking)
4. **Estil:** Gravat/aquarel·la vs. CGI/modern? (Si CGI, regenerar)
5. **Exclusions:** Zero persones/text/pistes? (Si present, falla critical)

### P: Es pot usar master-diurna.md com a --sref per a nocturna?

**R:** NO recomanat. Causarà "day-colored shadows" o falta de or dominants. Millor usar:
- **Nocturna amb --sref master-nocturna** (quan generada)
- **Alba sense --sref inicial** (pot usar blend diurna+nocturna, pero menys crític)

### P: Quants iteracions expects per Master Style?

**R:** Típicament:
- **Millor cas:** 1–2 (prompt clear, motor entén clarobscur)
- **Cas typical:** 2–4 (ajustos contrast, paleta, atmosfera)
- **Worst case:** 5–8 (motor interpreta artistic direction diferent)

Tip: Usar mateixa seed si iterant (Midjourney `--seed [número]` per replicabilitat).

---

## XIII. MAPA DE NAVEGACIÓ RÀPID

```
ENTRANT A AQUESTA CARPETA (master-styles/):

├─ INDEX.md ← Estàs aquí (visió general, coherència)
│
├─ master-diurna.md
│  ├─ II. Objectiu (PRD colors)
│  ├─ III. Escenari (plaça medieval dia)
│  ├─ VIII. Prompts IA (copiar-pegar per Midjourney)
│  └─ IX. Checklist (validació pre-generació)
│
├─ master-nocturna.md
│  ├─ II. Objectiu (clarobscur dramàtic)
│  ├─ III. Escenari (serrat nit, lluna+foc)
│  ├─ VIII. Prompts IA
│  └─ IX. Checklist
│
├─ master-alba.md
│  ├─ II. Objectiu (transició nit→dia)
│  ├─ III. Escenari (rectoria alba, vapor)
│  ├─ VIII. Prompts IA
│  └─ IX. Checklist
│
└─ [Futur] MASTER_STYLE_CACHE.md
   └─ URLs --sref, metadata, replicabilitat
```

---

## XIV. NEXT STEPS

### Immediately (Avui):

- [ ] Revisar els 3 Master Styles (INDEX + 3 arxius markdown)
- [ ] Confirmar paleta / exclusions / escenaris OK?
- [ ] Preguntes o canvis? → Revisar section II–IV

### Next Session (1–2 dies):

- [ ] Generar master-diurna.md amb Midjourney
- [ ] Validar checklist (secció IX)
- [ ] Guardar URL --sref

### Following Session:

- [ ] Generar master-nocturna.md
- [ ] Validar checklist
- [ ] Guardar URL --sref

### Session After:

- [ ] Generar master-alba.md
- [ ] Validar checklist
- [ ] Guardar URL --sref

### Final Validation:

- [ ] Obrir 3 imatges lateralment
- [ ] Completar checklist coherència creuada (secció VII)
- [ ] Crear MASTER_STYLE_CACHE.md
- [ ] Documentar a LLISTA_IMATGES_COMPLETA

---

## XV. VALIDACIÓ FINAL D'INDEX

✓ **Els 3 Master Styles estan documentats completament?**  
✓ **Paleta cromàtica unificada està definida?**  
✓ **Materials medievals constants són clars?**  
✓ **Paràmetres òptics unificats documentats?**  
✓ **Exclusions absolutes (NEVER) clarament listades?**  
✓ **Workflow de producció passa a passa?**  
✓ **Checklists de validació completes per Acte?**  
✓ **FAQ cobreix casos d'ús comuns?**  

**Si TOTS passed: Llesta per generació.**

---

**Creador:** Master Visual Coherence System  
**Data:** 17 de setembre de 2026  
**Versió:** 1.0 (Final, 3 Master Styles Completes)  
**Següent:** Generar imatges i cachejar URLs
