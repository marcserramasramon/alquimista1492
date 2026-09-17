# Coartada Testing & Validation Guide — README

## Overview

This directory contains comprehensive testing and validation materials for the **Coartada (Alibi) System** in El Traïdor de la Guixa. The system automatically assigns each team a shared narrative that players must memorize and recite consistently during Act II interrogation.

**Status:** Implementation complete, ready for testing and production fixes  
**Last Updated:** 2026-09-17  
**Test Effort:** 45-90 minutes (depending on depth)

---

## What is the Coartada System?

The coartada is a game mechanic where:
1. **Team gets assigned** a shared story (one of 5 templates: midwife, medicine, rector, lost person, teacher)
2. **Each of 4 players receives** a different part of the story (frase 1-4)
3. **Players memorize** their frase before Act II
4. **Master interrogates** the team, checking consistency
5. **Inconsistent answers** indicate a potential traitor

**Example Team Coartada:**
- Template: "Midwife visit to assist birth"
- Player 1 frase: "I brought fresh water and linens at night"
- Player 2 frase: "The midwife entered when we heard cries from the street"
- Player 3 frase: "I brought cold water and tended the fire all night"
- Player 4 frase: "Neighbors saw us coming and going with white cloth"

---

## Document Guide

### 1. **COARTADA_QUICK_TEST.md** — Start Here ⭐
**Purpose:** 5-minute smoke test to verify basic functionality  
**Audience:** Testers who want a quick validation  
**What it covers:**
- Setup (1 min)
- Player join sequence (4 players)
- Immediate verification (browser + database)
- Success/failure criteria

**When to use:** First-time validation, rapid sanity checks, CI/CD integration

**Time:** 5 minutes

---

### 2. **TESTING_COARTADA_GUIDE.md** — Comprehensive Test Plan
**Purpose:** Complete testing protocol for 4-player teams  
**Audience:** QA engineers, developers doing full validation  
**What it covers:**

| Phase | Focus | Duration |
|-------|-------|----------|
| Phase 1 | Setup & database checks | 10 min |
| Phase 2 | Local dev environment | 5 min |
| Phase 3 | Player joining sequence (all 4 players) | 15 min |
| Phase 4 | Coartada content verification | 10 min |
| Phase 5 | Edge cases & error handling | 15 min |
| Phase 6 | Integration scenarios | 10 min |
| Phase 7 | Database consistency tests | 10 min |
| Phase 8 | Performance & load testing | 15 min |
| Phase 9 | Troubleshooting guide | Reference |
| Phase 10 | Validation checklist | Reference |

**When to use:** Before production deployment, comprehensive validation, regression testing

**Time:** 45-60 minutes (following all phases)

---

### 3. **COARTADA_IMPLEMENTATION_ANALYSIS.md** — Code Review & Findings
**Purpose:** Detailed code analysis, issue identification, recommendations  
**Audience:** Architects, senior developers, tech leads  
**What it covers:**

| Section | Value |
|---------|-------|
| System Architecture | Data flow diagram, key files, status |
| Implementation Strengths | What works well (idempotency, RLS, error handling) |
| Identified Issues | Race conditions, blocking behavior, player limits, etc. |
| Testing Status | Manual test readiness, automated test gaps |
| Database Integrity | Constraints, indexes, performance |
| Security Analysis | Authentication, authorization, input validation |
| Deployment Readiness | Checklist of pre-production items |

**Key Findings:**
- ✅ Idempotency: System correctly prevents duplicate initialization
- ✅ Security: RLS policies enforce team-level isolation
- 🟡 Race conditions: Works in practice, not guaranteed (missing UNIQUE constraint was already added in migration)
- 🟡 Non-blocking init: Could silently fail if network interrupted
- 🟡 5+ players: Behavior undefined in PRD

**When to use:** Before code merge, architecture review, risk assessment

**Time:** 20-30 minutes to read

---

### 4. **COARTADA_FIXES_REQUIRED.md** — Action Items
**Purpose:** Specific fixes to apply before production  
**Audience:** Developers implementing fixes  
**What it covers:**

| Fix | Priority | Effort | Risk |
|-----|----------|--------|------|
| Add UNIQUE constraint | Required | Done | ✅ |
| Make init blocking | HIGH | 5 min | Low |
| Clarify 5+ players | HIGH | 10 min | Low |
| Improve error logging | Optional | 5 min | Very low |

**Implementation roadmap:**
1. Fix 2: Make init-coartada blocking (prevents race conditions)
2. Fix 3: Add player count validation (prevents silent failures)
3. Fix 4: Better error logging (dev experience)

**When to use:** After code review, before production testing

**Time:** 20-25 minutes to implement, 15 minutes to test

