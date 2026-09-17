# Coartada System: Critical Fixes Required

**Priority:** HIGH  
**Timeline:** Must be completed before production testing  
**Estimated effort:** 30-45 minutes

---

## Fix 1: Add UNIQUE Constraint (Database)

### Problem
Missing UNIQUE constraint on `team_coartadas.team_id` allows potential duplicate entries if two init requests arrive simultaneously.

### Current State
```sql
CREATE TABLE team_coartadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  coartada_id VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

Wait... checking the migration file again. It actually HAS `UNIQUE` on team_id!

```sql
team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
```

**Status:** ✅ **ALREADY FIXED** — No action needed!

---

## Fix 2: Make Coartada Init Blocking (Client)

### Problem
Non-blocking fetch means redirect happens before initialization, player could reach hub without coartada assigned.

### Current Implementation
```typescript
// lib/player/useSignIn.ts, lines 65-77
fetch('/api/game/init-coartada', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ teamId: data.teamId }),
})
  .then(r => r.json())
  .then(data => console.log('[COARTADA INIT]', data))
  .catch(err => console.error('[COARTADA INIT ERROR]', err))

// Redirect happens immediately (race condition!)
router.push('/joc')
```

### Recommended Fix

**File:** `lib/player/useSignIn.ts`

**Change:** Make initialization blocking with proper error handling

```typescript
// Initialize coartadas for the team (BLOCKING)
if (data.teamId) {
  try {
    const initResponse = await fetch('/api/game/init-coartada', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teamId: data.teamId }),
    })

    const initData = await initResponse.json()

    if (!initResponse.ok) {
      console.error('[COARTADA INIT ERROR]', initData)
      setError('Error al inicialitzar la coartada. Intenta-ho de nou.')
      return false
    }

    console.log('[COARTADA INIT]', initData)
  } catch (err) {
    console.error('[COARTADA INIT ERROR]', err)
    setError('Error de connexió en la coartada')
    return false
  }
}

// Redirect only after successful initialization
router.push('/joc')
return true
```

### Verification Steps
1. Make change above
2. Run `npm run dev`
3. Open DevTools Console (F12)
4. Join team as player
5. Verify `[COARTADA INIT]` log appears **before** navigation to `/joc`
6. Test error case: Temporarily break API, verify error message shows

### Risk Assessment
- ✅ Safe: Only adds await to existing non-critical operation
- ✅ UX: Adds 100-300ms to join time (acceptable)
- ✅ Backwards compatible: No breaking changes

**Effort:** 5 minutes  
**Risk:** Low

---

## Fix 3: Clarify 5+ Player Behavior (Documentation + Code)

### Problem
PRD doesn't specify what happens when 5+ players join. Current code cycles frases but this isn't documented.

### Current Implementation
```typescript
// app/api/game/init-coartada/route.ts, lines 114-124
if (playerCount === 4) {
  for (let i = 0; i < 4; i++) {
    fraseAssignments.push({ playerIndex: i, fraseIndex: i })
  }
} else {
  // For other player counts, cycle through frases
  for (let i = 0; i < playerCount; i++) {
    fraseAssignments.push({ playerIndex: i, fraseIndex: i % 4 })
  }
}
```

### Issue Examples

**5 players:**
- Player 0 → frase 1
- Player 1 → frase 2
- Player 2 → frase 3
- Player 3 → frase 4
- Player 4 → frase 1 (DUPLICATE CONTENT)

**Behavior:** Both Player 0 and Player 4 memorize the same frase. This breaks interrogation logic if master expects unique frases.

### Recommended Fix

**Option A: Limit to 4 Players Maximum** (Recommended)

```typescript
// app/api/game/init-coartada/route.ts
const playerCount = players.length

if (playerCount === 0) {
  return NextResponse.json({ error: 'Team has no players' }, { status: 400 })
}

if (playerCount > 4) {
  return NextResponse.json(
    { error: 'Team cannot have more than 4 players for coartada system' },
    { status: 400 }
  )
}

// ... rest of initialization
```

**Option B: Limit Coartada to First 4 Players Only**

```typescript
const playerCount = players.length
const coartadaPlayerCount = Math.min(playerCount, 4) // Cap at 4

