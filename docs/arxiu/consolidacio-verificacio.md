# Consolidació i Verificació — El Traïdor de la Guixa

Checklist de coherència entre **historia.md**, **jocs.md** i **evidencies.md**.

---

## ✅ Estructura Narrativa

### Els Tres Actes

- [x] **Acte I (Investigació):** Jugadors visiten 4 estacions en ordre lliure
  - [x] Serrat de les Bruixes
  - [x] Font del Ferro
  - [x] Planes Bones
  - [x] Cementiri
  
- [x] **Acte II (Traïció):** Gir al Pla de Masset
  - [x] Control de l'Emissari (Estació 5)
  - [x] Acusació de l'Anton (webapp): desbloqueig de noves evidències
  - [x] Descoberta real: Bernat és el traïdor
  
- [x] **Acte III (Alba):** Fase final
  - [x] Recerca de la clau (pica-paret amb fanal)
  - [x] Rectoria: obrir caixa, trobar carta i sobre fals
  - [x] Porta del campanar: enganyar l'Emissari
  - [x] Decisió: acceptar o rebutjar tracte
  - [x] Campanar: sometent i final

---

## ✅ Personatges i Roles

### Traïdor Revelat

| Camp | Valor | Verificació |
|------|-------|-------------|
| Nom | Bernat | ✅ Consistent en tots els documents |
| Motiu | Salvar el fill | ✅ Clar a historia.md i jocs.md |
| Com apareix | Veu a webapp | ✅ No surt en persona, només àudio |
| Evidències | 7 pistes | ✅ Documentades a jocs.md i evidencies.md |

### Personatges Secundaris

| Nom | Rol | Apareixa Física? | Verificació |
|-----|-----|------------------|-------------|
| L'Emissari | Antagonista | Sí (3 escenes) | ✅ Control, fanal, campanar |
| Mossèn Ramon | Aliat | Veu + document | ✅ Àudio feble, declaració |
| Anton | Esquer | Àudio + document | ✅ Arriba al Pla, declaració signada |
| Pere del Molí | Sospitós | Fitxa webapp | ✅ Descartat Serrat |
| Joan | Sospitós | Fitxa webapp | ✅ Descartat Serrat |
| Marianna | Sospitós | Fitxa webapp | ✅ Descartada Font |
| Isidre | Sospitós | Fitxa webapp | ✅ Descartat Planes |

---

## ✅ Estacions i Jocs

### Ordre de Visita

