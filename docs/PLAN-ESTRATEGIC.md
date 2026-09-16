# 🎯 Pla Estratègic de Desenvolupament
## El Traïdor de la Guixa — Webapp

**Data:** 16 setembre 2026  
**Status:** 📋 Prêt per a desenvolupament paral·lel  
**Estimació Total:** 37 hores  

---

## 📊 ESTAT ACTUAL

### ✅ Completat
- Documentació completa de trama, personatges, evidències
- Especificació funcional (PRD)
- Definició de 9 jocs (stations 1-8 + hub interactiu)
- Esquemes JSON de contingut (estructura)
- Arquitectura de seguretat (RLS, validació)
- **PERÒ:** Cap línia de codi implementada

### 🚀 Per fer: 37 hores organitzades en 6 fases

| Fase | Descripció | Durada | Ordre |
|------|-----------|--------|-------|
| **0** | Setup: Next.js + Supabase + Vercel | 2h | Sequential |
| **1** | BD: Migracions, RLS, contingut JSON | 4h | Bloquejada per Fase 0 |
| **2** | UI Base: Auth, Màster QR, estructura | 3h | Paral·lel a Fase 1 |
| **3** | Jocs 1–4 (Serrat, Font, Planes, Cementiri) | 12h | Paral·lel a Fase 1-2 |
| **4** | Jocs 5–9 (Control, Acusació, Caixa, etc.) | 8h | Paral·lel a Fase 3 |
| **5** | Dashboard Màster | 2h | Paral·lel a Fase 4 |
| **6** | Polish: Audio, animacions, testing | 6h | Sequential |

---

## 🎯 ESTRATÈGIA DE COORDINACIÓ PER A MÚLTIPLES AGENTS

### Nivell 1: Dependències Seqüencials (NO PARAL·LELITZABLES)

```
Fase 0 (Setup)
    ↓ (espera package.json, Next.js config)
Fase 1 (BD + Migracions)
    ↓ (espera taules Supabase + types generats)
Fase 6 (Polish, testing)
    ↓ (espera codi complet de fases 1-5)
```

**Responsables preferents:** 1 persona per fase (continuïtat)

---

### Nivell 2: Dependències Llargues Cadena (PARAL·LELITZABLES)

Mentre l'**Agent A** fa Fase 1 (BD), **Agent B i C** poden avançar:

```
TIMELINE PARAL·LEL:

Setmana 1:
├─ Agent A: Fase 0 (1h) + Fase 1 (3h) [BD completa]
├─ (espera taules...)
└─ Agents B+C: Preparar specs locals Fase 2-3

Setmana 2:
├─ Agent A: Finals Fase 1 (1h), comença Fase 5
├─ Agent B: Fase 2 (3h) — Màster UI, auth
├─ Agent C: Fase 3 (6h) — Jocs 1-4
└─ Agent D: Fase 4 prep — Jocs 5-9 specs

Setmana 3:
├─ Agent C: Fase 3 rest (6h) + Fase 4 comença
├─ Agent B: Fase 2 rest (0h, COMPLETA)
├─ Agent A: Fase 5 (2h)
└─ Agent D: Fase 4 (8h)

Setmana 4:
├─ Agent A: Fase 6 comença (audio, animacions)
├─ Agents C+D: Fase 4 rest + Polish
└─ Integració + testing
```

---

### Nivell 3: COMPARTIR CONTEXT ENTRE AGENTS

#### 📌 Branch Strategy
- **Fase 0:** Branca `phase/0-setup` → merge `main` quan Package completa
- **Fase 1:** Branca `phase/1-database` → merge `main` quan Migracions OK
- **Fase 2:** Branca `phase/2-master-ui` → merge `main` quan setupable
- **Fase 3:** Branca `phase/3-games-1-4` → merge `main` quan BD + types disponibles
- **Fase 4:** Branca `phase/4-games-5-9` → merge `main` quan Fase 3 stable
- **Fase 5:** Branca `phase/5-master-dashboard` → merge `main` quan Fase 4 stable
- **Fase 6:** Branca `phase/6-polish-qa` → merge `main` quando tudo stable

