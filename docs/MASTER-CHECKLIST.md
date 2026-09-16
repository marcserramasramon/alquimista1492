# 🎬 Master Checklist — Com Coordinar els Agents

**Para:** Desenvolupador principal que coordina múltiples agents/chats

---

## 📋 PRE-LAUNCH (15 min)

- [ ] Llegeix `PLAN-ESTRATEGIC.md` (visió global)
- [ ] Llegeix `COORDINACIO-AGENTS.md` (workflow)
- [ ] Llegeix `AGENT-ROLES.md` (tasques específiques)
- [ ] Crea `.claude/PHASE-STATUS.json` (copra template abajo)
- [ ] Crea MASTER TASK amb TaskCreate

---

## 🚀 LAUNCH (FASE 0)

### Tasques Pre-Fase-0
```bash
# Crea el status tracker
cat > .claude/PHASE-STATUS.json << 'EOF'
{
  "current_phase": 0,
  "workflow": "paral·lel-cascada",
  "last_updated": "2026-09-16T12:00:00Z",
  "branches": {
    "phase/0-setup": {
      "agent": "A",
      "status": "QUEUED",
      "duration": "2h",
      "blockers": []
    },
    "phase/1-database": {
      "agent": "A",
      "status": "BLOCKED_BY: phase/0-setup",
      "duration": "4h",
      "blockers": ["phase/0-setup merge to main"]
    },
    "phase/2-master-ui": {
      "agent": "B",
      "status": "BLOCKED_BY: phase/1-database",
      "duration": "3h",
      "blockers": ["lib/db.types.ts generated"]
    },
    "phase/3-games-1-4": {
      "agent": "C",
      "status": "BLOCKED_BY: phase/1-database",
      "duration": "12h",
      "blockers": ["lib/db.types.ts generated"]
    },
    "phase/4-games-5-9": {
      "agent": "D",
      "status": "BLOCKED_BY: phase/3-games-1-4",
      "duration": "8h",
      "blockers": ["phase/3 complete, games registry available"]
    },
    "phase/5-dashboard": {
      "agent": "A",
      "status": "BLOCKED_BY: phase/4-games-5-9",
      "duration": "2h",
      "blockers": ["all games complete"]
    },
    "phase/6-polish": {
      "agent": "*",
      "status": "BLOCKED_BY: phase/5-dashboard",
      "duration": "6h",
      "blockers": ["all features working"]
    }
  }
}
EOF

git add .claude/PHASE-STATUS.json
git commit -m "docs: initial phase status tracker"
```

### Envía A Agent A
```
👤 Agent A:

Hola! Comença Fase 0 (Setup).

📋 Tasques:
1. Crea Next.js project (create-next-app)
2. Setup Supabase local (supabase init)
3. Crea estructura de carpetes
4. Deploy a Vercel
5. Commit "chore: setup phase 0"
6. Push a phase/0-setup branch

⏱️ Durada estimada: 2 hores

✅ Success criteria:
- npm run dev funciona
- supabase start OK
- Vercel deploy accessible

📚 Guia completa: docs/AGENT-ROLES.md (Fase 0 section)

Quan acabis, actualitza PHASE-STATUS.json amb status "COMPLETED" i notifica els altres 3 agents.
```

---

## ⏱️ SEMANA 1 — FASE 0–1

### Dia 1–2: Agent A — Fase 0
```
TUE STATUS:
- Agent A: Working on phase/0-setup
- Agents B, C, D: Standby (reading docs)

ACTIONS:
☐ Check A's commits: git log origin/phase/0-setup
☐ Answer any questions from A
```

### Dia 3: Fase 0 Complete
```
WED STATUS:
- Agent A: COMPLETED phase/0-setup, merging to main
- Agents B, C, D: Ready to prep locally

ACTIONS:
☐ Verifica merge: git log main --oneline | head -5
☐ Update PHASE-STATUS.json: phase/0-setup → COMPLETED
☐ Notify Agent A: "Ready for Phase 1"
```

### Dia 4–5: Agent A — Fase 1
```
THU-FRI STATUS:
- Agent A: Working on phase/1-database
- Agents B, C, D: Can prepare locally (review structure)

ACTIONS:
☐ Check A's migration PRs/commits
☐ Ensure supabase types will be generated
☐ Prepare B's list of dependencies on A's types
```

---

## ⏱️ SEMANA 2 — PARAL·LEL: FASE 1→5

