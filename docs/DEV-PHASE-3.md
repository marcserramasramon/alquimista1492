# 🎮 Fase 3: Jocs 1–4 (Investigació)

**Status:** 📋 Planejament  
**Durada:** 12 hores  
**Inici:** Setmana 2–3  
**Dependency:** Fase 2 completada (UI base)  
**Branch:** `phase/3-games-1-4`

---

## 🎯 Objectiu

Implementar 4 estacions d'investigació (Acte I) amb mecàniques específiques, validació servidor real-time, desbloqueig d'evidències, i puntuació. Els jugadors resolen els jocs escanejant QR → web form → submit → servidor valida i desbloqueja evidència.

**Post-Fase 3 estado:** Fase d'investigació completa. Els jugadors poden:
- Escanejar 4 QR d'estacions
- Resoldre cada joc (diferent mecànica)
- Desbloquear 4 evidències progressivament
- Veure 4 digits del codi campanarunció Bernat)

---

## 🏗️ Arquitectura Global

```
app/(player)/s/[token]/
└── page.tsx                    Dispatch a joc segons token + variant

components/games/
├── registry.ts                 Mapeig station_id → Component
├── shared/
│   ├── GameLayout.tsx          Wrapper (títol, instruccions, pistes)
│   ├── HintButton.tsx          Revelar pista (cost punts)
│   ├── SubmitButton.tsx        Enviar resposta
│   └── FeedbackCard.tsx        Correcte/incorrecte
├── Jog1PolybiusSquare.tsx
├── Jog2DateCalculation.tsx
├── Jog3MapNavigation.tsx
└── Jog4TextComparison.tsx

lib/games/
├── validators.ts               Zod schemas per a cada joc
├── solutions.ts                (server-only) respostes correctes
├── scoring.ts                  Calcular punts
└── evidence.ts                 Desbloquejament d'evidències

content/
├── public/
│   └── game-instructions/      Textos i coordenades públiques
└── private/
    └── solutions.json          (server-only) SOLUCIONS SECRETES

api/games/
└── [validate].ts               POST validació respostes
```

---

## 📋 Checklist Arquitectura Global

### 1. Server-Only Solutions Setup
- [ ] Fitxer: `content/private/solutions.json` (NO enviat a client)
- [ ] Schema:
  ```json
  {
    "traitor": "Bernat",
    "stations": {
      "jog_1": {
        "A": { "solution": "SAP DE LLETRA", "digit": 4, "evidence": "fire_beacons" },
        "B": { "solution": "ARREBOSSADA", "digit": 4, "evidence": "fire_beacons" },
        "C": { "solution": "CLATELLADA", "digit": 4, "evidence": "fire_beacons" }
      },
      "jog_2": { /* ... */ },
      "jog_3": { /* ... */ },
      "jog_4": { /* ... */ }
    },
    "evidence": {
      "fire_beacons": { "title": "Senyals dels vigies", "suspects_dismissed": ["Pere", "Joan"] },
      "water_ledger": { "title": "Llibre de reg", "suspects_dismissed": ["Marianna"] },
      "patrol_route": { "title": "Ruta de patrulla", "suspects_dismissed": ["Isidre"] },
      "tombstone": { "title": "Làpida", "suspects_dismissed": ["Anton"] }
    }
  }
  ```
- [ ] `import 'server-only'` en tots els arxius que el carreguin

### 2. Validator Schemas (Zod)
- [ ] Fitxer: `lib/games/validators.ts`
- [ ] Per a cada joc: schema de validació d'input
  ```typescript
  const polybiusSquareSchema = z.object({
    answer: z.string().min(1).max(20)
  })
  const dateCalculationSchema = z.object({
    day: z.number().int().min(10).max(16)
  })
  // etc.
  ```

### 3. Game Station Router
- [ ] Fitxer: `app/(player)/s/[token]/page.tsx`
- [ ] Lògica:
  ```typescript
  1. Descodifica token → station_id
  2. Carrega variant de sessió
  3. Usa registry per trobar component
  4. Renderitza joc + GameLayout wrapper
  ```

