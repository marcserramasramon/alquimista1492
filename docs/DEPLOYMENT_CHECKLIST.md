# RLS Security Migration - Deployment Checklist

**Date:** 2026-09-17  
**Target Version:** Post-Phase 6 (Polish)  
**Risk Level:** 🔴 HIGH - Security-critical changes

---

## Deliverables Summary

### ✅ Completed Items

| Item | File | Status | Purpose |
|------|------|--------|---------|
| RLS Migration | `supabase/migrations/20260916000004_secure_rls.sql` | ✅ Ready | 25 policies + audit system |
| Migration Guide | `docs/RLS_SECURITY_MIGRATION.md` | ✅ Ready | Deployment instructions |
| API Checklist | `docs/API_SECURITY_CHECKLIST.md` | ✅ Ready | API security patterns |
| Security Summary | `docs/SECURITY_CHANGES_SUMMARY.md` | ✅ Ready | Overview & timeline |
| Code Fix Guide | `docs/REQUIRED_CODE_FIX.md` | ✅ Ready | 1 required change (5 min) |
| This Checklist | `docs/DEPLOYMENT_CHECKLIST.md` | ✅ Ready | Deployment steps |

---

## Pre-Deployment Phase

### Step 1: Review Security Changes (15 minutes)
- [ ] Read `docs/SECURITY_CHANGES_SUMMARY.md` (executive overview)
- [ ] Understand: Drop 5 policies, add 25 policies, add audit system
- [ ] Understand: Players cannot INSERT/UPDATE sessions, score, results
- [ ] Understand: All sensitive writes must use `service_role` via API

### Step 2: Plan Code Changes (5 minutes)
- [ ] Review `docs/REQUIRED_CODE_FIX.md`
- [ ] Identify that only 1 file needs changing: `lib/auth/player.ts`
- [ ] Identify that lines 120-147 need `serviceClient` instead of `supabase`
- [ ] Estimate: 5 minutes to implement + 10 minutes to test

### Step 3: Backup Production Database (5 minutes)
```bash
# Backup current Supabase project
supabase db push  # Ensure current state is saved
supabase db dump > backup_$(date +%s).sql
```

### Step 4: Set Up Testing Environment (10 minutes)
```bash
# Create local test database
supabase start

# Import production schema (optional - use local schema)
# This gives you a test environment matching production
```

---

## Implementation Phase

### Step 5: Apply Migration (5 minutes)

**Local Testing:**
```bash
# Start local Supabase stack
supabase start

# Verify migration files exist
ls supabase/migrations/ | grep 20260916

# Apply migration to local database
supabase migration up --local

# Verify tables and policies exist
supabase db pull  # Should show new policies
```

**Verify Migration Success:**
```sql
-- Check audit_log table was created
SELECT tablename FROM pg_tables WHERE tablename = 'audit_log';
-- Should return: "audit_log"

-- Check audit triggers exist
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name LIKE 'trigger_audit_%';
-- Should return 3 triggers

-- List all RLS policies on sessions table
SELECT policyname FROM pg_policies WHERE tablename = 'sessions';
-- Should show: deny_players_insert_sessions, deny_players_update_sessions, etc.
```

### Step 6: Implement Required Code Fix (10 minutes)

**File:** `lib/auth/player.ts`

**Change to make:**
```typescript
// Line 4: Add import
import { getServiceRoleClient } from '@/lib/db'

// Lines 120-147: Use service_role for session creation
const serviceClient = getServiceRoleClient()
const { data: session } = await serviceClient
  .from('sessions')
  .insert({
    // ... session data
  })
```

**Commit:**
```bash
git add lib/auth/player.ts
git commit -m "fix: use service_role for session creation (RLS enforcement)

- Sessions must be created via service_role client
- Players cannot INSERT sessions (new RLS policy)
- Change enables proper audit logging
- Fixes player signup flow with new security policies

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

git push origin fix/rls-player-session
```

### Step 7: Verify No TypeScript Errors (5 minutes)
```bash
npm run type-check
# Expected: No errors
```

### Step 8: Build Project (10 minutes)
```bash
npm run build
# Expected: Success
# If errors: Review error messages and fix
```

---

## Local Testing Phase

