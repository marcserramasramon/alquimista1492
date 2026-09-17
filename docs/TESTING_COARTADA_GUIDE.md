# Coartada Initialization Testing & Validation Guide

## Overview

The coartada (alias/alibi) system in El Traïdor de la Guixa assigns each team a shared narrative covering their whereabouts during the crucial night. Each of the 4 players receives a different frase (phrase) from the same coartada that they must memorize and recite consistently during Act II interrogation.

**System Components:**
- 5 coartada templates (A-E): llevadora, medicament, rector, personaPerduda, mestre
- Each template has exactly 4 frases
- Frases are distributed cyclically among players (1 per player for 4-player teams)
- Initialization happens automatically when the first player joins
- Database tables: `team_coartadas`, `player_coartada_frases`

---

## Phase 1: Setup & Prerequisites

### 1.1 Environment Check

```bash
# Verify Next.js version supports App Router
node -v      # Recommended: v18+
npm -v       # Recommended: v9+

# Confirm all dependencies are installed
npm list @supabase/ssr jose zod

# Check environment variables are loaded
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

### 1.2 Database Verification

Before testing, ensure both tables exist and RLS policies are active:

```sql
-- Connect to Supabase SQL Editor and run:

-- Check team_coartadas table
SELECT * FROM team_coartadas LIMIT 1;

-- Check player_coartada_frases table
SELECT * FROM player_coartada_frases LIMIT 1;

-- Verify RLS is enabled
SELECT tablename, row_security FROM pg_tables 
WHERE tablename IN ('team_coartadas', 'player_coartada_frases');
```

**Expected Output:**
```
 tablename                 | row_security
---------------------------+--------------
 team_coartadas            | t
 player_coartada_frases    | t
```

### 1.3 Clean Test State

Before each full test cycle, clear test data:

```sql
-- Delete test team data (careful: this removes everything for the team)
DELETE FROM player_coartada_frases WHERE team_id IN (
  SELECT id FROM teams WHERE code = 'TEST'
);
DELETE FROM team_coartadas WHERE team_id IN (
  SELECT id FROM teams WHERE code = 'TEST'
);
DELETE FROM players WHERE team_id IN (
  SELECT id FROM teams WHERE code = 'TEST'
);
DELETE FROM teams WHERE code = 'TEST';
```

---

## Phase 2: Local Development Setup

### 2.1 Start Development Server

```bash
cd C:\Users\mini-\Downloads\Scaperoom

# Install dependencies if needed
npm install

# Start dev server (should output: ▲ Next.js 15.x.x)
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.1.3
- Local:        http://localhost:3000
- Environments: .env.local

Ready in 1.23s
```

### 2.2 Open Browser & Prepare Consoles

1. **Primary Browser (Player 1):** Open http://localhost:3000/e/TEST
   - Open DevTools (F12) → Console tab
   - Keep visible for `[COARTADA INIT]` log

2. **Secondary Browsers (Players 2-4):** Three additional browser windows/tabs/incognito
   - Each should navigate to http://localhost:3000/e/TEST
   - Open DevTools for each to monitor logs

**Tip:** Use Chrome's User Profiles or separate browsers (Edge, Firefox, Brave) to avoid auth conflicts

---

## Phase 3: Player Joining Sequence

### 3.1 Player 1 Joins (First Player - Triggers Initialization)

**Steps:**
1. In primary browser at http://localhost:3000/e/TEST
2. Enter name: "Jugador1"
3. Click "Unir-se a l'equip"
4. Wait 2-3 seconds

**Expected Behavior:**

**Browser Console (Primary):**
```
[COARTADA INIT] {
  success: true,
  coartadaType: "llevadora" | "medicament" | "rector" | "personaPerduda" | "mestre",
  playersAssigned: 1
}
```

**Server Log (Terminal):**
```
Selected coartada: A (type: llevadora)
Team has 1 players
Frase assignments: [ { playerIndex: 0, fraseIndex: 0 } ]
Saved team_coartadas entry for team {UUID}
Saved 1 frase assignments for team {UUID}
```

**Database State After Player 1:**
```sql
-- Query to verify
SELECT * FROM team_coartadas WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST');
SELECT player_index, frase_number FROM player_coartada_frases 
  WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST')
  ORDER BY player_index;