---

## Quick Start Paths

### Path 1: 5-Minute Validation (Smoke Test)
```
Start: COARTADA_QUICK_TEST.md
├─ Run browser setup
├─ Join 4 players
├─ Check console logs
└─ Query database
```
**Goal:** Verify system initializes correctly  
**Suitable for:** Quick sanity checks, CI/CD, daily validation

---

### Path 2: Full Testing Before Production (90 minutes)
```
Start: TESTING_COARTADA_GUIDE.md
├─ Phase 1-2: Environment setup (15 min)
├─ Phase 3-4: Player join sequence (25 min)
├─ Phase 5-6: Edge cases (25 min)
├─ Phase 7-8: Database & performance (25 min)
└─ Phase 10: Validation checklist
```
**Goal:** Comprehensive validation of all functionality  
**Suitable for:** Pre-production deployment, regression testing

---

### Path 3: Code Review & Architecture (30 minutes)
```
Start: COARTADA_IMPLEMENTATION_ANALYSIS.md
├─ Strengths section (5 min)
├─ Issues section (10 min)
├─ Recommendations (10 min)
└─ Deployment checklist (5 min)
```
**Goal:** Understand implementation, identify risks  
**Suitable for:** Technical review, architecture decisions

---

### Path 4: Apply Fixes & Validate (45 minutes)
```
Start: COARTADA_FIXES_REQUIRED.md
├─ Fix 2: Blocking init (10 min code + 5 min test)
├─ Fix 3: Player validation (10 min code + 5 min test)
├─ Fix 4: Error logging (5 min code + 2 min test)
└─ Run COARTADA_QUICK_TEST.md to verify
```
**Goal:** Apply all recommended fixes before production  
**Suitable for:** Development iteration, pre-deployment

---

## Key Concepts

### Coartada Templates (5 types)
```
A: Llevadora (Midwife) — Attending birth at home
B: Medicament (Medicine) — Collecting medicine for sick person
C: Rector (Priest) — Notifying rector for last rites visit
D: PersonaPerduda (Lost Person) — Searching for missing uncle
E: Mestre (Teacher) — Running errands for school records
```

### Frase Distribution (4 players = 1 frase each)
```
Player 0 → Frase 1 (1st part of story)
Player 1 → Frase 2 (2nd part of story)
Player 2 → Frase 3 (3rd part of story)
Player 3 → Frase 4 (4th part of story)
```

### Initialization Flow
```
Player 1 joins → init-coartada triggered
  ↓
Check if team has coartada (no)
  ↓
Select random template (A-E)
  ↓
Assign frases to players
  ↓
Insert to database
  ↓
Player 2-4 join → init already exists (409 error, expected)
  ↓
Players can view coartada from game hub
```

### Database Queries
```sql
-- View team's coartada type
SELECT coartada_id FROM team_coartadas WHERE team_id = 'UUID';

-- View player's assigned frase
SELECT frase_number, frase_content FROM player_coartada_frases
WHERE team_id = 'UUID' AND player_index = 0; -- Player 0

-- View all frases for team
SELECT player_index, frase_number, frase_content FROM player_coartada_frases
WHERE team_id = 'UUID' ORDER BY player_index;
```

---

## Critical Dates & Deadlines

| Task | Deadline | Owner | Status |
|------|----------|-------|--------|
| Apply Fixes 2-4 | Before testing | Dev | 🔧 Pending |
| Run Quick Test | Daily CI | QA/Dev | ⏳ Ready |
| Full validation | Before production | QA | ⏳ Ready |
| Performance testing | Before launch | Ops | ⏳ Ready |
| Master integration test | Before Act II | QA | ⏳ Ready |

---

## Success Criteria

### System is Ready When:
- ✅ All 4 players join and receive different frases
- ✅ All frases are from same coartada template
- ✅ Console shows `[COARTADA INIT]` log once per team
- ✅ Database has 1 team_coartadas row + 4 player_coartada_frases rows
- ✅ Players can access coartada from game hub
- ✅ Master can interrogate teams consistently
- ✅ No errors in browser console or server logs
- ✅ Response time < 500ms for initialization

---

## Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| No `[COARTADA INIT]` log | Console not open before join | Reload & open DevTools before joining |
| "Access denied" error | Player tried to view other team's coartada | RLS working correctly; expected behavior |
| 409 Conflict response | 2nd player triggered init | Expected; skip error handling for 2nd+ players |
| Players see same frase | Data corruption | Clear test data & retry initialization |
| 5th player gets error | Player limit validation | Expected with Fix 3; max 4 players |
| Slow join (2+ seconds) | Init blocking after Fix 2 | Normal; initialization takes 100-300ms |