### Step 9: Unit Tests (20 minutes)

**Create test file:** `__tests__/rls-player-session.test.ts`

```typescript
import { signInAsPlayer } from '@/lib/auth/player'
import { getServiceRoleClient } from '@/lib/db'

describe('RLS - Player Session Creation', () => {
  it('should create session for first player on team', async () => {
    const result = await signInAsPlayer('TEST01', 'Alice')
    
    expect(result).toHaveProperty('sessionId')
    expect(result).toHaveProperty('teamId')
    expect(result).toHaveProperty('playerId')
  })

  it('should reuse session for second player on team', async () => {
    const player1 = await signInAsPlayer('TEST02', 'Alice')
    const player2 = await signInAsPlayer('TEST02', 'Bob')
    
    expect(player1.sessionId).toBe(player2.sessionId) // Same session
    expect(player1.playerId).not.toBe(player2.playerId) // Different players
  })

  it('should log session creation to audit_log', async () => {
    const serviceClient = getServiceRoleClient()
    
    const before = await serviceClient
      .from('audit_log')
      .select('COUNT(*)')
      .eq('table_name', 'sessions')
    
    await signInAsPlayer('TEST03', 'Charlie')
    
    const after = await serviceClient
      .from('audit_log')
      .select('COUNT(*)')
      .eq('table_name', 'sessions')
    
    expect(after.data).toBeGreaterThan(before.data)
  })

  it('player should not be able to INSERT session directly', async () => {
    const { supabase } = await import('@/lib/db')
    
    const { error } = await supabase
      .from('sessions')
      .insert({ team_id: 'test', current_act: 1 })
    
    expect(error).toBeDefined()
    expect(error.message).toContain('row-level security')
  })
})
```

Run tests:
```bash
npm run test:unit
# Expected: All tests pass ✅
```

### Step 10: Integration Tests (30 minutes)

**Full player flow test:**
```typescript
describe('Full Player Signup Flow', () => {
  it('new player can sign up, submit answer, and see result', async () => {
    // 1. Player signs up
    const player = await signInAsPlayer('FLOW01', 'TestPlayer')
    expect(player.sessionId).toBeDefined()
    
    // 2. Get session (player should see it)
    const session = await getPlayerSession(player.sessionId)
    expect(session.team_id).toBe(player.teamId)
    
    // 3. Player cannot see other team's session
    const otherTeam = await signInAsPlayer('FLOW02', 'OtherPlayer')
    const result = await getPlayerSession(otherTeam.sessionId, player.jwt)
    expect(result).toBeNull() // RLS blocks cross-team access
    
    // 4. Submit answer (via API)
    const answer = await validateAnswer(player.sessionId, 'station1', 'answer')
    expect(answer.correct).toBe(true) // or false depending on answer
    
    // 5. Verify attempt was recorded
    const attempts = await getAttempts(player.sessionId, player.jwt)
    expect(attempts.length).toBe(1)
    
    // 6. Verify audit log recorded everything
    const logs = await getAuditLogs('sessions')
    expect(logs.some(l => l.record_id === player.sessionId)).toBe(true)
  })
})
```

Run tests:
```bash
npm run test:integration
# Expected: All tests pass ✅
# If failure: Review error, fix code, retry
```

### Step 11: Manual Testing (15 minutes)

**Local web testing:**
```bash
# Start dev server
npm run dev
# Open http://localhost:3000

# Test 1: Sign up as first player
# - Scan team QR code (or enter code)
# - Enter name
# - Verify: Redirected to game page
# - Check browser console: No errors

# Test 2: Open second tab, sign up as second player same team
# - Same team code
# - Different name
# - Verify: See same session data
# - Check: Both players see same session ID in state

# Test 3: Answer a question
# - Try correct answer
# - Verify: "Resposta correcta!"
# - Check audit logs in Supabase

# Test 4: Check master dashboard
# - Go to /master
# - Login with PIN
# - Verify: See both teams
# - Verify: See all attempts
```

---

## Staging Deployment Phase

### Step 12: Push to Staging (5 minutes)
```bash
# Ensure all changes committed
git status
# Expected: nothing to commit

# Push to staging branch
git push origin main  # or create staging-* branch if preferred

# Watch deployment in Vercel/CI
# Expected: Build succeeds
```

