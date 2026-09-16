# Joc 6: Pla de Masset — L'Acusació (El Gir) — Document de Desenvolupament

**Estació:** Pla de Masset  
**Versió:** 2.0 (Acusació + Gir narratiu)  
**Estat:** Llest per codificar  
**Durada:** 8–10 min  
**Dificultat:** 3/5  
**Tipus:** Deducció lògica + Gir narratiu

---

## 📋 Visió General

El jugador ha d'**acusar el traïdor** presentant 3 proves vàlides del seu Quadern.

**Mecànica especial:**
- **Primer intent:** Si acusen **Anton** → **GIR NARRATIU** (àudio Anton = innocent)
- **Segon intent:** Si acusen **Bernat** + 3 proves vàlides → **CORRECTE ✓**

**Narrativa del Gir:**
```
Jugadors acusen Anton
    ↓
[ÀUDIO ANTON] "El rector! L'han ferit! 
He estat vetllant-lo tota la nit del 15."
    ↓
SE DESBLOQUEJA: Declaració Rector + Cal·ligrafia
    ↓
Jugadors entenen que Anton és innocent
    ↓
Proven de nou amb Bernat (traïdor real)
```

---

## 🎮 Mecànica del Joc

### Flux General

```
Pantalla 0 (Menú) →
Pantalla 1 (Intro + Context) →
Pantalla 4a (Selector Sospitosos) →
Pantalla 4b (Marcar 3 Proves) →
Pantalla 7A/7B (Resultat)
  └─ Si Anton → GIR (àudio Anton)
  └─ Si Bernat (3 proves) → Correcte ✓
```

### Estructura: Selector + Proves

1. **Pantalla 4a:** Jugador selecciona 1 de 2 sospitosos (Anton o Bernat)
2. **Pantalla 4b:** Marcar 3 proves vàlides del Quadern
3. **Validació:**
   - Backend valida que les 3 proves corresponen al sospitós
   - Si correcte: Pantalla 7A
   - Si incorrecte: Pantalla 7B
4. **Gir (Només si Anton):** Àudio Anton es desbloqueja

---

## 📊 Dades de Sospitosos

### Sospitosos Finals

| Nom | Estat | Proves Vàlides | Descartat a |
|-----|-------|-----------------|----------|
| Pere del Molí | ❌ Descartat | 0 | Joc 1 (Serrat) |
| Joan | ❌ Descartat | 0 | Joc 1 (Serrat) |
| Marianna | ❌ Descartada | 0 | Joc 2 (Font) |
| Isidre | ❌ Descartat | 0 | Joc 3 (Planes) |
| **Anton l'Escolà** | ⚠️ Innocent (Gir) | 0 | Joc 6 (1r intent) |
| **Bernat Mestre** | ✅ **TRAÏDOR** | 6 | Joc 6 (2n intent) |

---

## 📚 Proves Disponibles al Quadern

### 6 Proves Vàlides contra Bernat

| # | Prova | Joc Origen | Detall | Categoria |
|----|-------|-----------|--------|-----------|
| 1 | **Segell ploma i clau** | Joc 4 (Cementiri) | Idèntic al fragment carta | Física |
| 2 | **Llum escola nit 15** | Joc 3 (Planes Bones) | A les 22:45 (mentre diu que era a Vic) | Ubicació |
| 3 | **Dos càntirs escola dia 12** | Joc 2 (Font del Ferro) | Va recollir càntirs per fer tinta | Moviment |
| 4 | **Sap de lletra** | Joc 1 (Serrat) | Missatge fogueres (necessari per escriure carta) | Habilitat |
| 5 | **Full cal·ligrafia + noms registre** | Joc 6 (1r intent) | Desbloqueïda quan acusen Anton | Accés |
| 6 | **Filigrana àncora idèntica** | Joc 4 (Cementiri) | Marca personal entre missatge i carta | Física |

### Proves NO Vàlides contra Anton

- **0 proves vàlides**
- Té coartada (vetllava el rector nit 15)
- No apareix en cap dels jocs 1-4

---

## 📱 Pantalles

### Pantalla 0: Títol + Menú