### 4. Scoring System
- [ ] Fitxer: `lib/games/scoring.ts`
- [ ] Funcions:
  - `calculateReward()` — +100 per joc resolt
  - `calculateHintPenalty()` — 0 / −2 / −5
  - `updateSessionScore()` — POST a BD
- [ ] Taula `attempts` registra intent

### 5. Evidence Unlock Flow
- [ ] Fitxer: `lib/games/evidence.ts`
- [ ] Fonction: `unlockEvidence(session_id, evidence_id)`
- [ ] Updates:
  - `sessions.evidence_unlocked[]` append
  - Quadern es refrescar real-time (subscripció Realtime)
  - Suspects dismissed (status canvia a "Descartat")

---

## 🎯 Joc 1: Serrat de les Bruixes (Polybius Square)

**Durada:** 2.5h

### Mecànica
- Grid 5×5 de fogueres
- 6 parells (A1, D3, E5, etc.) codifiquen paraula
- Input: 6 inputs text (o clicks grid)
- Resposta: "SAP DE LLETRA" (variant A) / "ARREBOSSADA" (B) / "CLATELLADA" (C)

### Component Checklist
- [ ] Fitxer: `components/games/Jog1PolybiusSquare.tsx`
- [ ] Props:
  ```typescript
  {
    station_id: "jog_1"
    variant: "A" | "B" | "C"
    onSubmit: (answer: string) => Promise<{ success: boolean }>
  }
  ```
- [ ] UI Elements:
  - [ ] Títol: "Serrat de les Bruixes — Senyals Nocturnes"
  - [ ] Grid 5×5 clickable (cols A–E, rows 1–5)
  - [ ] Input 6 fogueres seleccionades (display + clear)
  - [ ] Botó "Verificar resposta"
  - [ ] Display resposta descodificada (text)
- [ ] Instruccions (públiques, a `content/public/jog-1-instructions.md`)
  - Imatge grid buida
  - Explicació: "Cada foguera té una lletra"
  - Hints (3 nivells)
- [ ] Pistes:
  - Nivell 1 (0 pts): "Comença per 'S'"
  - Nivell 2 (−2 pts): "Forma de tauler d'escacs"
  - Nivell 3 (−5 pts): "Resposta comença amb SAP..."
- [ ] Validació client (Zod): `string.min(1)`
- [ ] Feedback:
  - Correcte: "✅ Correcte! Descodificada: [resposta]"
  - Incorrecte: "❌ Incorrecte. Torna-ho a provar."
- [ ] Submit al servidor (next server action)

### Server Validation
- [ ] Fitxer: `app/api/games/validate/route.ts` (POST)
- [ ] Lògica:
  ```typescript
  1. Verifica JWT (session_id)
  2. Carrega SOLUTIONS.stations.jog_1[variant]
  3. Normalitza resposta (uppercase, trim)
  4. Compara amb solution
  5. Si match:
     - updateScore(session_id, +100)
     - unlockEvidence(session_id, "fire_beacons")
     - updateCodeDigit(session_id, 3, 4) // digit 4 en posició 3
     - return { success: true, digit: 4, evidence: "fire_beacons" }
  6. Si no match:
     - updateAttempt(session_id, false)
     - updateScore(session_id, −10)
     - return { success: false }
  ```
- [ ] RLS Policy: Jugador només pot validar sessions del seu equip
- [ ] Rate limit: 1 submit/5 seg (prevent spam)

### Testing Manual
- [ ] Device: iPhone (375px)
  - [ ] Grid visible sense scroll
  - [ ] Clicks accurats (48px+ targets)
  - [ ] Resposta renderitza correctament
- [ ] Variant A: "SAP DE LLETRA" → correcte
- [ ] Variant B: "ARREBOSSADA" → correcte
- [ ] Variant C: "CLATELLADA" → correcte
- [ ] Resposta fals "XXXX" → error
- [ ] Pista nivell 1 → −0 pts
- [ ] Pista nivell 3 → −5 pts
- [ ] Quadern es completa real-time (digit 4 visible)

---

## 🎯 Jog 2: Font del Ferro (Date Calculation)

**Durada:** 2.5h