```

**Expected Result:**
- 1 row in `team_coartadas` with `coartada_id = 'A'` (or B/C/D/E)
- 1 row in `player_coartada_frases`: `player_index=0, frase_number=1`

---

### 3.2 Player 2 Joins (Second Player)

**Steps:**
1. In second browser at http://localhost:3000/e/TEST
2. Enter name: "Jugador2"
3. Click "Unir-se a l'equip"
4. Wait 2-3 seconds

**Expected Behavior:**

**Browser Console (Secondary):**
```
[COARTADA INIT] {
  success: true,
  coartadaType: "llevadora" | "medicament" | ...,
  playersAssigned: 2
}
```

**Server Log:**
```
Team has 2 players
Frase assignments: [
  { playerIndex: 0, fraseIndex: 0 },
  { playerIndex: 1, fraseIndex: 1 }
]
Saved 2 frase assignments for team {UUID}
```

**Database State After Player 2:**
```sql
SELECT player_index, frase_number FROM player_coartada_frases 
  WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST')
  ORDER BY player_index;
```

**Expected Result:**
- 2 rows: `(player_index=0, frase_number=1)` and `(player_index=1, frase_number=2)`

---

### 3.3 Player 3 Joins (Third Player)

**Steps:**
1. In third browser at http://localhost:3000/e/TEST
2. Enter name: "Jugador3"
3. Click "Unir-se a l'equip"
4. Wait 2-3 seconds

**Expected Behavior:**

**Browser Console:**
```
[COARTADA INIT] {
  success: true,
  coartadaType: "...",
  playersAssigned: 3
}
```

**Database State After Player 3:**
- 3 rows: `(0,1), (1,2), (2,3)`

---

### 3.4 Player 4 Joins (Fourth & Final Player)

**Steps:**
1. In fourth browser at http://localhost:3000/e/TEST
2. Enter name: "Jugador4"
3. Click "Unir-se a l'equip"
4. Wait 2-3 seconds

**Expected Behavior:**

**Browser Console:**
```
[COARTADA INIT] {
  success: true,
  coartadaType: "llevadora" | "medicament" | "rector" | "personaPerduda" | "mestre",
  playersAssigned: 4
}
```

**Database State After Player 4:**
```sql
SELECT player_index, frase_number, LEFT(frase_content, 50) as preview 
  FROM player_coartada_frases 
  WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST')
  ORDER BY player_index;
```

**Expected Result:**
```
 player_index | frase_number | preview
--------------+--------------+--------------------------------
 0            | 1            | En Josep va portar aiguardent...
 1            | 2            | La matrona Miquel va entrar...
 2            | 3            | En Ricard va estar tota la...
 3            | 4            | Els veïns propers juren que...
```

---

## Phase 4: Coartada Content Verification

### 4.1 Verify All Players See Different Frases

After all 4 players have joined, check that each player sees their assigned frase:

**Test Endpoint:** GET `/api/game/coartada?teamId={teamId}`

**Steps:**
1. For each player (in browser DevTools Console):
   ```javascript
   // Copy and run in each browser's console
   const teamId = localStorage.getItem('teamId') || 'TEST';
   fetch(`/api/game/coartada?teamId=${teamId}`)
     .then(r => r.json())
     .then(data => console.log('Player Coartada:', data))
   ```

2. Alternative: Query Supabase directly in SQL Editor
   ```sql
   SELECT 
     p.player_index,
     p.user_id,
     f.frase_number,
     f.frase_content
   FROM player_coartada_frases f
   JOIN players p ON p.player_index = f.player_index AND p.team_id = f.team_id
   WHERE f.team_id = (SELECT id FROM teams WHERE code = 'TEST')
   ORDER BY p.player_index;
   ```

**Verification Checklist:**
- [ ] Player 0 sees frase #1 (starts with "En Josep va portar..." or equivalent for chosen coartada)
- [ ] Player 1 sees frase #2
- [ ] Player 2 sees frase #3
- [ ] Player 3 sees frase #4
- [ ] All 4 frases are from the **same** coartada (e.g., all from template A)
- [ ] No duplicate frases for the same team
- [ ] Frase topics align (if template A = llevadora, all about midwife attendance)

---

### 4.2 Verify Coartada Types Distribution

Run this test multiple times to verify all 5 coartada types can be assigned:

**Steps:**
1. Create 5 test teams with codes: TEST1, TEST2, TEST3, TEST4, TEST5
2. Have 1 player join each team
3. Check assigned coartada types:

```sql
SELECT 
  t.code,
  tc.coartada_id,
  CASE 
    WHEN tc.coartada_id = 'A' THEN 'llevadora'
    WHEN tc.coartada_id = 'B' THEN 'medicament'
    WHEN tc.coartada_id = 'C' THEN 'rector'
    WHEN tc.coartada_id = 'D' THEN 'personaPerduda'
    WHEN tc.coartada_id = 'E' THEN 'mestre'
  END as type