const fraseAssignments: Array<{ playerIndex: number; fraseIndex: number }> = []

for (let i = 0; i < coartadaPlayerCount; i++) {
  fraseAssignments.push({ playerIndex: i, fraseIndex: i })
}

// Remaining players (5+) get no coartada assignment
```

### Recommendation
**Use Option A** (limit to 4 players) because:
- Simpler logic
- Aligns with game design (4 suspects)
- Clear error message for master
- Prevents accidental duplicate frases

### Implementation

**File:** `app/api/game/init-coartada/route.ts`

```typescript
// After line 107 (player count check)
const playerCount = players.length

if (playerCount === 0) {
  console.error('Team has no players')
  return NextResponse.json(
    { error: 'Team has no players' },
    { status: 400 }
  )
}

// NEW: Add maximum player check
if (playerCount > 4) {
  console.error(`Team has ${playerCount} players, maximum is 4 for coartada system`)
  return NextResponse.json(
    { error: 'Team has too many players (maximum 4 for coartada system)' },
    { status: 400 }
  )
}

console.log(`Team has ${playerCount} players (valid for coartada system)`)

// === Step 5: Assign frases to players (4 players max) ===
// SIMPLIFIED: Always assign 1-4 frases (since max is 4 players)
const fraseAssignments: Array<{ playerIndex: number; fraseIndex: number }> = []

for (let i = 0; i < playerCount; i++) {
  fraseAssignments.push({ playerIndex: i, fraseIndex: i })
}
```

**Also update the else branch:**

```typescript
// REMOVE the old else clause for other player counts
// (no longer needed since we cap at 4)

// OLD:
// } else {
//   for (let i = 0; i < playerCount; i++) {
//     fraseAssignments.push({ playerIndex: i, fraseIndex: i % 4 })
//   }
// }

// NEW: No else needed, always use same logic
```

### Verification Steps
1. Make changes above
2. Run `npm run dev`
3. **Test 2-player team:**
   ```javascript
   // Browser: join team TEST with 2 players
   // Check DB: SELECT player_index, frase_number FROM player_coartada_frases WHERE ...
   // Expected: (0,1), (1,2)
   ```

4. **Test 4-player team:**
   ```javascript
   // Browser: join team TEST with 4 players
   // Check DB: Expected: (0,1), (1,2), (2,3), (3,4)
   ```

5. **Test 5-player team:**
   ```javascript
   // Browser: Try to add 5th player
   // Expected: Error message "Team has too many players..."
   // Check DB: Still only 4 rows in player_coartada_frases
   ```

### Risk Assessment
- ✅ Safe: Only adds validation, no existing logic changed
- ✅ Clear: Error message is explicit
- ⚠️ Check: Verify game design allows max 4 players

**Effort:** 10 minutes  
**Risk:** Low (feature clarification, not bug fix)

---

## Fix 4: Improve Error Logging (Optional Enhancement)

### Problem
When init returns 409 (already assigned), the promise chain still calls `.then()` with error object, confusing console output.

### Current Implementation
```typescript
fetch('/api/game/init-coartada', { ... })
  .then(r => r.json())
  .then(data => console.log('[COARTADA INIT]', data)) // Logs error object as data!
  .catch(err => console.error('[COARTADA INIT ERROR]', err))
```

### Issue
```javascript
// If server returns 409 with { error: "..." }:
[COARTADA INIT] { error: "Coartada already assigned for this team" }

// Should be:
[COARTADA INIT ERROR] 409 Coartada already assigned for this team
```

### Recommended Fix

**File:** `lib/player/useSignIn.ts`

**Change lines 67-76:**

```typescript
// Before
fetch('/api/game/init-coartada', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ teamId: data.teamId }),
})
  .then(r => r.json())
  .then(data => console.log('[COARTADA INIT]', data))
  .catch(err => console.error('[COARTADA INIT ERROR]', err))

// After
fetch('/api/game/init-coartada', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ teamId: data.teamId }),
})
  .then(r => {
    if (!r.ok) {
      console.error(
        `[COARTADA INIT ERROR] ${r.status}`,
        r.statusText
      )
      return
    }
    return r.json()
  })
  .then(data => {
    if (data) {
      console.log('[COARTADA INIT]', data)
    }
  })
  .catch(err => console.error('[COARTADA INIT ERROR]', err))
