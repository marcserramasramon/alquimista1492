# API Security Checklist

## Client Key Usage Guide

### Supabase Client Types

| Client | Purpose | Permission Level |
|--------|---------|-----------------|
| `supabase` (anon key) | ✓ Player-facing operations | Limited by RLS |
| `getServiceRoleClient()` | ✓ Server-side sensitive ops | Full admin access (bypass RLS) |

---

## API Routes Audit

### ✅ Verified: Already Using Correct Keys

| Route | File | Use Case | Client | Status |
|-------|------|----------|--------|--------|
| `POST /api/teams/create` | `app/api/teams/create.ts` | Create team for master session | service_role | ✅ CORRECT |
| `POST /api/game/validate-answer` | `app/api/game/validate-answer/route.ts` | Validate answer + access solutions | service_role | ✅ CORRECT |
| `POST /api/auth/master` | `app/api/auth/master/route.ts` | Master authentication | ? | 🔍 TO CHECK |

### ⚠️ Requires Update

| Operation | Location | Current | Issue | Fix |
|-----------|----------|---------|-------|-----|
| Session Creation | `lib/auth/player.ts:123` | `supabase` | RLS will deny INSERT | Use `getServiceRoleClient()` |

---

## Operations Matrix

### Player Operations (Use `supabase` anon client)

#### ✅ Allowed

- [x] SELECT own team
- [x] SELECT own players (teammates)
- [x] SELECT own session (read-only)
- [x] SELECT own attempts
- [x] INSERT new attempt (answer submission)
- [x] SELECT own result

#### ❌ Denied by RLS

- [ ] UPDATE session (blocked by RLS)
- [ ] DELETE attempts (blocked by RLS)
- [ ] READ solutions_private (blocked by RLS)
- [ ] Cross-team data access (blocked by RLS)

### Master Operations (Use `service_role` client)

#### ✅ Allowed via API Routes

- [x] Create teams
- [x] Read all teams
- [x] Update session state
- [x] Access solutions for validation
- [x] View all attempts
- [x] Calculate and save results
- [x] Manage master sessions

---

## Required Code Changes

### Fix 1: Player Session Creation

**File:** `lib/auth/player.ts`

**Current (Lines 123-147):**
```typescript
const { data: session, error: sessionError } = await supabase
  .from('sessions')
  .insert({
    team_id: team.id,
    // ... session data ...
  })
  .select()
  .single()
```

**Fixed:**
```typescript
import { getServiceRoleClient } from '@/lib/db'

const serviceClient = getServiceRoleClient()

const { data: session, error: sessionError } = await serviceClient
  .from('sessions')
  .insert({
    team_id: team.id,
    // ... session data ...
  })
  .select()
  .single()
```

**Why:** Players cannot INSERT sessions (RLS denies it). Only service_role can create sessions.

---

## Testing Checklist

### Unit Tests (Per Operation)

- [ ] `supabase` client cannot INSERT to `sessions` table
- [ ] `supabase` client cannot UPDATE `sessions` table
- [ ] `service_role` client CAN INSERT to `sessions` table
- [ ] Player cannot see other team's session
- [ ] Master (service_role) can see all sessions
- [ ] Solutions are not readable via `supabase` client
- [ ] Solutions ARE readable via `service_role` client

### Integration Tests (End-to-End)

- [ ] Player signup flow works (session creation via fixed code)
- [ ] Answer validation flow works (uses service_role)
- [ ] Team creation flow works (uses service_role)
- [ ] Cross-team data access is blocked
- [ ] Audit log records all changes
- [ ] Master dashboard shows all data

### Security Tests

- [ ] Run attempt to query solutions with anon key → should fail
- [ ] Run attempt to update session with player JWT → should fail
- [ ] Run attempt to see other team's attempts → should fail
- [ ] Verify all sensitive operations use service_role → audit

---

## Environment Variables Check

Ensure all required keys are set:

```bash
# Required for anon operations
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Required for service_role operations (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... # LONG SECRET KEY

# Other required keys
MASTER_PIN=1234
MASTER_SESSION_SECRET=long-secret-here
PASS_SECRET=another-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Deployment Steps

1. **Local Testing:**
   ```bash
   npm run dev
   # Test player signup → should work
   # Test answer validation → should work
   ```

2. **Apply Migration:**
   ```bash
   supabase migration up --local
   ```

3. **Apply Code Fixes:**
   - Update `lib/auth/player.ts` (session creation)
   - Verify all other routes already use correct client

4. **Run Tests:**
   ```bash
   npm run test
   npm run test:integration
   ```

5. **Deploy to Staging:**
   ```bash
   git push origin main  # Creates staging deployment
   ```

6. **Verify in Staging:**
   - Test full player flow
   - Test master dashboard
   - Check Supabase logs for RLS errors

7. **Deploy to Production:**
   ```bash
   # After staging validation
   ```

---

## Monitoring & Debugging

### View RLS Violations

**Supabase Dashboard → Logs → Database:**
```
Filter: status = ERROR
Search: "row-level security"
```

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `new row violates row-level security policy` | Trying to INSERT/UPDATE without proper RLS check | Use service_role or fix WHERE clause |
| `permission denied for schema public` | Trying to access table without any policy | Verify RLS policies exist |
| `relation "table_name" does not exist` | Table not created yet | Run migrations |

### Query Audit Log

```typescript
// View all recent changes
const { data: logs } = await serviceClient
  .from('audit_log')
  .select('*')
  .order('changed_at', { ascending: false })
  .limit(100)

// Filter by table
const { data: sessionLogs } = await serviceClient
  .from('audit_log')
  .select('*')
  .eq('table_name', 'sessions')
  .gte('changed_at', new Date(Date.now() - 3600000)) // Last hour
```

---

## Quick Reference

### ✅ Use `supabase` (anon) for:
- Player data reads (own team only)
- Attempt submission
- Result viewing
- Public game state

### ⚠️ Use `getServiceRoleClient()` for:
- Team/player creation
- Session initialization
- Solution access
- Answer validation
- Audit operations
- All master endpoints
- Database migrations

### 🚫 Never:
- Send service_role key to client
- Expose solutions to frontend
- Trust client data for scoring
- Allow direct session manipulation
- Create custom RLS bypass logic

---

## References

- Migration: `supabase/migrations/20260916000004_secure_rls.sql`
- Security Guide: `docs/RLS_SECURITY_MIGRATION.md`
- DB Setup: `lib/db.ts`
- Auth: `lib/auth/player.ts`, `lib/auth/master.ts`