```
╔════════════════════════════════════════════╗
║                                            ║
║         PLA DE MASSET                      ║
║         ════════════════════════            ║
║         L'Acusació                         ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 1: Introducció

```
╔════════════════════════════════════════════╗
║                                            ║
║  HAS RECOLLIT 4 XIFRES: 4-2-3-1            ║
║                                            ║
║  SOSPITOSOS DESCARTATS:                   ║
║  ✓ Pere del Molí (Serrat)                 ║
║  ✓ Joan (Serrat)                          ║
║  ✓ Marianna (Font)                        ║
║  ✓ Isidre (Planes)                        ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  QUEDEN DOS:                              ║
║  • Anton l'Escolà                         ║
║  • Bernat Mestre d'Escola                 ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  Consulta el teu Quadern.                 ║
║  Marca 3 proves vàlides i acusa           ║
║  el traïdor.                              ║
║                                            ║
║           [CONTINUAR]                     ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 4a: Selector Sospitosos

```
╔════════════════════════════════════════════╗
║                                            ║
║  QUI ÉS EL TRAÏDOR?                       ║
║  ═════════════════════════════             ║
║                                            ║
║  Sospitosos que resten:                   ║
║                                            ║
║                                            ║
║  ┌─────────────────────────────────────┐  ║
║  │  [ANTON L'ESCOLÀ]                   │  ║
║  │   Escolà, vetlla del rector         │  ║
║  └─────────────────────────────────────┘  ║
║                                            ║
║                                            ║
║  ┌─────────────────────────────────────┐  ║
║  │  [BERNAT MESTRE D'ESCOLA]           │  ║
║  │   Mestre, coordina l'equip          │  ║
║  └─────────────────────────────────────┘  ║
║                                            ║
║                                            ║
║  Clica per seleccionar.                   ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 4b: Marcar Proves (Bernat Seleccionat)

```
╔════════════════════════════════════════════╗
║                                            ║
║  HAS ACUSAT: BERNAT MESTRE D'ESCOLA        ║
║  ═══════════════════════════════════       ║
║                                            ║
║  Marca 3 proves vàlides del Quadern:      ║
║                                            ║
║  ☐ Segell ploma i clau                    ║
║    └─ [Joc 4 Cementiri]                   ║
║                                            ║
║  ☐ Llum escola nit 15                     ║
║    └─ [Joc 3 Planes Bones]                ║
║                                            ║
║  ☐ Dos càntirs escola dia 12              ║
║    └─ [Joc 2 Font del Ferro]              ║
║                                            ║
║  ☐ Sap de lletra                          ║
║    └─ [Joc 1 Serrat]                      ║
║                                            ║
║  ☐ Full cal·ligrafia + noms registre      ║
║    └─ [Joc 6 Primer Intent]               ║
║                                            ║
║  ☐ Filigrana àncora idèntica              ║
║    └─ [Joc 4 Cementiri]                   ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  Proves marcades: 0/3                     ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║           [VALIDAR]                       ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 4b: Marcar Proves (Anton Seleccionat)

```
╔════════════════════════════════════════════╗
║                                            ║
║  HAS ACUSAT: ANTON L'ESCOLÀ                ║
║  ════════════════════════════              ║
║                                            ║
║  Marca 3 proves vàlides del Quadern:      ║
║                                            ║
║  ☐ Segell ploma i clau                    ║
║    └─ [Joc 4 Cementiri]                   ║
║                                            ║
║  ☐ Llum escola nit 15                     ║
║    └─ [Joc 3 Planes Bones]                ║
║                                            ║
║  ☐ Dos càntirs escola dia 12              ║
║    └─ [Joc 2 Font del Ferro]              ║
║                                            ║
║  ☐ Sap de lletra                          ║
║    └─ [Joc 1 Serrat]                      ║
║                                            ║
║  ☐ Full cal·ligrafia + noms registre      ║
║    └─ [Joc 6 Primer Intent]               ║
║                                            ║
║  ☐ Filigrana àncora idèntica              ║
║    └─ [Joc 4 Cementiri]                   ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  Proves marcades: 0/3                     ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║           [VALIDAR]                       ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 7A: GIR (Si acusa ANTON)

```
╔════════════════════════════════════════════╗
║                                            ║
║  [ÀUDIO ANTON]                            ║
║  ═════════════════════════════             ║
║                                            ║
║  "El rector! L'han ferit!"                ║
║                                            ║
║  "He estat vetllant-lo tota la nit        ║
║   del 15 de maig!"                        ║
║                                            ║
║  "Mireu la meva declaració signada."      ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  SE DESBLOQUEJA:                          ║
║  ✓ Declaració del Rector                  ║
║    "L'Anton va vetllar-me tota la nit"    ║
║                                            ║
║  ✓ Full de cal·ligrafia (Escola)          ║
║    "Noms de difunts copiats per nens"     ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  ANTON ESTÀ INNOCENT.                     ║
║                                            ║
║  Llavors... QUI ÉS EL TRAÏDOR?            ║
║                                            ║
║           [TORNAR A ACUSAR]               ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 7A: CORRECTE ✅ (Si acusa BERNAT + 3 proves vàlides)

