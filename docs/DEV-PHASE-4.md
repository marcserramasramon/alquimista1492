# 💥 Fase 4: Jocs 5–9 (Traïció + Final)

**Status:** 📋 Planejament  
**Durada:** 8 hores  
**Inici:** Setmana 4–5  
**Dependency:** Fase 3 completada  
**Branch:** `phase/4-games-5-9`

---

## 🎯 Objectiu

Implementar els 5 jocs de l'Acte II + III: gir de trama, decisió moral, sometent.

---

## ✅ Jog 5: Control de l'Emissari (FÍSICA)

**Type:** `rolePlay` — No webapp, rol social amb actor

- [ ] Component `EmissariControl.tsx`
  - Instrucció pre-control: "Coartada: Anem a buscar llevadora..."
  - Botó "Entès, anem"
- [ ] Post-control (actor validates coartada):
  - Si pass: `didPassEmissariCheck = true`
  - Si fail: `didPassEmissariCheck = false`, −1 salconduit
- [ ] Test manual: actor validates coartada

---

## ✅ Jog 6: Acusació de Bernat (WEBAPP)

**Type:** `rolePlay` — Lògica branching

- [ ] Component `AccusationGame.tsx`
  - Dropdown: 8 personatges
  - **Primer intent (acusar Anton):**
    - Àudio: "El rector! L'han ferit!"
    - Desbloqueja: evidence_rector_statement, evidence_calligraphy_sheet
    - +3 minuts
    - Botó "Tornar a intentar?"
  - **Segon intent (acusar Bernat):**
    - Selector múltiple: 3 evidències del quadern
    - Validació: compta vàlides
    - Si ≥3 vàlides: success
    - Si <3: "Proves insuficients", +3 minuts
- [ ] Success desbloqueig:
  - Àudio rector: "La carta és a la caixa de les almoines..."
  - Desbloqueja: evidence_code_rhyme
  - Accés a Jog 7
- [ ] Test: ambdós paths

---

## ✅ Jog 7: Rectoria — Caixa (WEBAPP)

**Type:** `multiChoice` + `numberInput`

- [ ] Component `TreasureBoxGame.tsx`
  - **Part 1 - Obrir caixa:**
    - Input: "Qui és el traïdor?" → "Bernat"
    - Input: "Codi 4 xifres?" → "4-2-3-1"
    - Validació servidor
    - Si correcte: animació caixa + àudio rector
  - **Part 2 - Segells:**
    - 4 opcions de segell (A, B, C, D)
    - Selector: "Quin és correcte?"
    - Si A: success
    - Si altres: retry, +1 minut
- [ ] Test: ambdós parts

---

## ✅ Jog 8–9: Porta Església — Negociació + Sometent

**Type:** `rolePlay` + `timer` + `numberInput`

- [ ] Component `FinalSequenceGame.tsx`
  - **Part 1 - Contrasenya:**
    - Input: "Digues la contrasenya"
    - Validator: "L'alba ve de Vic"
    - Si correcte: "Segell correcte, anem!"
    - Si incorrect: retry, +2 minuts
  - **Part 2 - Tracte (60 seg):**
    - Àudio Bernat: "Sé per on vénen els dragons..."
    - Compte enrere visual
    - Botó A: "Deixa'l fugir" → Epileg A
    - Botó B: "Lliurar-lo" → Epileg B, +3 minuts
    - Si timeout: Default B
  - **Part 3 - Sometent:**
    - Mostra rima
    - Teclat interactiu 4 digits
    - Validator: "4-2-3-1"
    - Si correcte: Campana sona (audio) + "VICTORIA!"
    - Si incorrect: retry, +1 minut
- [ ] Test: ambdós paths (accept/reject)

---

## 📊 Resultats + Epílegs

- [ ] Component `ResultsScreen.tsx`
  - Títol: "VICTORIA!"
  - Temps: HH:MM
  - Puntuació total
  - Decisió moral: "Vau deixar fugir Bernat" / "Vau lliurar Bernat"
  - Epíleg complet (text narratiu)
  - Estadístiques: "X% van acceptar tracte"
  - Botó "Torna al Hub"

---

## ✅ Criteris d'Èxit

- ✅ Jog 5 (control): pass/fail funciona
- ✅ Jog 6 (acusació): gir de trama funciona
- ✅ Jog 7 (caixa): obrir + segells funcionen
- ✅ Jog 8–9 (sometent): contrasenya + tracte + codi funcionen
- ✅ Epílegs mostren correctament
- ✅ Resultats calculs correctes

---

## 🚀 Pròxim Pas

→ **[Fase 5: Dashboard Màster](./DEV-PHASE-5.md)** (~2 hores)