FROM team_coartadas tc
JOIN teams t ON tc.team_id = t.id
WHERE t.code IN ('TEST1', 'TEST2', 'TEST3', 'TEST4', 'TEST5')
ORDER BY t.code;
```

**Expected Result:** Over multiple test runs, all types (A, B, C, D, E) should appear randomly.

---

## Phase 5: Edge Cases & Error Handling

### 5.1 Re-Joining Players (Idempotency Test)

**Scenario:** Player already in team tries to join again with different name

**Steps:**
1. Player 1 joins team TEST as "Jugador1"
2. Wait for initialization complete
3. In same browser, try to join TEST again as "Jugador1b"

**Expected Behavior:**
- Should either redirect to hub or show "Already joined" error
- **No second initialization** should occur
- Database should still have only 1 player_coartada_frases row per team initially

**Verification:**
```sql
-- Count should be 1 if test passed
SELECT COUNT(*) FROM player_coartada_frases 
WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST');
```

---

### 5.2 Concurrent Player Joins

**Scenario:** Multiple players try to join simultaneously

**Steps:**
1. Have all 4 players open http://localhost:3000/e/TEST simultaneously
2. All enter names and click "Unir-se" within 1 second of each other

**Expected Behavior:**
- Initialization should trigger only once
- All 4 players should eventually see frases 1-4
- Server logs should show single initialization, not multiple

**Verification:**
```sql
-- Count team_coartadas rows (should be 1, not duplicates)
SELECT COUNT(*) FROM team_coartadas 
WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST');
-- Expected: 1

-- Count player rows (should be 4)
SELECT COUNT(*) FROM players 
WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST');
-- Expected: 4
```

---

### 5.3 Rate Limiting & Duplicate Calls

**Scenario:** `init-coartada` endpoint called multiple times for same team

**Steps:**
1. Player 1 joins, initialization completes
2. Player 2 joins, tries to initialize again via:
   ```bash
   curl -X POST http://localhost:3000/api/game/init-coartada \
     -H "Content-Type: application/json" \
     -d '{"teamId": "TEST-TEAM-UUID"}'
   ```

**Expected Behavior:**
- Second call returns **409 Conflict**: `"Coartada already assigned for this team"`
- No duplicate entries in `team_coartadas`
- No additional rows in `player_coartada_frases`

**Verification:**
```sql
SELECT COUNT(*) FROM team_coartadas 
WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST');
-- Expected: 1 (not 2)
```

---

## Phase 6: Integration Scenarios

### 6.1 Full Game Flow with Coartada

**Scenario:** Players join, see coartada, play through game, interrogation phase

**Steps:**
1. 4 players join team TEST
2. All reach game hub
3. Navigate to "Salconduit" (pass/coartada view)
4. Each player views their assigned frase
5. Master asks questions during interrogation
6. Verify consistency

**Verification Checklist:**
- [ ] Players can access coartada from game hub
- [ ] API returns correct frase per player
- [ ] Frase display is readable and prominent
- [ ] Players can memorize before interrogation

---

### 6.2 Team Persistence Across Sessions

**Scenario:** Player leaves and rejoins same team

**Steps:**
1. 4 players join TEST team
2. Player 1 closes browser/logs out
3. Player 1 rejoins with code TEST
4. Verify Player 1 still has same frase assignment

**Expected Behavior:**
- Player 1 should authenticate with new session
- Old session data should remain intact
- Frase assignment should not change
- No new initialization should occur

**Verification:**
```sql
-- Check that frases haven't changed
SELECT COUNT(*) FROM player_coartada_frases 
WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST') 
AND frase_number = 1;  -- Player 0 should still have frase 1
-- Expected: 1
```

---

## Phase 7: Database Consistency Tests

### 7.1 RLS Policy Validation

**Scenario:** Verify only authorized users see coartada data

**Steps:**
1. Player 1 joins TEST team
2. Player 2 joins different team PROD
3. From Player 1's session, try to query Player 2's team coartada:
   ```bash
   # This should be blocked by RLS
   curl "http://localhost:3000/api/game/coartada?teamId=PROD-UUID"
   ```

**Expected Behavior:**
- Player 1 gets **403 Forbidden**: `"Access denied: player does not belong to this team"`
- No data leaks from other teams

---

### 7.2 Orphaned Records

**Scenario:** Check for data integrity if team is deleted

**Steps:**
1. Create TEST team with 4 players and coartadas
2. Delete team via master panel
3. Query for orphaned records:

```sql
-- Check for orphaned coartada records
SELECT * FROM team_coartadas 
WHERE team_id NOT IN (SELECT id FROM teams);
-- Expected: 0 rows (cascade delete should remove them)