```
╔════════════════════════════════════════════╗
║                                            ║
║  ✓ CORRECTE!                              ║
║  ════════════════════════════              ║
║                                            ║
║  BERNAT, MESTRE D'ESCOLA, ÉS EL TRAÏDOR.  ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  PROVES VÀLIDES MARCADES:                 ║
║                                            ║
║  ✓ [Prova 1 marcada]                      ║
║  ✓ [Prova 2 marcada]                      ║
║  ✓ [Prova 3 marcada]                      ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  SE DESBLOQUEJA:                          ║
║                                            ║
║  ✓ RIMA DEL CODI (Joc 9):                 ║
║    "Del cim baixa l'avís,                 ║
║     a la font es fa la tinta,             ║
║     al pla vetlla la ronda                ║
║     i a la pedra dorm el nom."            ║
║                                            ║
║  ✓ UBICACIÓ DE LA CLAU (Joc 7):           ║
║    "La clau està a la foscor,             ║
║     entre el Pla i la Rectoria."          ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  MOTIU DE LA TRAÏCIÓ:                     ║
║  En Jaume, fill de Bernat,                ║
║  és pres a la guarnició de Vic.           ║
║                                            ║
║  El capità ha promès alliberarlo          ║
║  a canvi dels noms dels conjurats.        ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  +100 punts                               ║
║  Evidència desbloqueïda: "Rima del codi"  ║
║                                            ║
║           [SEGUIR AL JOC 7]               ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 7B: INCORRECTE ❌

```
╔════════════════════════════════════════════╗
║                                            ║
║  ✗ INCORRECTE                             ║
║  ════════════════════════════              ║
║                                            ║
║  Has acusat: [NOM SOSPITÓS]                ║
║                                            ║
║  Proves marcades: [N]/3                   ║
║  ├─ [Prova 1] ✗ No vàlida                 ║
║  ├─ [Prova 2] ✗ No vàlida                 ║
║  └─ [Prova 3] ✓ Vàlida                    ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  ❌ NO hi ha prou proves vàlides per a     ║
║     aquesta persona, o les proves no       ║
║     corresponen al sospitós acusat.       ║
║                                            ║
║  −10 punts                                ║
║  Intent 1/3                               ║
║                                            ║
║           [PISTA (−5)]                    ║
║           [TORNAR A INTENTAR]             ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

## 🖱️ Interactivitat (JavaScript)

### Seleccionar Sospitós

```javascript
function selectSuspect(suspectName) {
  selectedSuspect = suspectName;
  
  // Mostra pantalla 4b (marcar proves)
  displayProofSelection(suspectName);
  
  // Carrega proves vàlides per aquest sospitós
  const validProofs = VALID_EVIDENCE[suspectName] || [];
  renderProofs(validProofs);
}
```

### Marcar Proves

```javascript
function toggleProof(proofId) {
  if (selectedProofs.includes(proofId)) {
    selectedProofs = selectedProofs.filter(p => p !== proofId);
  } else {
    selectedProofs.push(proofId);
  }
  
  updateProofCount(selectedProofs.length);
}
```

### Validació

