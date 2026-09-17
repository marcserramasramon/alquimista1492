# Required Code Fix for RLS Migration

**Status:** ⚠️ REQUIRED before deployment  
**Severity:** High - Without this fix, player signup will fail with RLS error  
**Time to Fix:** 5-10 minutes

---

## The Problem

The new RLS migration (20260916000004) denies ALL direct session creation via RLS:

```sql
-- New policy blocks player-initiated session INSERT
CREATE POLICY "deny_players_insert_sessions"
ON sessions
FOR INSERT
USING (FALSE)
WITH CHECK (FALSE);
```

This means the player signup flow in `lib/auth/player.ts` will fail because it tries to insert a session using the anonymous (`supabase`) client.

---

## Error You'll See

```
Error: new row violates row-level security policy "deny_players_insert_sessions" on table "sessions"
```

**When:** When a new player signs up (first player on a team)

**Why:** Session creation must use `service_role` client (not anon client)

---

## The Fix

### File to Modify
`lib/auth/player.ts`

### Current Code (Lines 120-147)

```typescript
    } else {
      // Create new session
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          team_id: team.id,
          current_act: 1,
          current_station: null,
          solved_stations: [],
          code_digits: ['', '', '', ''],
          evidence_unlocked: [],
          suspects_dismissed: [],
          salconduits_remaining: 3,
          salconduits_used: [],
        })
        .select()
        .single()

      if (sessionError || !session?.id) {
        return {
          code: 'SESSION_CREATE_FAILED',
          message: 'Failed to create game session'
        }
      }

      sessionId = session.id
    }
```

### Fixed Code

Replace the entire section with:

```typescript
    } else {
      // Create new session using service_role
      // (Players cannot INSERT sessions directly - RLS policy denies it)
      const { getServiceRoleClient } = await import('@/lib/db')
      const serviceClient = getServiceRoleClient()

      const { data: session, error: sessionError } = await serviceClient
        .from('sessions')
        .insert({
          team_id: team.id,
          current_act: 1,
          current_station: null,
          solved_stations: [],
          code_digits: ['', '', '', ''],
          evidence_unlocked: [],
          suspects_dismissed: [],
          salconduits_remaining: 3,
          salconduits_used: [],
        })
        .select()
        .single()

      if (sessionError || !session?.id) {
        return {
          code: 'SESSION_CREATE_FAILED',
          message: 'Failed to create game session'
        }
      }

      sessionId = session.id
    }
```

### Alternative: Import at Top

Instead of importing inside the function, you can import at the top of the file:

```typescript
// At the top of lib/auth/player.ts
import { getServiceRoleClient } from '@/lib/db'

// Then use it directly:
const serviceClient = getServiceRoleClient()
const { data: session } = await serviceClient.from('sessions').insert({...})
```

---

## Why This Works

```
Before (Insecure):
  Player Signup → supabase.insert('sessions') → RLS Policy → ❌ DENIED

After (Secure):
  Player Signup → signInAsPlayer() → getServiceRoleClient() 
    → serviceClient.insert('sessions') → ✅ ALLOWED
    → Audit trigger logs the change
    → Session created successfully
```

---

## Testing the Fix

### Test 1: Player Signup Works
```bash
# Make a request to player signup
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "teamCode": "ABC123",
    "playerName": "Test Player"
  }'

# Expected: 200 OK with sessionId
# Error before fix: "row-level security policy"
```

### Test 2: Verify Audit Logging
```typescript
// Check that session creation was logged
const { data: logs } = await serviceClient
  .from('audit_log')
  .select('*')
  .eq('table_name', 'sessions')
  .eq('operation', 'INSERT')
  .order('changed_at', { ascending: false })
  .limit(1)

console.log(logs[0]) // Should show the new session creation
```

### Test 3: Existing Sessions Still Work
```typescript
// Second player joining same team should reuse existing session
const result = await signInAsPlayer('ABC123', 'Second Player')

// Should succeed without creating new session
expect(result.sessionId).toBeDefined()
```

---

## Verification Checklist

- [ ] Modified `lib/auth/player.ts` (lines 120-147)
- [ ] Imported `getServiceRoleClient` from `'@/lib/db'`
- [ ] Changed `supabase` to `serviceClient`
- [ ] Kept all other logic the same
- [ ] No TypeScript errors
- [ ] `npm run build` succeeds
- [ ] Local testing: Player signup works
- [ ] Local testing: Audit log records session creation
- [ ] Local testing: Second player reuses session

---

## What NOT to Change

⚠️ Do NOT modify these:

```typescript
// ❌ Don't add INSERT to allow_teams policy
// ❌ Don't remove the deny_players_insert_sessions policy
// ❌ Don't use supabase client for session creation
// ❌ Don't bypass RLS with other methods
```

These changes are security-critical. The whole point is that players cannot directly manipulate database records.

---

## If You Get Other Errors

### Error: "SUPABASE_SERVICE_ROLE_KEY is required"
**Solution:** Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

### Error: "Cannot find module '@/lib/db'"
**Solution:** Check that the import path is correct. Should be `@/lib/db` not `./lib/db`

### Error: "getServiceRoleClient is not a function"
**Solution:** Verify `lib/db.ts` exports the function (it does by default)

---

## Performance Impact

- **Before:** 1 INSERT to sessions table
- **After:** 1 INSERT to sessions table + 1 INSERT to audit_log table
- **Total Time:** ~5-10ms additional (negligible)
- **Result:** Full audit trail of who created which session

---

## Security Improvement

**Before this fix:**
- Players use anon client → Can bypass RLS with `WITH CHECK (TRUE)`
- No audit trail of session creation
- Impossible to know who created what session

**After this fix:**
- Sessions created via service_role only
- Every session creation logged to audit_log
- Clear audit trail: WHO, WHEN, HOW
- RLS policy enforced: Players cannot create sessions

---

## Deployment Notes

1. **Apply migration first:**
   ```bash
   supabase migration up --local
   ```

2. **Then apply code fix:**
   ```bash
   # Edit lib/auth/player.ts
   # Commit and push
   git add lib/auth/player.ts
   git commit -m "fix: use service_role for session creation (RLS enforcement)"
   git push
   ```

3. **Test before production:**
   ```bash
   npm run test:integration
   # Should test player signup flow
   ```

---

## Questions?

If you have questions about why this change is needed:
- Read `docs/RLS_SECURITY_MIGRATION.md` - Full migration explanation
- Read `docs/API_SECURITY_CHECKLIST.md` - API security patterns
- Check `supabase/migrations/20260916000004_secure_rls.sql` - The actual policies

The change is straightforward: use `getServiceRoleClient()` instead of `supabase` when creating a session.

---

**File:** `lib/auth/player.ts`  
**Lines:** 120-147  
**Change:** Replace `supabase` with `serviceClient` (from `getServiceRoleClient()`)  
**Effort:** 5 minutes  
**Impact:** Critical - Enables RLS enforcement  
**Test:** Player signup flow
