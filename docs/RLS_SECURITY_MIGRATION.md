# RLS Security Migration Guide

**Date:** 2026-09-17  
**Migration File:** `supabase/migrations/20260916000004_secure_rls.sql`

## Overview

This migration hardens Row Level Security (RLS) policies to prevent unauthorized data access and manipulation. It removes overly permissive `WITH CHECK (TRUE)` policies and replaces them with strict validation rules.

## Key Changes

### 1. Removed Permissive Policies

| Policy | Table | Reason |
|--------|-------|--------|
| `allow_insert_teams` | teams | Teams creation should be API-only via master |
| `allow_insert_players` | players | Players creation should be controlled |
| `allow_insert_sessions` | sessions | Sessions must be created via API with business logic validation |
| `allow_insert_results` | results | Final scoring must be calculated server-side |
| `master_insert_own_sessions` | master_sessions | Master authentication must be validated |

### 2. New Audit Trail System

**Table:** `audit_log`
- Tracks all INSERT, UPDATE, DELETE operations
- Records old and new values (JSONB)
- Captures timestamp and user ID
- Indexed for fast queries

**Triggers:**
- `trigger_audit_session_changes` → `sessions` table
- `trigger_audit_attempt_changes` → `attempts` table  
- `trigger_audit_results_changes` → `results` table

### 3. Strict Access Control

#### Teams Table
- **Players:** SELECT own team, UPDATE own team (except code/variant)
- **Master:** Full access via service_role
- **Rule:** Code and variant fields are immutable

#### Players Table
- **Each player:** SELECT own record + teammates
- **Update:** Own record only (user_id and team_id are immutable)
- **Master:** Full access via service_role

#### Sessions Table (🔒 CRITICAL)
- **Players:** SELECT own session (read-only) ❌ NO UPDATE/INSERT
- **Master:** Full access via service_role
- **Enforcement:** All updates must go through API routes (business logic validation)

#### Attempts Table (Scoring Audit Trail)
- **Players:** SELECT own attempts, INSERT (submit answer)
- **Update:** Players cannot update (prevents answer tampering)
- **Master:** Full access via service_role

#### Results Table
- **Players:** SELECT own result only
- **Insert/Update:** API-only via service_role
- **Rule:** Final scores calculated server-side

#### Solutions Table (🚨 CRITICAL SECRET)
- **Hidden from:** Anonymous users, authenticated players
- **Accessible only to:** service_role (API routes)
- **Policies:**
  - `deny_anon_select_solutions` - No SELECT
  - `deny_anon_insert_solutions` - No INSERT
  - `deny_authenticated_solutions` - Complete denial

### 4. Master Sessions Table
- Master users can only see own sessions
- Service_role can see all (for admin operations)
- Anonymous users completely denied

## API Requirements

All sensitive operations MUST use `service_role` client:

### ✅ Correct Pattern
```typescript
import { getServiceRoleClient } from '@/lib/db'

export async function POST(request: NextRequest) {
  const serviceClient = getServiceRoleClient()
  
  // Create team
  const { data: team } = await serviceClient
    .from('teams')
    .insert({ code: '...', name: '...' })
    .single()
}
```

### ❌ Incorrect Pattern
```typescript
// Using anonymous client for sensitive operations
const { data: team } = await supabase
  .from('teams')
  .insert({ /* will fail with RLS */ })
```

## Critical Fixes Required

### Issue: Session Creation in signInAsPlayer()

**Location:** `lib/auth/player.ts:123-147`

**Problem:** 
- Session insertion uses anonymous client
- New RLS policy denies all player-initiated session creation
- Will throw RLS violation error

**Solution:** Use service_role for session creation:

```typescript
import { getServiceRoleClient } from '@/lib/db'

export async function signInAsPlayer(
  teamCode: string,
  playerName: string
): Promise<PlayerSignupResult | PlayerSignupError> {
  // ... existing code ...
  
  // Use service role for session creation
  const serviceClient = getServiceRoleClient()
  
  // Create new session
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
}
```

## Testing the Security

### Test 1: Player Cannot See Other Teams
```bash
# Player A signs into Team1
# Player B signs into Team2
# Player A requests Team2's session data
# Expected: RLS denies access (no rows returned)
```

### Test 2: Player Cannot Update Session Directly
```typescript
// Attempt to update session as player
const { error } = await supabase
  .from('sessions')
  .update({ current_act: 5 })
  .eq('id', sessionId)

// Expected error: "new row violates row-level security policy"
```

### Test 3: Player Cannot Tamper with Attempts
```typescript
// Try to UPDATE existing attempt
const { error } = await supabase
  .from('attempts')
  .update({ is_correct: true, status: 'correct' })
  .eq('id', attemptId)

// Expected error: RLS denies UPDATE
```

### Test 4: Solutions Are Hidden
```typescript
// Attempt to read solutions as player
const { data, error } = await supabase
  .from('solutions_private')
  .select('*')

// Expected: error or empty result set
// Should only work with service_role
```

### Test 5: Audit Trail Records Changes
```typescript
// Check audit log after operations
const { data: logs } = await serviceClient
  .from('audit_log')
  .select('*')
  .eq('table_name', 'sessions')
  .order('changed_at', { ascending: false })

// Verify: all session changes are logged with timestamps
```

### Test 6: Master Can Access All Data
```typescript
// Master using service_role should see all teams/sessions
const { data: allTeams } = await serviceClient
  .from('teams')
  .select('*')

// Expected: returns all teams across all sessions
```

## Deployment Checklist

- [ ] Run migration: `supabase migration up --local`
- [ ] Verify schema created successfully
- [ ] Update `lib/auth/player.ts` to use service_role for session creation
- [ ] Test player signup (signin endpoint)
- [ ] Test answer validation (already uses service_role ✓)
- [ ] Test team creation endpoint (already uses service_role ✓)
- [ ] Verify audit logging with sample operations
- [ ] Confirm cross-team access is blocked
- [ ] Test master dashboard sees all data
- [ ] Deploy to staging first
- [ ] Monitor Supabase logs for RLS violations
- [ ] Deploy to production

## Rollback Plan

If issues occur:
```bash
# Revert migration
supabase migration down --local
supabase migration down --remote
```

Then re-enable old policies if needed.

## Monitoring

Check Supabase logs for RLS violations:
1. Go to Supabase Dashboard → Logs → Database
2. Filter by status: `ERROR` and message: `row-level security`
3. Common causes:
   - Anonymous client used for restricted tables
   - Missing service_role check in API
   - Incorrect team_id/session_id in WHERE clause

## Security Principles Applied

1. **Principle of Least Privilege:** Each role gets minimum permissions needed
2. **Defense in Depth:** RLS + API validation + audit logging
3. **Immutability:** Critical fields (code, variant) cannot be modified
4. **Audit Trail:** All changes logged for debugging and compliance
5. **Default Deny:** Solutions hidden from all users except service_role
6. **Data Isolation:** Players see only their team's data

## References

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Audit Logging Best Practices](https://www.postgresql.org/docs/current/sql-createtrigger.html)