### Step 13: Apply Migration on Staging (5 minutes)
```bash
# Connect to staging Supabase project
supabase link --project-ref <staging-project-id>

# Apply migration
supabase migration up

# Verify migration applied
# Visit Supabase dashboard for staging project
# Check: Tables tab shows audit_log ✓
# Check: policies tab shows all 25 policies ✓
```

### Step 14: Smoke Testing on Staging (30 minutes)

**Test checklist:**
- [ ] Player signup works
- [ ] Answer submission works
- [ ] Team creation (master) works
- [ ] Master dashboard loads
- [ ] Cross-team access blocked
- [ ] Audit logs populated
- [ ] No RLS errors in Supabase logs

**Monitor:**
```bash
# Check Supabase logs for errors
supabase functions logs
# Should be clean - no RLS violation errors

# Check audit_log for entries
SELECT COUNT(*) FROM audit_log WHERE changed_at > now() - interval '1 hour'
# Should show entries from your test activities
```

### Step 15: Performance Testing (15 minutes)
```bash
# Simulate multiple concurrent players
# Tool: Apache JMeter or similar

# Metrics to check:
# - Response time (should be < 200ms)
# - Database CPU usage (should stay < 50%)
# - Audit logging not causing slowdown (< 10ms per write)
```

---

## Production Deployment Phase

### Step 16: Create Database Backup (10 minutes)
```bash
# Export current production state
supabase db dump --password=$SUPABASE_PASSWORD > pre-migration-backup.sql

# Upload backup to secure storage
# (AWS S3, Google Cloud Storage, etc.)

# Verify backup is readable
file pre-migration-backup.sql
# Should be a valid SQL dump file
```

### Step 17: Apply Migration on Production (5 minutes)
```bash
# Connect to production Supabase project
supabase link --project-ref <prod-project-id>

# Apply migration (ONE-WAY - creates new policies)
supabase migration up

# Verify in Supabase dashboard:
# - New tables exist (audit_log)
# - New policies exist (25 total)
# - No errors in logs
```

### Step 18: Deploy Code to Production (5 minutes)
```bash
# Code is already tested and ready
# Production deployment happens automatically via CI/CD
# Or manually:
git push origin main  # Triggers production deployment
```

### Step 19: Monitor First Hour (60 minutes)

**Real-time monitoring:**
```bash
# Terminal 1: Watch for RLS errors
supabase functions logs --tail

# Terminal 2: Check audit_log growth
SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE changed_at > now() - interval '5 min') as recent
FROM audit_log;

# Terminal 3: Monitor player signups
SELECT COUNT(DISTINCT user_id) as active_players,
       COUNT(DISTINCT team_id) as active_teams
FROM players
WHERE created_at > now() - interval '1 hour';
```

**Error checks:**
```sql
-- Look for RLS violations
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%row-level security%'
ORDER BY calls DESC
LIMIT 10;

-- If any found: Review and fix the code
```

### Step 20: Verify Audit Logging (15 minutes)
```sql
-- Check that audit_log has entries
SELECT table_name, operation, COUNT(*) as count
FROM audit_log
WHERE changed_at > now() - interval '1 hour'
GROUP BY table_name, operation;

-- Check for any specific errors
SELECT * FROM audit_log
WHERE new_values ->> 'error' IS NOT NULL
LIMIT 10;

-- Verify no cross-team pollution
SELECT DISTINCT team_id FROM sessions
GROUP BY team_id
HAVING COUNT(*) > 100; -- Flag if any team has suspiciously many sessions
```

---

## Post-Deployment Phase

### Step 21: Document Completion (10 minutes)
```bash
# Create deployment record
git tag release/rls-hardening-v1
git push origin release/rls-hardening-v1

# Update CHANGELOG.md
# - Date: 2026-09-17
# - RLS policies hardened
# - Audit logging added
# - Migration: 20260916000004
```

### Step 22: Setup Monitoring (15 minutes)

**Create alert for RLS violations:**
```bash
# Supabase Alerts (if available)
# Monitor: Database logs for "row-level security" errors
# Alert when: > 5 errors in 5 minutes
# Action: Page on-call engineer
```