```javascript
function validateAccusation() {
  if (selectedProofs.length < 3) {
    showError("Has de marcar 3 proves!");
    return;
  }
  
  const validProofs = VALID_EVIDENCE[selectedSuspect];
  const validCount = selectedProofs.filter(p => 
    validProofs.includes(p)
  ).length;
  
  if (validCount >= 3) {
    // CORRECTE
    if (selectedSuspect === "bernat") {
      showCorrect(selectedSuspect, selectedProofs);
    } else {
      showGiro(selectedSuspect); // Anton → GIR
    }
  } else {
    // INCORRECTE
    showIncorrect(selectedSuspect, validCount);
  }
}
```

### Gir (Anton)

```javascript
function showGiro(suspect) {
  if (suspect === "anton") {
    // Mostra pantalla GIR amb àudio
    playAudio("anton_inocent.mp3");
    
    // Desbloqueja evidències noves
    unlockEvidence("evidence_rector_statement");
    unlockEvidence("evidence_caligraphia");
    
    // Mostra botó per tornar a acusar
    showRetryButton();
  }
}
```

---

## 📊 Dades (Backend)

### Estructura de Proves

```javascript
const VALID_EVIDENCE = {
  "bernat": [
    "evidence_seal_pluma_clau",
    "evidence_light_school_night15",
    "evidence_cantirs_school",
    "evidence_sap_lletra",
    "evidence_caligraphia_noms",
    "evidence_filigrana_ancora"
  ],
  "anton": [] // Cap prova vàlida
};

const EVIDENCE_DETAILS = {
  "evidence_seal_pluma_clau": {
    name: "Segell ploma i clau",
    origin: "Joc 4 (Cementiri)",
    description: "Idèntic al fragment carta trobat"
  },
  "evidence_light_school_night15": {
    name: "Llum escola nit 15",
    origin: "Joc 3 (Planes Bones)",
    description: "Mentre diu que era a Vic descansant"
  },
  // ... més evidències
};
```

### Score Events

```javascript
{
  team_id: "abc123",
  station_id: "pla-masset-acusacio",
  type: "SOLVED",
  solved_at: "2025-05-15T23:45:00Z",
  attempts: 2,
  first_suspect_accused: "anton",
  final_suspect_accused: "bernat",
  evidence_selected: [
    "evidence_seal_pluma_clau",
    "evidence_light_school_night15",
    "evidence_cantirs_school"
  ],
  giro_triggered: true,
  evidence_unlocked: [
    "evidence_rector_statement",
    "evidence_caligraphia_noms",
    "evidence_rima_codi",
    "evidence_clau_ubicacio"
  ],
  points_awarded: 100
}
```

---

## 💡 Pista

| Cost | Text |
|------|------|
| −5 | "Compara proves: qui tenia accés? Segell, llum, tinta..." |

**Només una pista única per joc.**

---

## 🛠️ Checklist de Desenvolupament

### Front-end

- [ ] Pantalla 0: Títol
- [ ] Pantalla 1: Introducció (context + sospitosos restants)
- [ ] Pantalla 4a: Selector de 2 sospitosos (Anton, Bernat)
  - [ ] Botons clickables
  - [ ] Descripció breu de cada sospitós
- [ ] Pantalla 4b: Marcar 3 proves
  - [ ] Llista de 6 proves (checkboxes)
  - [ ] Mostrar comptador (X/3)
  - [ ] Botó [VALIDAR] desactivat fins a 3 proves
- [ ] Pantalla 7A (Gir): Àudio Anton + desbloqueig
  - [ ] Reproductor àudio
  - [ ] Visualització de proves desbloqueïdes
  - [ ] Botó [TORNAR A ACUSAR]
- [ ] Pantalla 7A (Correcte): Bernat culpable + desbloqueigs
  - [ ] Mostra proves marcades correctes
  - [ ] Mostra rima del codi
  - [ ] Mostra ubicació clau
  - [ ] Mostra motiu (fill pres)
- [ ] Pantalla 7B: Incorrecte
  - [ ] Mostra proves marcades vs. proves vàlides
  - [ ] Botó [PISTA] i [TORNAR A INTENTAR]