### Mecànica
- Taula 7 dies (dies 10–16 de juny 1705)
- Cada dia: torn, litres aplegats
- Pregunta: "Quin dia es van recollir exactament X litres?"
- Input: selector (dia 10–16)
- Resposta: dia correcte

### Component Checklist
- [ ] Fitxer: `components/games/Jog2DateCalculation.tsx`
- [ ] UI Elements:
  - [ ] Títol: "Font del Ferro — Reguista"
  - [ ] Taula markdown (7 files)
    - Col 1: Dia (10–16)
    - Col 2: Torn (mati/tarda)
    - Col 3: Litres
    - Col 4: Total acumulat
  - [ ] Pregunta: "Quin dia es van recollir exactament 47 litres?" (variant específica)
  - [ ] Selector: <select> days 10–16
  - [ ] Botó "Verificar"
- [ ] Pistes:
  - Nivell 1 (0 pts): "Mira la col·lumna de totals"
  - Nivell 2 (−2 pts): "Està cap a mig-setmana"
  - Nivell 3 (−5 pts): "Dia 13"
- [ ] Validació client: validar que dia ∈ [10, 16]

### Server Validation
- [ ] Similar a Jog 1, però:
  - Input: `{ day: number }`
  - Solució: `{ correct_day: 13 }`
  - Digit: 2, Evidence: "water_ledger"

### Testing Manual
- [ ] Taula visible sense scroll (mobile)
- [ ] Selector funcionant
- [ ] Resposta: dia 13 → correcte
- [ ] Resposta: dia 15 → incorrecte
- [ ] Quadern actualitzat (digit 2)

---

## 🎯 Jog 3: Planes Bones (Map Navigation)

**Durada:** 2.5h

### Mecànica
- Mapa SVG (12 nodes, 15 trams)
- Taula: cada quarter (0–3), temps entre nodes
- Pregunta: "A quina hora passa el patrullador pel node X?"
- Input: selector hora (format "14:30")
- Resposta: hora correcta

### Component Checklist
- [ ] Fitxer: `components/games/Jog3MapNavigation.tsx`
- [ ] UI Elements:
  - [ ] Títol: "Planes Bones — Ruta de Patrulla"
  - [ ] SVG mapa (scalable, responsive)
    - 12 nodes (cercles labels A–L)
    - 15 trams (lines)
    - Highlights quan relevant
  - [ ] Taula quarters (4 files)
    - Quarter, temps per tram
  - [ ] Pregunta dinàmica per variant
  - [ ] Selector hora (format HH:MM dropdown o time input)
  - [ ] Botó "Verificar"
- [ ] Pistes:
  - Nivell 1 (0 pts): "Comença a les 14:00"
  - Nivell 2 (−2 pts): "Passa per 3 nodes"
  - Nivell 3 (−5 pts): "Hora final: 14:45"
- [ ] Validació client: regex HH:MM

### Server Validation
- [ ] Input: `{ time: "HH:MM" }`
- [ ] Solució: `{ correct_time: "14:45" }`
- [ ] Digit: 3, Evidence: "patrol_route"

### Testing Manual
- [ ] SVG responsive (mobile, desktop)
- [ ] Selector funcionant
- [ ] Resposta: "14:45" → correcte
- [ ] Resposta: "15:30" → incorrecte

---

## 🎯 Jog 4: Cementiri (Text Comparison)

**Durada:** 2.5h

### Mecànica
- 3 text columns:
  - Carta (malament, amb errors)
  - Registre oficial (bé)
  - Làpida (malament, amb errors)
- Pregunta: "Quina làpida coincideix amb la carta?"
- Input: selector làpida (A, B, C, D)
- Resposta: làpida correcta

### Component Checklist
- [ ] Fitxer: `components/games/Jog4TextComparison.tsx`
- [ ] UI Elements:
  - [ ] Títol: "Cementiri — Comparació de Textos"
  - [ ] 3 text blocks (scroll vertical)
    - Block 1: Carta (fragmentada)
    - Block 2: Registre (reference)
    - Block 3: Làpides A–D (selectable)
  - [ ] Pregunta: "Quina làpida coincideix amb la carta?"
  - [ ] Selector radio buttons (A, B, C, D)
  - [ ] Botó "Verificar"