---

## System Architecture Quick Reference

```
Client (Browser)                 Server (Next.js)              Database (Supabase)
─────────────────────────────────────────────────────────────────────────────
Player joins e/[code]
    │
    ├─→ PlayerNameInput
    │       │
    │       └─→ POST /api/auth/signin
    │               ├─→ Validate team code
    │               ├─→ Create player record
    │               └─→ Return teamId + auth token
    │
    ├─→ setSession() [auth]
    │
    ├─→ fetch init-coartada (non-blocking)
    │       │
    │       └─→ POST /api/game/init-coartada
    │               ├─→ Check team exists         → teams table
    │               ├─→ Check no coartada exists  → team_coartadas table
    │               ├─→ Get players in team       → players table
    │               ├─→ Select random template    → COARTADAS const
    │               ├─→ Insert team coartada      ← team_coartadas table
    │               └─→ Insert frases             ← player_coartada_frases table
    │
    ├─→ router.push('/joc')
    │       │
    │       └─→ Game Hub
    │           │
    │           ├─→ GET /api/game/coartada
    │           │       └─→ Return player's frase
    │           │           (RLS enforces: only own team)
    │           │
    │           └─→ Display "Salconduit" (pass/coartada)
    │               └─→ Players memorize frases
```

---

## File Structure

```
docs/
├── TESTING_COARTADA_GUIDE.md          ← Full test plan (45-60 min)
├── COARTADA_QUICK_TEST.md              ← Quick validation (5 min)
├── COARTADA_IMPLEMENTATION_ANALYSIS.md ← Code review (20-30 min)
├── COARTADA_FIXES_REQUIRED.md          ← Implementation guide (20-25 min)
└── COARTADA_TESTING_README.md          ← This file

app/api/game/
├── init-coartada/
│   └── route.ts                        ← Initialization endpoint
└── coartada/
    └── route.ts                        ← Retrieval endpoint

lib/coartada/
└── initializeCoartada.ts               ← Assignment logic

content/private/
└── coartadas.ts                        ← Coartada templates (5 types)

supabase/migrations/
└── 20260917000006_add_coartadas.sql   ← Database schema + RLS
```

---

## Support & Escalation

### If you encounter issues:

1. **Check TESTING_COARTADA_GUIDE.md Phase 9** (Troubleshooting)
2. **Review COARTADA_IMPLEMENTATION_ANALYSIS.md** (Known issues)
3. **Verify database state** using provided SQL queries
4. **Check server logs** in terminal for error messages
5. **Clear test data** (DELETE queries provided)
6. **Escalate** if issue not in these docs

### Questions about:
- **PRD/Design:** See `docs/PRD.md` secção "Coartada"
- **Gameplay:** See `docs/historia.md` (trama, interrogation scene)
- **Implementation:** See `COARTADA_IMPLEMENTATION_ANALYSIS.md`
- **Testing:** See `TESTING_COARTADA_GUIDE.md`
- **Fixes:** See `COARTADA_FIXES_REQUIRED.md`

---

## Performance Expectations

| Operation | Typical | Acceptable | Warning |
|-----------|---------|-----------|---------|
| Init coartada (1st player) | 150ms | <500ms | >1s |
| Get coartada frase | 50ms | <200ms | >500ms |
| Player join (total) | 300ms | <1s | >2s |
| Database query | 10-50ms | <100ms | >200ms |

---

## Deployment Checklist

Before deploying to production:

- [ ] Apply Fix 2 (blocking init) — 5 min
- [ ] Apply Fix 3 (player validation) — 10 min
- [ ] Run COARTADA_QUICK_TEST.md — 5 min ✅
- [ ] Run TESTING_COARTADA_GUIDE.md Phase 1-4 — 30 min
- [ ] Run TESTING_COARTADA_GUIDE.md Phase 7 (RLS validation) — 10 min
- [ ] Verify master can see all teams' coartadas
- [ ] Test interrogation scenario end-to-end
- [ ] Load test with expected player count
- [ ] Check error messages are in Catalan
- [ ] Verify database backups before go-live

---

## Next Steps

1. **Immediate:** Read COARTADA_QUICK_TEST.md (5 min)
2. **This cycle:** Apply fixes from COARTADA_FIXES_REQUIRED.md (25 min)
3. **Before production:** Run full test suite from TESTING_COARTADA_GUIDE.md (60 min)
4. **Go-live:** Execute deployment checklist above

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-17 | Initial testing guide + implementation analysis |

---

**Document created:** 2026-09-17  
**Status:** Ready for testing  
**Confidence level:** High (code review complete, ready for manual validation)

For questions or updates, refer to the specific document relevant to your task.