**Acció:** Rebase + merge quan cada branca passa QA local.

---

#### 📚 Document Compartit (Per a Fase En Curs)
Créa al `.claude/` un fitxer **`PHASE-STATUS.json`** que es comparteix entre agents:

```json
{
  "current_phase": 1,
  "branches": {
    "phase/0-setup": "COMPLETED",
    "phase/1-database": "IN_PROGRESS (Agent A)",
    "phase/2-master-ui": "QUEUED (waiting for phase/1)",
    "phase/3-games-1-4": "READY (blocked by types)"
  },
  "blockers": [
    "Awaiting Supabase types to be generated in phase/1"
  ],
  "shared_files": [
    "lib/types.ts",
    "content/public/stations.json",
    "supabase/schema.sql"
  ]
}
```

Cada agent:
1. **Llegeix** `PHASE-STATUS.json` abans de començar
2. **Actualitza** quan acaba una tasca
3. **Bloqueja** si la seva fase depèn d'una altre no completa

---

#### 🔄 Comunicació Entre Agents

**Recomanació:** Usa TaskCreate per compartir dependent tasks:

```
Agent A (Fase 1):
  - TaskCreate("Generate Supabase types")
  - Quan completa → commit + TaskUpdate("COMPLETED")

Agent C (Fase 3):
  - Llegeix task d'Agent A
  - Si "COMPLETED": comença Fase 3 amb types
  - Si "IN_PROGRESS": treballa en specs locals

Agent D (Fase 4):
  - Similar a Agent C, però espera Fase 3 completa
```

---

## 🛠️ SETUP INICIAL (FASE 0)

### Tasques Per a Agent A:

1. **Setup Next.js:**
   ```bash
   npx create-next-app@latest traidor-guixa --typescript --tailwind
   cd traidor-guixa
   npm install zustand @supabase/supabase-js @supabase/ssr zod framer-motion howler qrcode
   ```

2. **Setup Supabase Local:**
   ```bash
   npm install -D @supabase/cli
   supabase init
   supabase start
   ```

3. **Setup Vercel + Variables:**
   - `.env.local` amb `NEXT_PUBLIC_SUPABASE_URL`, etc.
   - `SUPABASE_SERVICE_ROLE_KEY`, `MASTER_PIN`

4. **Estructura Carpetes:**
   ```
   app/(player)/e/[code]
   app/(player)/joc/
   app/(player)/s/[token]
   app/(master)/master
   components/games
   components/ui
   lib/
   content/public/
   content/private/
   supabase/migrations/
   ```

5. **Commit** `phase/0-setup`: "chore: setup Next.js, Supabase, Tailwind"
6. **Merge** → `main`
7. **Notifica Agents B, C, D:** "Phase 0 completa, podeu tirar"

---

## 📋 PER A FASE 1 (Agent A)

Migracions SQL totes a la vegada:

```sql
-- migrations/001_init_schema.sql
CREATE TABLE sessions (...)
CREATE TABLE teams (...)
CREATE TABLE players (...)
... (totes les taules)

-- migrations/002_rls.sql
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
... (policies)

-- migrations/003_content.sql
INSERT INTO solutions_private (...)
INSERT INTO hints (...)
... (contingut sensible)
```

**Output:** `supabase/types.ts` autogenerat + `lib/db.ts` ready.

---

## 🎮 PER A FASES 3-4 (Games — Agents C + D)

### Estructura Joc Generic:

```ts
// components/games/StationIdGame.tsx
export type GameProps = {
  stationId: string
  content: PublicStationContent
  sharedState: unknown
  setSharedState: (s: unknown) => void
  submit: (answer: unknown) => Promise<SubmitResult>
  solved: boolean
}

export default function StationIdGame(props: GameProps) {
  // ... game logic
}
```

### Registre:
```ts
// components/games/registry.ts
export const GAMES = {
  'serrat-bruixes': lazy(() => import('./SerratBruixesGame')),
  'font-ferro': lazy(() => import('./FontFerroGame')),
  // ...
}
```

**Cada joc:**
- Independent component
- Testeable per compte seu
- Usa props genèriques (shared_state, submit)

---