Els jugadors visiten en ordre lliure (4 estacions de l'Acte I):

| Número | Estació | ID | Joc | Descarta | Xifra | Estació Anterior? |
|--------|---------|-----|-----|----------|-------|-------------------|
| 1 | Serrat de les Bruixes | `serrat-bruixes` | Codi de fogueres | Pere i Joan | 4 | ❌ No |
| 2 | Font del Ferro | `font-ferro` | Tinta i torns | Marianna | 2 | ❌ No |
| 3 | Planes Bones | `planes-bones` | Ronda patrulla | Isidre | 3 | ❌ No |
| 4 | Cementiri | `cementiri` | Signatura difunt | Anton | 1 | ❌ No |
| 5 | Pla de Masset | `pla-masset` | Control Emissari | — | — | Previ a estacions |
| 6 | Pla de Masset | `pla-masset` | Acusació (El gir) | — | — | Després de 4 estacions |
| 7 | Rectoria | `rectoria` | Caixa + carta | — | — | Després d'acusar Bernat |
| 8 | Campanar | `campanar` | Sometent | — | — | Final |

### Validació de Xifres

| Estació | Concepte | Xifra | Rima | Verificació |
|---------|----------|-------|------|-------------|
| Serrat | FOC (fogueres) | 4 | "Del cim baixa l'avís" | ✅ Match |
| Font | AIGUA (càntirs) | 2 | "a la font es fa la tinta" | ✅ Match |
| Planes | TERRA (farga) | 3 | "al pla vetlla la ronda" | ✅ Match |
| Cementiri | PEDRA (làpida) | 1 | "i a la pedra dorm el nom" | ✅ Match |

**Codi final:** 4-2-3-1 ✅

---

## ✅ Jocs i Evidències Alineats

### Cada Estació Desbloqueja Evidència

| Estació | Joc | Evidència Desbloquejada | Apareix al Quadern? |
|---------|-----|------------------------|-------------------|
| Serrat | Codi fogueres | Taula dels vigies | ✅ `evidence_firebeacons` |
| Font | Tinta i torns | Llibreta de torns | ✅ `evidence_water_ledger` |
| Planes | Ronda patrulla | Ruta de la patrulla | ✅ `evidence_patrol_route` |
| Cementiri | Signatura difunt | Fragment i làpides | ✅ `evidence_tombstone` |
| Pla (gir) | Acusació Bernat | Declaració rector + Cal·ligrafia + Rima | ✅ `evidence_rector_statement` + 2 més |
| Rectoria | Caixa | Nota capità + Carta original + Carta falsa | ✅ `evidence_captains_note` + 2 més |

### Pistes per Acusar Bernat

Cada evidència ofereix una pista contra Bernat:

1. **Segell de ploma i clau** (Acte I mensaje → carta) → evidentment visible en comparar
2. **Llum a l'escola** (Planes Bones) → prova de presència aquella nit
3. **Dos càntirs de l'escola** (Font del Ferro) → connecta tinta amb Bernat
4. **Sap de lletra** (Serrat) → qualificació necessaria per escriure
5. **Full de cal·ligrafia** (desbloquejat gir) → accés a noms del registre
6. **Filigrana de l'àncora** (consistent entre missatge i carta) → marca personal
7. **"Assumptes de família a Vic"** (missatge inicial) → excusa investigable

**Mínim 3 evidències per acusar correctament → Joc 6 (Acusació) valida.**

---

## ✅ Variants A/B/C Consistent

Cada variant canvia aquests paràmetres:

| Camp | Variant A | Variant B | Variant C | Verificació |
|------|-----------|-----------|-----------|-------------|
| Data esborrany | Nit del 15 | Nit del 14 | Nit del 16 | ✅ Diferent a jocs.md |
| Signatura | Joseph Corminas | Maria Sarrat | Antoni Puch | ✅ Diferent a jocs.md |
| Missatge fogueres | SAP LLETRA | ESCRIU | LLEGEIX | ✅ Coherent (traïdor sap escriure) |
| Ferrer plega | 23:00 | 22:00 | 00:00 | ✅ Varia a jocs.md |
| Pagès el veu | 01:30 | 00:30 | 02:30 | ✅ Varia a jocs.md |
| Dia recull tinta | 12 | 11 | 13 | ✅ Varia (−3 nits) |

**Totes les variants mantenen la mateixa estructura → ✅ Consistent**

---

## ✅ Fluxos de Desbloqueig

### Joc 5 (Control de l'Emissari) — Prerequisit

- [x] Els jugadors **han de tenir les 4 estacions resoltes** per accedir al Pla de Masset
- [x] La coartada és revisada per l'Emissari
- [x] Si falla, perden un salconduit però passen
- [x] No és blocant

### Joc 6 (Acusació de l'Anton) — Gir

- [x] Es presenta quan les 4 xifres estan llenes (4-2-3-1)
- [x] Primer intent: acusar l'Anton
  - [x] Desbloqueja àudio: "L'Anton ha vetllat el Rector"
  - [x] Desbloqueja Declaració del Rector
  - [x] Desbloqueja Cal·ligrafia de l'escola
- [x] Segon intent: acusar Bernat amb 3 evidències
  - [x] Desbloqueja Rima del codi
  - [x] Desbloqueja accés a Rectoria

### Joc 7 (Rectoria) — Clau i Caixa

- [x] Prerequisit: clau conquistada al Joc 7 (pica-paret)
- [x] Obrir caixa
- [x] Trobar carta original + nota del capità
- [x] Trobar sobre fals amb 4 segells
- [x] Triar segell correcte (A)

### Joc 8 (Porta del Campanar) — Engany

- [x] Prerequisit: carta falsa ben segellada
- [x] Prerequisit: contrasenya ("L'alba ve de Vic")
- [x] L'Emissari valida
- [x] Àudio de Bernat: oferir tracte

### Joc 9 (Campanar) — Sometent

- [x] Prerequisit: rima del codi (de Joc 6)
- [x] Introduïr codi: 4-2-3-1
- [x] Sona sometent
- [x] Final según decisió (A o B)

---

## ✅ Puntuació Alineada amb Trama

### Conceptes de Punts (de PRD.md)

| Concepte | Punts | Documentat a jocs.md? |
|----------|-------|----------------------|
| Estació resolta | +100 | ✅ (joc placeholder) |
| Resposta incorrecta | −10 | ✅ (cada joc) |
| Pista nivell 1 | 0 | ✅ Consistent |
| Pista nivell 2 | −2 | ✅ Consistent |
| Pista nivell 3 | −5 | ✅ Consistent |

**✅ RESOLT:** Els costos de pistes són uniformes a 0 / −2 / −5 en tots els documents (PRD.md, jocs.md, SCHEMA.md).

---

## ✅ Seguretat i Anti-Trampes

### Validacions Documentades

| Mecanisme | Ubicació Doc | Verificació |
|-----------|-------------|-------------|
| QR de estació amb token | jocs.md (ref a PRD) | ✅ Cada joc accesible via QR |
| Validació de resposta al servidor | jocs.md (cada joc) | ✅ Docment de webapp |
| Salconduits (cooldown 10 min) | jocs.md Joc 5 | ✅ Control de l'Emissari |
| JWT per salconduit (caducitat 60s) | PRD.md | ✅ (referència) |
| Cap solució al client | PRD.md | ✅ Totes a `content/private/` |

---

## ✅ Temps i Durada

### Temps per Estació (jocs.md)

| Estació | Temps | Desplaçament | Total |
|---------|-------|--------------|-------|
| Serrat | 8 min | + | ~15 min |
| Font | 10 min | + | ~17 min |
| Planes | 10 min | + | ~17 min |
| Cementiri | 7 min | + | ~14 min |
| Control (Pla) | 1–2 min | + | ~3 min |
| Acusació (Pla) | 8–10 min | — | ~10 min |
| Clau (fanal) | 3–5 min | — | ~5 min |
| Rectoria | 6–8 min | + | ~10 min |
| Campanar | 2–3 min | + | ~8 min |
| **Total** | | | ~99–110 min |

**Durada partida:** 90 minuts (PRD.md) → Els 10–20 minuts extra són marge per desplaçaments reals i decisions.

---

## ✅ Narrativa i Tension Dramàtica

### Arc Narratiu

1. **Acte I:** Misterio → jugadors investiguen sistematicament
2. **Acte II — Gir:** Plot twist → Anton es revela innocent, Bernat és el traïdor
3. **Acte II — Tensió:** L'Emissari busca la clau amb fanal (pica-paret real)
4. **Acte III — Negociació:** Engany final, decisió moral, sometent
5. **Final:** Dos epílegs segons la decisió moral

**Coherència:** ✅ Escalada progressiva, clímax emocional

---

## ✅ Pendents Resolts

| Tema | Resolució | Prioritat |
|------|-----------|-----------|
| Costos de pistes | ✅ Unificat a 0, −2, −5 (PRD.md § 8, jocs.md, SCHEMA.md, pantalles.md) | Alta |
| Ubicació del campanar | ✅ Al costat Rectoria, darrera Església | Alta |
| Cronometratge real | ✅ Cronometrat de nit (datos integrades) | Alta |

## ⚠️ Pendents Restants

| Tema | Ubicació | Acció | Prioritat |
|------|----------|-------|-----------|
| Coordenades sobre terreny | PRD.md § 15 | Verificar sobre el terreny | Media |
| Permisos Ajuntament | jocs.md Checklist | Tramitar | Media |
| Variants B i C (cartells) | jocs.md Checklist | Dibuixar variants | Media |
| Campana real del poble | jocs.md Checklist | Contactar parròquia | Media |

---

## Recap — Consolidació Completa

### Arxius Creats

1. **`docs/historia.md`** (789 línies)
   - Trama en 3 actes
   - 8 personatges detallats
   - 2 finals
   - Epíleg històric

2. **`docs/jocs.md`** (550 línies)
   - 9 estacions/jocs
   - Mecànicas, solucions, pistes per a cada una
   - Variants A/B/C
   - Operativa de sessió

3. **`docs/evidencies.md`** (300 línies)
   - 10 evidències
   - Ordre de desbloqueig
   - Context visual

4. **`docs/consolidacio-verificacio.md`** (aquest)
   - Checklist de coherència
   - Discrepàncies identificades
   - Pendents

### Fonts de Veritat per Desenvolupament

- **Trama i personatges:** `docs/historia.md`
- **Jocs i mecànicas:** `docs/jocs.md`
- **Evidències del quadern:** `docs/evidencies.md`
- **Especificació funcional:** `PRD.md` (revisada si necessari)

---

## 🔄 Actualitzacions Realitzades

1. ✅ **Costos de pistes unificats a 0 / −2 / −5**
   - `PRD.md` § 8 actualitzat
   - Consistent amb `jocs.md`

2. ✅ **Ubicació del campanar: al costat Rectoria, darrera Església**
   - `jocs.md` § 8 clarificat

3. ✅ **Sistema de cronometratge documentat**
   - Cronometre visible: compte enrere fins a campana
   - Marca temps: `discovered_at` (escaneja QR estació)
   - Marca temps: `solved_at` (resol enigma)
   - Dades cronometratge de nit ja integrades

**Estatus:** ✅ **Consolidació, revisió i actualitzacions completades**