SELECT * FROM player_coartada_frases 
WHERE team_id NOT IN (SELECT id FROM teams);
-- Expected: 0 rows
```

**Expected Behavior:**
- ON DELETE CASCADE should remove all related records
- No orphaned entries

---

## Phase 8: Performance & Load Testing

### 8.1 Initialization Performance

**Scenario:** Measure API response time for initialization

**Steps:**
1. Create fresh team TEST
2. Time the initialization request:
   ```bash
   time curl -X POST http://localhost:3000/api/game/init-coartada \
     -H "Content-Type: application/json" \
     -d '{"teamId": "..."}'
   ```

**Expected Performance:**
- Response time: **< 500ms** (typical: 100-300ms)
- CPU usage: Minimal spike
- Database queries: 6-7 queries (fetch team, check existing, select coartada, insert team_coartadas, insert player_coartada_frases)

---

### 8.2 Large Team Handling (5+ Players)

**Scenario:** Verify system works beyond 4-player design

**Steps:**
1. Create team with 5 players
2. Verify frase distribution cycles correctly:

```sql
SELECT player_index, frase_number FROM player_coartada_frases 
WHERE team_id = (SELECT id FROM teams WHERE code = 'LARGE')
ORDER BY player_index;
```

**Expected Result:**
```
 player_index | frase_number
--------------+--------------
 0            | 1
 1            | 2
 2            | 3
 3            | 4
 4            | 1  (cycles back)
```

---

## Phase 9: Troubleshooting Guide

### Issue: `[COARTADA INIT ERROR] 401 Unauthorized`

**Cause:** Player not authenticated
**Solution:**
1. Verify `/api/auth/signin` succeeded
2. Check auth token in localStorage
3. Ensure `supabase.auth.getUser()` works

**Test:**
```javascript
// In browser console
const { data } = await supabase.auth.getUser();
console.log('Current user:', data);
```

---

### Issue: `[COARTADA INIT ERROR] Team not found`

**Cause:** Invalid team UUID or team doesn't exist
**Solution:**
1. Verify team code exists and was created before player join
2. Check team UUID in request vs. database

**Test:**
```sql
SELECT id, code FROM teams WHERE code = 'TEST';
```

---

### Issue: `Coartada already assigned for this team` (409)

**Cause:** Initialization called twice
**Solution:**
1. This is expected behavior (prevents duplicates)
2. Check that usePlayerSignIn is not calling init-coartada multiple times
3. Verify fetch in useSignIn.ts lines 65-77 completes successfully

---

### Issue: Players See Different Coartadas (Wrong Data)

**Cause:** Data corruption or RLS policy failure
**Solution:**
1. Verify all frases come from same template (A/B/C/D/E)
2. Check RLS policies are enabled:
   ```sql
   SELECT tablename, row_security FROM pg_tables 
   WHERE tablename = 'player_coartada_frases';
   ```
3. Clear test data and retry initialization

---

### Issue: No Browser Console Log

**Cause:** 
- Console.log may not display
- Fetch call may be silently failing
- Browser console not open

**Solution:**
1. Make sure DevTools Console tab is open **before** player joins
2. Check Network tab for `/api/game/init-coartada` request:
   - Should see POST request
   - Status should be 200 OK
   - Response shows `{"success": true, ...}`
3. If missing, add explicit error handler:
   ```javascript
   // Add to useSignIn.ts for better debugging
   .catch(err => {
     console.error('[COARTADA INIT ERROR] DETAILED:', err);
     throw err;
   })
   ```

---

## Phase 10: Validation Checklist

### Core Requirements
- [ ] System initializes exactly once per team
- [ ] All 4 players receive different frases from same coartada
- [ ] Frases are numbered 1-4 consistently
- [ ] Database queries work with RLS enabled
- [ ] No data leaks between teams
- [ ] Initialization completes in < 500ms

### Coartada Content
- [ ] Coartada type assigned correctly (A/B/C/D/E)
- [ ] All frases are valid Catalan text
- [ ] Frases relate to assigned coartada template
- [ ] No missing or corrupted frases

### API Functionality
- [ ] POST `/api/game/init-coartada` returns 200 OK
- [ ] GET `/api/game/coartada` returns player's frase only
- [ ] 409 response on duplicate initialization attempt
- [ ] 403 response on unauthorized team access

### Player Experience
- [ ] No browser errors in console
- [ ] Navigation to game hub succeeds after join
- [ ] Coartada accessible from game interface
- [ ] Frase text is readable (font size, contrast)

### Database State
- [ ] `team_coartadas` has 1 row per team
- [ ] `player_coartada_frases` has 4 rows per team (4 players)
- [ ] All timestamps are valid
- [ ] No orphaned records after team deletion

---

## Final Validation Script

Run this SQL after completing all tests to ensure data consistency:

```sql
-- Comprehensive coartada validation
WITH team_check AS (
  SELECT 
    t.id,
    t.code,
    tc.coartada_id,
    COUNT(DISTINCT p.id) as player_count,
    COUNT(DISTINCT pcf.id) as frase_count
  FROM teams t
  LEFT JOIN team_coartadas tc ON t.id = tc.team_id
  LEFT JOIN players p ON t.id = p.team_id
  LEFT JOIN player_coartada_frases pcf ON t.id = pcf.team_id
  WHERE t.code LIKE 'TEST%'
  GROUP BY t.id, t.code, tc.coartada_id
)
SELECT 
  code,
  coartada_id,
  player_count,
  frase_count,
  CASE 
    WHEN player_count = frase_count THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM team_check