## ✅ CRITERIS DE FET PER FASE

| Fase | Proves Reals |
|------|-------------|
| 0 | `npm run dev` funciona, `vercel deploy` OK |
| 1 | `supabase db push` success, types generats |
| 2 | Login màster amb PIN, QR génèricos generats |
| 3 | Un joc (ex: Serrat) funciona amb resposta de text, sincronitzat |
| 4 | Tots jocs soportats, acusació i caixa OK |
| 5 | Dashboard temps real, equips es sincronitzen |
| 6 | E2E test complet, audio plays, animacions smooth |

---

## 🚀 RECOMANACIONS PER A COORDINACIÓ

### ✅ FES:

1. **Crea branch per fase** — Cada agent treballa en branca isolada
2. **Usa TaskCreate** — Marques tasques globals (BD types, etc.)
3. **Comparteix `PHASE-STATUS.json`** — Visibility de blockers
4. **Commit atomic** — Un commit = una cosa funcional
5. **Escriu `// Co-Authored-By` en commits multi-agent** — Crèdit

### ❌ NO FACIS:

- Múltiples agents a `main` simultàneament (merge hell)
- Jocs que accedeixen directament a BD (sempre via props)
- Copiar solucions o pistes al client (content/private/* només servidor)
- Commits amb "WIP" o "temp" — prioritat cleanup

---

## 📞 TEMPLATES DE COORDINACIÓ

### Si Agent B espera Agent A:

**Agent A (Fi Fase 1):**
```bash
git commit -m "feat: complete phase 1 database and types"
git push -u origin phase/1-database
# Send TaskUpdate: "Phase 1 COMPLETED, types ready at lib/db.ts"
```

**Agent B (Comença Fase 2):**
```bash
git checkout main
git pull origin main  # jala la branca merged de A
git checkout -b phase/2-master-ui
# Ara Agent B té types i taules disponibles
```

### Si Agent C vol veure què fa Agent B (fase 2):

```bash
git fetch origin phase/2-master-ui
git log origin/phase/2-master-ui --oneline | head -5
# Veu els commits de B sense canviar de branca
```

---

## 📈 TIMELINE ESTIMAT

```
Week 1:
  Mon-Tue:   Agent A Phase 0 (2h)
  Wed-Thu:   Agent A Phase 1 (4h)
  Fri:       Agents B,C,D revisen PHASE-STATUS.json

Week 2:
  Mon-Tue:   Agent B Phase 2 (3h)
  Mon-Wed:   Agent C Phase 3 (6h)
  Wed-Thu:   Agent D Phase 4 prep
  Thu-Fri:   Agent A Phase 5 (2h)

Week 3:
  Mon-Wed:   Agent D Phase 4 (8h)
  Wed-Fri:   Agent C Phase 4 (rest of 8h if needed)
  Continuous: Integració + merge a main

Week 4:
  Mon-Thu:   Agent A Phase 6 (audio, animacions)
  Parallel:  E2E testing + Playwright
  Fri:       Final QA + Deploy
```

---

## 🎁 BONUS: GIT ALIASES PER A AGENTS

Afegeix a `.git/config`:

```ini
[alias]
  phase-status = log --oneline origin/phase/* | head -20
  blockers = show phase-status && cat .claude/PHASE-STATUS.json
  co-authored = commit --trailer Co-Authored-By:"Claude <noreply@anthropic.com>"
```

Ús:
```bash
git blockers          # Veu status de totes les branches de fase
git phase-status      # Commits recents de totes les fases
```

---

## 🎬 PRIMERA ACCIÓ

**Convida a l'Agent 0 (Setup):**

```
Agent: "Fase 0 setup. Create Next.js project with Supabase, Tailwind, structured folders.
Check: fase 0 completa quan `npm run dev` funciona i migracions bàsiques setup.
Branch: phase/0-setup → merge main.
Notify: Agents B, C, D en TaskUpdate quan fet."
```

Això desbloqueja tot el desenvolupament posterior.

---

**Versió:** 1.0  
**Data de planificació:** 2026-09-16  
**Autor:** Planificació estratègica per a El Traïdor de la Guixa