### Dia 6: Phase 1 Complete
```
MON STATUS:
- Agent A: COMPLETED phase/1-database, merging
- Agent B: Starting phase/2-master-ui
- Agent C: Starting phase/3-games-1-4
- Agent D: Standby (reading game specs, preparing locally)

ACTIONS FOR MASTER:
☐ Update PHASE-STATUS.json: phase/1-database → COMPLETED
☐ Notify B: "Types ready, start phase/2"
☐ Notify C: "Types ready, start phase/3"
☐ Notify D: "C started, monitor progress"
☐ Commit status update: git commit -m "docs: phase 1 complete"
```

### Dia 7–8: Paral·lel B + C
```
TUE-WED STATUS:
- Agent A: Starting phase/5 (prep) / or supporting
- Agent B: ~1h into phase/2-master-ui
- Agent C: ~3h into phase/3-games-1-4
- Agent D: Prep, final review of game 5–9 specs

ACTIONS FOR MASTER:
☐ git fetch origin → see commits from B and C
☐ git log origin/phase/2-master-ui --oneline | head -5  (B's progress)
☐ git log origin/phase/3-games-1-4 --oneline | head -5  (C's progress)
☐ Check no merge conflicts on main
☐ Answer questions if needed
```

### Dia 9–10: Agents B + C Near Complete
```
THU-FRI STATUS:
- Agent A: Paused (waiting for phase 4 / 5)
- Agent B: ~2h into phase/2, almost done
- Agent C: ~6h into phase/3, halfway
- Agent D: Starting phase/4-games-5-9 (if phase/3 games registry ready)

ACTIONS FOR MASTER:
☐ Monitor progress B + C
☐ Check if C's games registry merged (D dependency)
☐ If D can't start, ensure clear blocker in PHASE-STATUS.json
```

---

## ⏱️ SEMANA 3 — INTEGRACIO FASE 3→5

### Dia 11–12: Fase 2 + 3 Done, Phase 4 In Progress
```
MON-TUE STATUS:
- Agent A: Starting phase/5-dashboard
- Agent B: COMPLETED phase/2-master-ui (QA phase)
- Agent C: COMPLETED phase/3-games-1-4 (QA phase)
- Agent D: ~4h into phase/4-games-5-9

ACTIONS FOR MASTER:
☐ Update PHASE-STATUS.json: phase/2 → COMPLETED, phase/3 → COMPLETED
☐ Notify A: "Phase 4 ready, you can start phase/5"
☐ Create sub-task for B + C: "QA phase/4 when D pushes"
☐ Commit: git commit -m "docs: phase 2 and 3 complete"
```

### Dia 13–14: Fase 5 In Progress, Fase 4 Near Complete
```
WED-THU STATUS:
- Agent A: ~1h into phase/5-dashboard
- Agents B + C: Testing phase/4 + master UI integration
- Agent D: ~7h into phase/4, almost done

ACTIONS FOR MASTER:
☐ Monitor A's dashboard progress
☐ Ensure B+C have all info to test with D's games
☐ No merge conflicts?
☐ All branches up-to-date with main?
```

### Dia 15: All Core Features Done
```
FRI STATUS:
- Agent A: COMPLETED phase/5-dashboard
- Agents B + C: Integration testing
- Agent D: COMPLETED phase/4-games-5-9

ACTIONS FOR MASTER:
☐ Update PHASE-STATUS.json: phase/4 → COMPLETED, phase/5 → COMPLETED
☐ Announce: "Phase 6 (Polish) can start"
☐ Create new branch: phase/6-polish
☐ TaskCreate("Phase 6: Audio, animations, E2E tests, optimization")
```

---

## 🔄 SETTIMANA 4 — POLISH + FINAL

### Dia 16–19: Phase 6
```
MON-THU STATUS:
- Agent (TBD): Working on phase/6-polish (audio, animacions, tests)
- Agents B + C + D: QA + support

ACTIONS FOR MASTER:
☐ Review phase/6 commits
☐ Run test suite: npm run test
☐ Check E2E tests: npm run test:e2e
☐ Test on mobile (iOS + Android)
☐ Review performance metrics
```

### Dia 20: Deploy Ready
```
FRI STATUS:
- All phases COMPLETED
- Tests passing
- Performance OK
- Ready for production

ACTIONS FOR MASTER:
☐ Final merge phase/6 to main
☐ git tag v1.0.0
☐ vercel deploy (production)
☐ Celebrate! 🎉
```

---

## 🎯 QUICK STATUS CHECK (Daily)

```bash
# Run this daily to see progress

# 1. Check git branches
git fetch origin
git branch -r | grep phase/

# 2. See latest commits on each branch
git log --all --graph --oneline --decorate | head -20

# 3. Check PHASE-STATUS
cat .claude/PHASE-STATUS.json | jq '.branches | map({branch: .status})'

# 4. Check for blockers
grep -r "BLOCKED_BY" .claude/PHASE-STATUS.json
```