ORDER BY code;
```

**Expected Output:** All teams with code `TEST%` should show `status = 'OK'` and matching player/frase counts.

---

## Success Criteria

✅ **Test Passed If:**
1. All 4 players join successfully
2. Console shows `[COARTADA INIT]` log once per team
3. Each player has exactly 1 frase assigned
4. All 4 frases are from same coartada template
5. Database queries return correct data per team
6. No errors in browser console or server logs
7. RLS policies prevent unauthorized access
8. Initialization takes < 500ms

❌ **Test Failed If:**
1. Multiple initialization logs appear
2. Players get frases from different templates
3. Duplicate frases assigned to same player
4. RLS policies allow cross-team access
5. Errors appear in console or logs
6. Database records are orphaned or corrupted

---

## Appendix: Quick Test Commands

### Quick Smoke Test (5 minutes)

```bash
# 1. Start server
npm run dev

# 2. In browser (4 tabs)
# Tab 1-4: http://localhost:3000/e/TEST

# 3. Each enters name and joins
# "Jugador1", "Jugador2", "Jugador3", "Jugador4"

# 4. Check console logs for [COARTADA INIT]

# 5. Verify in Supabase SQL:
SELECT player_index, frase_number FROM player_coartada_frases 
WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST');

# Expected: 4 rows with (0,1), (1,2), (2,3), (3,4)
```

### Full Validation (15 minutes)

Follow Phase 2-6 completely, including:
- Single player initialization
- Multi-player sequential joins
- Coartada content verification
- Error case handling
- RLS validation

### Load Test (30 minutes)

Run Phase 8 tests with varying team sizes (2, 3, 4, 5+ players) and measure:
- Database response times
- API throughput
- Data consistency under load
- Memory usage

---

## Report Issues

If tests fail, document:

1. **Issue:** What failed?
2. **Steps to reproduce:** Exact sequence
3. **Expected vs. Actual:** What should happen vs. what did
4. **Logs:** Console errors, server logs, database state
5. **Environment:** OS, Node version, Supabase region
6. **Screenshot/Video:** If applicable

Example format:
```
**Issue:** Players see different coartada types

**Steps:**
1. Create team TEST
2. 4 players join sequentially
3. Check player_coartada_frases

**Expected:**
All frases from template A (type: llevadora)

**Actual:**
Player 1 frase from template A
Player 2 frase from template B
Player 3 frase from template C
Player 4 frase from template D

**Logs:**
[Server] Selected coartada: A...
[DB Query] Shows frases from multiple templates

**Environment:**
OS: Windows 11
Node: v18.17.0
Supabase Region: eu-west-1
```