- [ ] Pistes:
  - Nivell 1 (0 pts): "Fixa't en el nom"
  - Nivell 2 (−2 pts): "Busca dates matching"
  - Nivell 3 (−5 pts): "Làpida C"
- [ ] Validació client: s'ha seleccionat una opció

### Server Validation
- [ ] Input: `{ choice: "A" | "B" | "C" | "D" }`
- [ ] Solució: `{ correct_choice: "C" }`
- [ ] Digit: 1, Evidence: "tombstone"

### Testing Manual
- [ ] 3 blocks visibles (scroll OK)
- [ ] Radio buttons funcionant
- [ ] Resposta: "C" → correcte
- [ ] Resposta: "A" → incorrecte

---

## 📊 Data Flow Complet (per a cada jog)

```
1. Jugador escaneja QR estació → token
2. app/(player)/s/[token]/page.tsx → descodifica + renderitza joc
3. Joc (client) renderitza UI + pistes
4. Jugador entra resposta + click "Verificar"
5. Client: validació Zod → error si invalid
6. Client: POST /api/games/validate
7. Servidor: import 'server-only'; carrega SOLUTIONS
8. Servidor: compara resposta vs solució
9. Si correcte:
   - Insert `attempts` (success: true)
   - Update `sessions.score` += 100
   - Update `sessions.solved_stations[]` append
   - Update `sessions.code_digits[]` append
   - Insert `evidence_unlocked` row
   - Retrona `{ success: true, digit, evidence }`
10. Si incorrecte:
   - Insert `attempts` (success: false)
   - Update `sessions.score` −= 10
   - Retorna `{ success: false }`
11. Client: mostra feedback
12. Client: subscripció Realtime a `sessions` → quadern es completa
```

---

## 🎬 Implementation Order

1. **Setup & Infrastructure** (2h)
   - [ ] Zod validators (`lib/games/validators.ts`)
   - [ ] Solutions JSON setup (server-only)
   - [ ] Scoring functions
   - [ ] Evidence unlock logic
   - [ ] Station router (`s/[token]/page.tsx`)

2. **Jog 1: Polybius Square** (2.5h)
   - [ ] Component
   - [ ] Server validation
   - [ ] Testing

3. **Jog 2: Date Calculation** (2.5h)
   - [ ] Component
   - [ ] Server validation
   - [ ] Testing

4. **Jog 3: Map Navigation** (2.5h)
   - [ ] Component (SVG mapa)
   - [ ] Server validation
   - [ ] Testing

5. **Jog 4: Text Comparison** (2.5h)
   - [ ] Component
   - [ ] Server validation
   - [ ] Testing

---

## ✅ Criteris d'Èxit

- ✅ 4 jocs renderitzen correctament (mobile responsive)
- ✅ Validació servidor funcionant (import 'server-only')
- ✅ Resposta correcta → desbloqueig evidència real-time
- ✅ Resposta incorrecta → error + retry sense perdre punts
- ✅ Pistes funcionen (cost dinàmic: 0/−2/−5)
- ✅ Codi: 4 digits omplerts (4-2-3-1) després de 4 jogs
- ✅ Quadern es completa real-time (subscripció Realtime)
- ✅ Suspects dismissed: 5 descartats al final (Pere, Joan, Marianna, Isidre, Anton)
- ✅ Puntuació correcta (400 pts base + penalitats pistes)
- ✅ Testing variant A/B/C — tots els jocs quadren

---

## 🔧 Stack & Dependencies

```bash
npm install zod
# (resto ja instal·lat a Fase 2)
```

- **Validació:** Zod (client + servidor)
- **State:** Zustand (local) + Supabase Realtime (BD)
- **Scoring:** Funcions pures a `lib/games/scoring.ts`
- **Secrets:** `import 'server-only'` per a solutions.json

---

## 🚀 Pròxim Pas

→ **[Fase 4: Jocs 5–9](./DEV-PHASE-4.md)** (~8 hores)

Fase 4 conté jocs més avançats: rol-play (Emissari), acusació, caixa, submissió final.
