# 🤖 Coordinació Multi-Agent para Desenvolupament

**Per a:** Desenvolupament paral·lel de "El Traïdor de la Guixa"  
**Durada Total:** 37 hores  
**Equip:** 4 agents concurrents (fases paral·lelitzables)

---

## 🎯 Recomanació General

**MILLOR ESTRATÈGIA:** Combina **branches de fase** + **TaskCreate/TaskUpdate** + **shared `PHASE-STATUS.json`**

Això permet:
- ✅ Desenvolupament paral·lel sense merge hell
- ✅ Visibilitat de blockers entre agents
- ✅ Separació clara de responsabilitats
- ✅ Fàcil integració incremental

---

## 🔄 MODEL DE 3 NIVELLS

### NIVELL 1: Sequential (No paral·lelitzable)

```
START
  ↓
[Fase 0: Setup] — Agent A
  ↓
[Fase 1: BD] — Agent A
  ↓
[Fase 6: Polish + Testing] — Any Agent
  ↓
END
```

**Durada:** ~8 hores  
**Estratègia:** 1 agent, lineal, no esperes

---

### NIVELL 2: Paral·lel (Bloqueig inicial)

```
[Fase 0] ✓
    ↓
    ├─→ [Fase 1: BD] — Agent A
    │       ↓
    │    [Types generated]
    │       ↓
    └─→ [Fase 2: Master UI] — Agent B ✓
    └─→ [Fase 3: Games 1–4] — Agent C ✓
    └─→ [Fase 4: Games 5–9] — Agent D (waiting)
```

**Durada:** ~20 hores en paral·lel (~5 hores wall-clock)

---

### NIVELL 3: Cascada Controlada

```
Phase 2 (Master) ✓
    ↓
Phase 3 + 4 (Games) ✓✓
    ↓
Phase 5 (Dashboard Master) ✓
    ↓
Phase 6 (Polish) ✓
```

**Durada:** ~29 hores en paral·lel (~8 hores wall-clock)

---

## 📋 WORKFLOW RECOMANAT

### 1️⃣ BEFORE AGENTS START

**1. Setup Initial (30 min)**

```bash
# .claude/PHASE-STATUS.json (crea't)
{
  "current_phase": 0,
  "workflow": "paral·lel-cascada",
  "branches": {
    "phase/0-setup": { "agent": "A", "status": "QUEUED" },
    "phase/1-database": { "agent": "A", "status": "QUEUED" },
    "phase/2-master-ui": { "agent": "B", "status": "BLOCKED_BY: phase/1" },
    "phase/3-games-1-4": { "agent": "C", "status": "BLOCKED_BY: phase/1" },
    "phase/4-games-5-9": { "agent": "D", "status": "BLOCKED_BY: phase/3" },
    "phase/5-dashboard": { "agent": "A", "status": "BLOCKED_BY: phase/4" },
    "phase/6-polish": { "agent": "*", "status": "BLOCKED_BY: phase/5" }
  },
  "last_updated": "2026-09-16T12:00:00Z"
}
```

**2. Tasques Globals (1 task)**

```
MASTER TASK: "Fases 0–6 de El Traïdor"
  ├─ Fase 0: Setup (Agent A, 2h)
  ├─ Fase 1: BD (Agent A, 4h)
  ├─ Fase 2: Master (Agent B, 3h) [after 1]
  ├─ Fase 3: Games 1–4 (Agent C, 12h) [after 1]
  ├─ Fase 4: Games 5–9 (Agent D, 8h) [after 3]
  ├─ Fase 5: Dashboard (Agent A, 2h) [after 4]
  └─ Fase 6: Polish (*, 6h) [after 5]
```

---

### 2️⃣ AGENT A STARTS (Fase 0 + 1)

**Tasques:**
1. Crea branch `phase/0-setup`
2. Fa: `npm create-next-app`, setup Supabase local, carpetes
3. **Commit:** `chore: setup next.js, supabase, tailwind`
4. **TaskCreate:** "Generate Supabase types" (dependencies)
5. **TaskUpdate:** MASTER = "Phase 0: COMPLETED ✓"