- [ ] Pantalla Confirmació Pista (genèrica)
- [ ] Cronometre visible (no compte enrere en aquest joc)
- [ ] Responsive design (mòbil, tablet)

### Backend

- [ ] Carregar proves del Quadern (dinàmic per equip)
- [ ] Endpoint: GET /game/6/suspects (torna els 2 sospitosos finals)
- [ ] Endpoint: GET /game/6/evidence (torna proves disponibles al Quadern)
- [ ] Endpoint: POST /game/6/accuse
  - [ ] Validar sospitós seleccionat (0-1 sospitosos)
  - [ ] Validar 3 proves marcades
  - [ ] Validar que proves corresponen al sospitós
  - [ ] Retorna: correcte/incorrecte, giro/resultat
  - [ ] Desbloqueja evidències si correspon
- [ ] Gir (Anton):
  - [ ] Reproduir àudio (`anton_inocent.mp3`)
  - [ ] Desbloquear `evidence_rector_statement`
  - [ ] Desbloquear `evidence_caligraphia_noms`
  - [ ] Permetre retry
- [ ] Correcte (Bernat):
  - [ ] Desbloquear `evidence_rima_codi`
  - [ ] Desbloquear `evidence_clau_ubicacio`
  - [ ] Registrar score event
  - [ ] Actualitzar punts (+100)
  - [ ] Marcar joc com a "solved"
  - [ ] Permetre accés Joc 7
- [ ] Incorrecte:
  - [ ] −10 punts
  - [ ] Registrar intent
  - [ ] Límit 3 intents
- [ ] Pista:
  - [ ] −5 punts
  - [ ] Mostrar text pista

### QA

- [ ] Testejar ambdós sospitosos (Anton, Bernat)
- [ ] Testejar que Anton primer declanxa gir
- [ ] Testejar que Bernat (3 proves) = correcte
- [ ] Testejar que Bernat (<3 proves) = incorrecte
- [ ] Testejar que proves incorrectes = incorrecte
- [ ] Testejar desbloqueig evidències
- [ ] Testejar que àudio Anton es reprodueix
- [ ] Testejar limit 3 intents
- [ ] Testejar pista (−5 punts)
- [ ] Testejar que giro es dona una sola vegada
- [ ] Testejar sincronització Quadern (proves noves visibles)

---

## 📈 Mètriques Estimades

| Mètrica | Valor |
|---------|-------|
| Temps joc | 8–10 min |
| Durada implementació | 8–10 h |
| Sospitosos | 2 (Anton, Bernat) |
| Proves disponibles | 6 |
| Proves necessàries | 3 |
| Pantalles | 5 (0, 1, 4a, 4b, 7A/7B) |
| Girs narratius | 1 (Anton innocent) |
| Desbloqueigs | 4 (Declaració, Cal·ligrafia, Rima, Clau) |
| Dificultat | 3/5 |
| Punts màxim | 100 |

---

## 📝 Notes Adicionals

### Gir Narratiu (CRÍTIC)

El **gir és essencial** a la trama:
1. Els jugadors creen que Anton és culpable
2. Àudio Anton els sorprèn (vetllava el rector)
3. Es desbloqueja evidència nova (cal·ligrafia)
4. Els jugadors es DONEN COMPTE de l'error
5. Acusen Bernat (traïdor real)

**Validació:** El gir ha de passar **només si acusen Anton**. Si acusen Bernat directe, es demana 3 proves i no hi ha gir.

### Proves Vàlides

**CRÍTIC:** El backend ha de validar que les 3 proves **corresponen** al sospitós acusat. Per Bernat hi ha 6 proves vàlides; per Anton, 0.

### Quadern (Accés a Proves)

Els jugadors poden consultar el Quadern en qualsevol moment per veure les proves desbloqueïdes. Al joc 6, la pantalla 4b mostra totes les proves disponibles al seu Quadern.

### Retry (2n Intent)

Després del gir (Anton innocent), el botó [TORNAR A ACUSAR] reinicia la pantalla 4a. Els jugadors seleccionen Bernat i marquen 3 proves noves.

---

**Status:** Llest per desenvolupar. Contactar si hi ha dubtes.