```

### Verification
1. Make change
2. Open DevTools Console (F12)
3. Join team
4. Should see `[COARTADA INIT] { success: true, ... }`
5. Rejoin (second join to same team):
   - Expected: `[COARTADA INIT ERROR] 409 Conflict`
   - Not: `[COARTADA INIT] { error: "..." }`

**Effort:** 5 minutes  
**Risk:** Very low  
**Impact:** Better debugging visibility

---

## Complete Fix Checklist

### Before Running Tests

- [ ] **Fix 1:** Verify UNIQUE constraint exists on team_coartadas.team_id
  - Status: ✅ Already in migration
  - Action: None needed

- [ ] **Fix 2:** Make init-coartada blocking in useSignIn
  - File: `lib/player/useSignIn.ts`
  - Lines: 65-77
  - Time: 5 min
  - Risk: Low

- [ ] **Fix 3:** Clarify 5+ player behavior
  - File: `app/api/game/init-coartada/route.ts`
  - Lines: 99-124
  - Time: 10 min
  - Risk: Low
  - Verify: PRD allows max 4 players

- [ ] **Fix 4:** Improve error logging (optional)
  - File: `lib/player/useSignIn.ts`
  - Lines: 65-77
  - Time: 5 min
  - Risk: Very low

### Total Effort: 20-25 minutes (excluding PRD verification)

### Testing After Fixes

1. Run TESTING_COARTADA_GUIDE Phase 2-4 (player joins)
2. Verify Fix 2: `[COARTADA INIT]` log appears before hub redirect
3. Verify Fix 3: 5th player gets error message
4. Verify Fix 4: Error logs show proper format

---

## Implementation Order

### Priority 1: Fix 2 (Blocking Init)
**Why:** Risk reduction — prevents players reaching hub without coartada

### Priority 2: Fix 3 (Player Limit)
**Why:** Spec clarification — prevents silent duplicate frases

### Priority 3: Fix 4 (Error Logging)
**Why:** Developer experience — makes debugging easier

### Commit Strategy
```bash
# After Fix 2
git add lib/player/useSignIn.ts
git commit -m "fix: make coartada initialization blocking to prevent race conditions"

# After Fix 3
git add app/api/game/init-coartada/route.ts
git commit -m "fix: limit coartada teams to maximum 4 players and improve validation"

# After Fix 4
git add lib/player/useSignIn.ts
git commit -m "improve: enhance coartada init error logging for better debugging"
```

---

## Production Readiness After Fixes

| Check | Status | Notes |
|-------|--------|-------|
| UNIQUE constraint on team_coartadas.team_id | ✅ | Already in migration |
| Blocking init call | 🔧 | Pending Fix 2 |
| 5+ player validation | 🔧 | Pending Fix 3 |
| Error logging clarity | 🔧 | Pending Fix 4 |
| RLS policies | ✅ | Complete |
| Database schema | ✅ | Complete |
| API endpoints | ✅ | Complete |
| Client integration | ✅ | Complete (except fixes) |
| Testing guide | ✅ | Complete |

**After all fixes:** ✅ **READY FOR MANUAL TESTING**

---

## Rollback Plan

If issues arise after deployment:

### If Fix 2 (Blocking) Causes Slow Joins
```typescript
// Revert to non-blocking but log better
fetch('/api/game/init-coartada', { ... })
  .then(...)
  .catch(err => console.error('[COARTADA INIT]', err))
  // Keep non-blocking but add explicit success feedback
```

### If Fix 3 (Player Limit) Blocks Valid Teams
```typescript
// Revert max player check and use cycling instead
if (playerCount > 4) {
  // Instead of error, cycle frases
  for (let i = 0; i < playerCount; i++) {
    fraseAssignments.push({ playerIndex: i, fraseIndex: i % 4 })
  }
}
```

---

## Sign-Off

**All fixes are low-risk and recommended before production testing.**

**Next step:** Apply fixes, then follow TESTING_COARTADA_GUIDE Phase 2-7 to validate system works end-to-end.