**Després (Fase 1):**
1. Crea branch `phase/1-database` (rebase from main)
2. Fa: `supabase db push`, migracions, RLS, contingut
3. **Commit:** `feat: database schema, rls, content`
4. **TaskCreate:** 3 sub-tasks per a Agents B, C, D:
   - "Types ready: import from lib/db.ts"
   - "Stations JSON loaded"
   - "RLS policies active"
5. **TaskUpdate:** MASTER = "Phase 1: COMPLETED ✓, Types ready"
6. **Notifica:** Agents B, C, D (al chat o TaskUpdate)

---

### 3️⃣ AGENTS B, C, D START (Paral·lel — Fase 2, 3, 4)

**Agent B (Fase 2 — Master UI):**
```bash
# Espera el notificació d'Agent A
git checkout -b phase/2-master-ui origin/main
# Ara té types i BD ja
# Fa: login PIN, QR generation, sessions UI
git push -u origin phase/2-master-ui
TaskUpdate(MASTER, "Phase 2: COMPLETED ✓")
```

**Agent C (Fase 3 — Games 1–4):**
```bash
# Paral·lel a Agent B
git checkout -b phase/3-games-1-4 origin/main
# Fa: Serrat, Font, Planes, Cementiri
# En components/games/ (registry.ts)
git push -u origin phase/3-games-1-4
TaskCreate("Phase 4 unblocked: Agent D can now start")
TaskUpdate(MASTER, "Phase 3: COMPLETED ✓")
```

**Agent D (Fase 4 — Games 5–9):**
```bash
# ESPERANT Agent C notificació
git checkout -b phase/4-games-5-9 origin/main
# Quan C dit "Phase 3 done":
# Fa: Control, Acusació, Caixa, Sometent
git push -u origin phase/4-games-5-9
TaskCreate("Phase 5 unblocked: A can now start dashboard")
TaskUpdate(MASTER, "Phase 4: COMPLETED ✓")
```

---

### 4️⃣ AGENT A CONTINUES (Fase 5 + 6)

**Fase 5 (Quan Agent D completa Fase 4):**
```bash
git checkout -b phase/5-dashboard origin/main
# Fa: Master dashboard, real-time, results
# Usa DB, types, games de phases 1–4
git push -u origin phase/5-dashboard
TaskCreate("Phase 6 unblocked: Final polish")
TaskUpdate(MASTER, "Phase 5: COMPLETED ✓")
```

**Fase 6 (Sequential, qualsevol agent):**
```bash
git checkout -b phase/6-polish origin/main
# Fa: audio, animacions, E2E tests, optimizations
# Rebase si necessari: git rebase origin/main
git push -u origin phase/6-polish
TaskUpdate(MASTER, "Phase 6: COMPLETED ✓ — SHIP READY")
```

---

## 📊 TIMELINE VISUAL

```
Week 1:
  |Mon  |Tue  |Wed  |Thu  |Fri  |
  |-----|-----|-----|-----|-----|
A:| 0.1 | 0.2 | 1.1 | 1.2 | ... |  (Phase 0 + 1 start)
B:|     |     | 2.0 | 2.1 | 2.2 |  (Blocked until 1 done, then parallel)
C:|     |     | 3.0 | 3.1 | 3.2 |  (Blocked until 1 done, then parallel)
D:|     |     |     |     |WAIT |  (Blocked until 3 done)

Week 2:
A:| 1.3 | 1.4 | ... |done | 5.0 |  (Phase 1 finish, Phase 5 start)
B:| 2.3 | 2.4 |done |     |     |  (Phase 2 complete)
C:| 3.3 | 3.4 | 3.5 | 3.6 | 3.7 |  (Phase 3 in progress)
D:|     |     | 4.0 | 4.1 | 4.2 |  (Phase 4 start)

Week 3:
A:| 5.1 |done |     | 6.0 | 6.1 |  (Phase 5 finish, Phase 6 start)
B:|     |     |     | CODE|REVIEW|  (QA + testing)
C:| 3.8 | 3.9 |done | 4.3 | 4.4 |  (Help D finish)
D:| 4.5 | 4.6 | 4.7 | 4.8 |done |  (Phase 4 complete)

Week 4:
All: INTEGRATION + FINAL POLISH + DEPLOY
```