---

## ⚠️ PROBLEMA: BRANCH BLOQUEADA (QUE FER)

### Escenario 1: Agent B Espera Fase 1, Però A No Acaba

```
✗ PROBLEMA:
  - Agent A "trabajando" en phase/1 pero sin commits en 4h
  - Agent B no puede empezar phase/2

✓ SOLUCIÓ:
  1. Check A's branch: git log origin/phase/1-database --oneline
  2. Si veus "stale" commits, @mencion A: "Qual és el blocker?"
  3. Si A "atascado":
     a) Offer to pair debug (hop in chat con A)
     b) Si problema es architectural, discute opción alternativa
     c) Document decision en PHASE-STATUS.json
  4. Continue en branch "phase/1-database-v2" si cal (restart)
```

### Escenario 2: Merge Conflict

```
✗ PROBLEMA:
  - Agent B farà merge phase/2-master-ui a main
  - Conflict en components/games/registry.ts (C also editing)

✓ SOLUCIÓ:
  1. Pau: No merge yet
  2. Coordina con C: "Finalizaste games registry?"
  3. Si C no done: espera C merge first (C's change takes priority)
  4. Then B rebasa: git rebase origin/main
  5. Resolve conflicts (B deixes C's registry intact, añades B's stuff)
  6. Force push: git push -f origin phase/2-master-ui
  7. Merge clean
```

### Escenario 3: Agent Wants to Start But Blocker Not Done

```
✗ PROBLEMA:
  - Agent D wants to start phase/4
  - Agent C's phase/3 is 50% done
  - D can't wait anymore

✓ SOLUCIÓ:
  1. Option A: D starts locally (no merge), tests with stubs
     → When C done, D rebasa i integra real code
  2. Option B: Create "phase/3-games-stable" branch with working subset
     → D starts with partial registry, adds games as C delivers
  3. Document en PHASE-STATUS.json: "Phase 4 started with partial phase 3"
```

---

## 📊 WEEKLY REPORT (Friday)

Crea un commit de status update tota setmana:

```bash
# Update PHASE-STATUS.json with current status
git add .claude/PHASE-STATUS.json
git commit -m "docs: week X status update

- Phase 0–1: ✅ COMPLETED
- Phase 2–3: 🔄 IN_PROGRESS (B: 80%, C: 60%)
- Phase 4–5: ⏳ QUEUED (waiting for phase 3)
- Phase 6: ⏳ QUEUED

Blockers: None
Dependencies: On track
Est. completion: Week 4 Friday"
```

Això dóna a tots una visió clara del progress cada setmana.

---

## 🎓 TEMPLATE: CHAT D'AGENT

Si vols comenzar un nou chat con un Agent, usa aquesta template:

```
🎬 AGENT [A/B/C/D] — FASE [X]

📋 TASQUES:
[Copy-paste from AGENT-ROLES.md for your phase]

⏱️ ESTIMACIÓ: [X hores]

📚 DOCS:
- Full plan: docs/PLAN-ESTRATEGIC.md
- Workflow: docs/COORDINACIO-AGENTS.md
- Your role: docs/AGENT-ROLES.md
- Status: .claude/PHASE-STATUS.json

🔗 DEPENDÈNCIES:
- Bloquejat per: [None / phase/X done]
- Unbloqueja: [phase/Y]

✅ SUCCESS CRITERIA:
[From AGENT-ROLES.md]

📞 COMUNICACIÓ:
- Status updates: via TaskUpdate(MASTER_TASK, "...")
- Blockers: mention in chat + update PHASE-STATUS.json
- Questions: ask directly

🚀 COMENÇA:
[Start with first task from your phase]
```

---

## ✅ FINAL CHECKLIST

Before declaring project DONE:

- [ ] All 6 phases merged to main
- [ ] npm run dev works
- [ ] npm run test passes (if tests exist)
- [ ] npm run build succeeds
- [ ] vercel deploy works
- [ ] Mobile tested (iOS Safari + Android Chrome)
- [ ] Audio plays, animations smooth
- [ ] E2E tests pass
- [ ] Performance metrics good (<3s load)
- [ ] WCAG AA contrast OK
- [ ] All QR codes generate/print correctly
- [ ] Scoring logic verified
- [ ] RLS policies tested
- [ ] Master dashboard real-time works
- [ ] Player entry flow tested
- [ ] Full game flow tested end-to-end

---

**Version:** 1.0  
**Data:** 2026-09-16  
**Usage:** Print o guardarla a `.claude/MASTER-CHECKLIST.md`
