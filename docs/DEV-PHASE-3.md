# 🎮 Fase 3: Jocs 1–4 (Investigació)

**Status:** 📋 Planejament  
**Durada:** 12 hores  
**Inici:** Setmana 2–3  
**Dependency:** Fase 2 completada  
**Branch:** `phase/3-games-1-4`

---

## 🎯 Objectiu

Implementar 4 estacions (jocs) amb validació servidor i desbloqueig d'evidències.

---

## 📋 Per a Cada Joc (1–4)

### Component (`components/games/[GameName].tsx`)
- [ ] Props: `station`, `variant`, `hints`, `onSubmit`
- [ ] UI del joc (input, display, etc.)
- [ ] Pistes (3 nivells)
- [ ] Botó "Enviar" → `onSubmit(answer)`
- [ ] Feedback visual (correcte/incorrecte)

### Server Action (`app/api/validate-answer/route.ts`)
- [ ] `import 'server-only'`
- [ ] Carrega `SOLUTIONS.stations[station_id][variant]`
- [ ] Valida input
- [ ] Retorna `{ success, digit, evidence_unlock, suspects_dismissed }`
- [ ] Si success: desbloqueja evidència a BD

### Registry (`components/games/registry.ts`)
- [ ] Mapeig `station_id` → Component

### Evidence Unlock (`lib/unlock-evidence.ts`)
- [ ] Funció per afegir evidència al quadern
- [ ] Actualitza BD `sessions.evidence_unlocked[]`

---

## ✅ Joc 1: Serrat de les Bruixes

**Type:** `polybiusSquare`

- [ ] Component `PolybiusGame.tsx`
  - Grid 5×5 interactiu
  - Input pairs de fogueres
  - Validator al servidor vs "SAP DE LLETRA" (variant A)
- [ ] Pistes (3 nivells, costs 0/-2/-5)
- [ ] Reward: digit 4, evidence_firebeacons, descarta Pere + Joan
- [ ] Test: resposta correcta i incorrecta

---

## ✅ Joc 2: Font del Ferro

**Type:** `dateCalculation`

- [ ] Component `DateCalculationGame.tsx`
  - Taula torns (dies 10–16)
  - Selector día recollida aigua
  - Validator al servidor
- [ ] Pistes
- [ ] Reward: digit 2, evidence_water_ledger, descarta Marianna
- [ ] Test

---

## ✅ Joc 3: Planes Bones

**Type:** `mapNavigation`

- [ ] Component `MapNavigationGame.tsx`
  - Mapa SVG nodes + trams
  - Taula timings quarts
  - Input hora (selector)
  - Validator
- [ ] Pistes
- [ ] Reward: digit 3, evidence_patrol_route, descarta Isidre
- [ ] Test

---

## ✅ Joc 4: Cementiri

**Type:** `textComparison`

- [ ] Component `TextComparisonGame.tsx`
  - 2 columns: carta (malament) vs registre (bé) vs làpida (malament)
  - Selector làpida
  - Validator
- [ ] Pistes
- [ ] Reward: digit 1, evidence_tombstone, descarta Anton
- [ ] Test

---

## 📊 Fluxos Compartits

### Scoring
- Jog resolt: +100 punts
- Resposta incorrecta: −10 punts
- Pista nivell 1: 0 punts
- Pista nivell 2: −2 punts
- Pista nivell 3: −5 punts

### BD Updates (al resoldre correctament)
- [ ] Insert `attempts` record
- [ ] Update `sessions.solved_stations[]` + `sessions.score`
- [ ] Insert evidències `evidence_unlocked[]`
- [ ] Update `sessions.code_digits[]` amb digit

### Quadern Update (Real-Time)
- [ ] Hook `useEvidences()` → subscripció BD
- [ ] Quadern es completa automàticament

---

## ✅ Criteris d'Èxit

- ✅ 4 jocs renderitzen correctament
- ✅ Validació servidor funciona
- ✅ Resposta correcta → desbloqueig evidència
- ✅ Resposta incorrecta → error + retry
- ✅ Pistes funcionen (cost punts)
- ✅ Codi parcial omplert (4-2-3-1)
- ✅ Quadern es completa automàticament

---

## 🚀 Pròxim Pas

→ **[Fase 4: Jocs 5–9](./DEV-PHASE-4.md)** (~8 hores)