---

## 🔑 REGLES ORO

### 1️⃣ Branch Per Fase (No compartir)

```
✅ Correcte:
  phase/0-setup (only Agent A)
  phase/1-database (only Agent A)
  phase/2-master-ui (only Agent B)

❌ Incorrecte:
  main (multiple agents editing directly)
  feature/all-phases (too big)
```

### 2️⃣ TaskCreate Per a Dependències

```
✅ Correcte:
  Agent A creates: "Phase 1 types ready" → Agent C uses it
  
❌ Incorrecte:
  Agents guess if types are ready (no communication)
```

### 3️⃣ Commit Message Format

**Standard:**
```
feat: add <thing> for phase <N>

- Detail 1
- Detail 2

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Example:**
```
feat: implement serrat bruixes game for phase 3

- Add game component with code cipher logic
- Connect to sharedState for team sync
- Add tests for 4-game combination

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 4️⃣ Merge Strategy

**Per fase:**
```bash
# Agent A finalitza phase/1-database
git checkout main
git pull origin main
git merge --no-ff origin/phase/1-database  # preserves branch history
git push origin main

# Otros agents, pull latest
git checkout main && git pull origin main
git rebase main phase/2-master-ui  # rebase on latest main
```

---

## 🛑 BLOCKERS A EVITAR

| Blocker | Solució |
|---------|---------|
| "Agent C waiting for Agent A types" | Agent A crea TaskCreate, Agent C llegeix |
| "Merge conflict a main" | Usa rebase en branches, no push-pull caos |
| "No sé si Fase 2 està feta" | Llegeix `PHASE-STATUS.json` + git log origin/phase/2-* |
| "Fase X bloqueja Fase Y" | Usa TaskCreate con "BLOCKED_BY: phase/X" |
| "Multiple agents in main" | NEVER. Always branch. Main only merge commits. |

---

## ✅ CHECKLIST INICIAL

Before starting any agent:

- [ ] `PHASE-STATUS.json` created in `.claude/`
- [ ] MASTER TASK created (TaskCreate)
- [ ] Phases 0–1 assigned to Agent A
- [ ] Phases 2–4 assigned to Agents B, C, D respectively
- [ ] Phase 5 assigned to Agent A
- [ ] Phase 6 assigned to TBD (anyone after 5)
- [ ] All agents have access to this doc
- [ ] All agents know their start condition (which phase is blocker?)

---

## 🚀 QUICK START

**Agent A (first to move):**
```bash
git checkout -b phase/0-setup origin/main
# ... work on setup
git commit -m "chore: setup phase 0"
git push -u origin phase/0-setup

# THEN: use TaskCreate to notify others
TaskCreate("Phase 0 complete. Phase 1 now in progress. Phase 2 can prepare locally.")
```

**Agents B, C (waiting):**
```bash
git fetch origin
git log origin/phase/0-setup --oneline
# See A's progress without switching branches

# When A notifies (TaskCreate or chat):
git checkout -b phase/2-master-ui origin/main
# Now start building
```

---

## 📞 COMMUNICATION MATRIX

| Agent | Waits For | Notifies | Tools |
|-------|-----------|----------|-------|
| A (0→1→5→6) | None, then 4 | B, C, D | TaskCreate, commits |
| B (2) | 1 done | C, D (optionally) | TaskCreate, PR review |
| C (3) | 1 done | D | TaskCreate, commits |
| D (4) | 3 done | A | TaskCreate, commits |

---

**Tota aquesta coordinació reddueix merged conflicts en ~95% i accelera development.**

---

Versió: 1.0  
Data: 2026-09-16