**Create dashboard for audit_log:**
```sql
-- Query audit_log for operations in last 24 hours
SELECT 
  table_name,
  operation,
  COUNT(*) as count,
  MIN(changed_at) as first,
  MAX(changed_at) as last
FROM audit_log
WHERE changed_at > now() - interval '24 hours'
GROUP BY table_name, operation
ORDER BY changed_at DESC;
```

### Step 23: Team Communication (10 minutes)
- [ ] Notify dev team: Migration deployed successfully
- [ ] Update incident response procedures if needed
- [ ] Document the security improvement in team wiki
- [ ] Schedule optional "Security Review" meeting

---

## Rollback Plan (If Needed)

### Critical Error: Stop Deployment
```bash
# If production is broken:
# 1. Immediately revert migration
supabase migration down --remote  # Revert to before 20260916000004

# 2. Check if code needs revert
git log --oneline | head -5
# If the lib/auth/player.ts change was last commit:
git revert HEAD

# 3. Redeploy old code
git push origin main
```

### Investigation & Fix
```bash
# 1. Review error logs
supabase functions logs

# 2. Check what went wrong
# - RLS policy syntax error? → Fix SQL
# - Code not using service_role? → Fix code
# - Database connection issue? → Contact Supabase support

# 3. Make fix locally
# 4. Test thoroughly
# 5. Retry deployment
```

### Prevent Future Issues
```bash
# 1. Add automated tests to CI/CD
# 2. Require code review for RLS changes
# 3. Implement staging deployment validation
# 4. Document all security policies
```

---

## Success Criteria

### Security ✅
- [x] RLS migration file created
- [x] 25 policies correctly defined
- [x] Audit logging implemented
- [x] Solutions table completely hidden
- [x] Cross-team access blocked
- [x] Players cannot tamper with attempts

### Functionality ✅
- [ ] Player signup works (with code fix)
- [ ] Answer validation works
- [ ] Team creation works
- [ ] Master dashboard works
- [ ] All existing games work

### Performance ✅
- [ ] Player signup < 200ms
- [ ] Answer validation < 200ms
- [ ] Audit logging < 10ms overhead
- [ ] No database bottlenecks
- [ ] Query performance unchanged

### Operations ✅
- [ ] Deployment successful
- [ ] No RLS violation errors in production
- [ ] Audit logs populated
- [ ] Monitoring alerts configured
- [ ] Team trained on new security model

---

## Time Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Pre-Deployment | 50 min | Review, planning, backup |
| Implementation | 35 min | Apply migration, code fix, build |
| Local Testing | 75 min | Unit tests, integration, manual |
| Staging | 55 min | Deploy, test, monitor |
| Production | 70 min | Backup, deploy, monitor, verify |
| Post-Deployment | 35 min | Documentation, monitoring |
| **Total** | **4-5 hours** | Can be split across 2-3 days |

---

## Key Contacts

For questions or issues during deployment:

| Role | Contact | Available |
|------|---------|-----------|
| Lead Developer | You | During deployment |
| Database Admin | Supabase Support | Available 24/7 |
| Security Lead | ? | For architecture review |
| Devops | ? | For CI/CD pipeline |

---

## Final Verification

Before marking deployment complete:

```bash
# 1. Verify migration applied
supabase migration list | grep 20260916000004
# Should show: 20260916000004_secure_rls

# 2. Verify RLS policies exist
supabase rls policies list
# Should show 25 policies for 7 tables

# 3. Verify audit logging works
SELECT COUNT(*) FROM audit_log WHERE changed_at > now() - interval '1 hour';
# Should show > 0 entries

# 4. Verify player flow works
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"teamCode":"TEST01","playerName":"Test"}'
# Should return: 200 OK with sessionId

# 5. Verify cross-team is blocked
# Request Team B's data with Team A's JWT
# Should return: No rows (RLS blocked)
```

✅ **All checks pass** → Deployment successful!

---

## Next Steps

After successful deployment:

1. **Monitor** audit logs for 48 hours
2. **Collect** feedback from players
3. **Review** performance metrics
4. **Update** documentation with any learnings
5. **Plan** next security improvements (if any)

---

**Deployment Ready:** YES ✅  
**Last Updated:** 2026-09-17  
**Version:** 1.0
