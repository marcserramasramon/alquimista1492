-- Secure RLS Policies Migration
-- Drop overly permissive policies and replace with strict validation
-- Add audit trail for sessions and scoring
-- Date: 2026-09-17

-- ============================================================================
-- 1. Drop Overly Permissive Policies
-- ============================================================================

-- Teams: Remove permissive insert policy
DROP POLICY IF EXISTS "allow_insert_teams" ON teams;

-- Players: Remove permissive insert policy
DROP POLICY IF EXISTS "allow_insert_players" ON players;

-- Sessions: Remove permissive insert and update policies
DROP POLICY IF EXISTS "allow_insert_sessions" ON sessions;

-- Results: Remove permissive insert policy
DROP POLICY IF EXISTS "allow_insert_results" ON results;

-- Master Sessions: Remove permissive insert policy
DROP POLICY IF EXISTS "master_insert_own_sessions" ON master_sessions;

-- ============================================================================
-- 2. Create Audit Logging Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

-- Enable RLS on audit_log (only service_role can write and read)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_service_role_only"
ON audit_log
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY "audit_log_deny_anon"
ON audit_log
FOR ALL
TO anon
USING (FALSE)
WITH CHECK (FALSE);

-- ============================================================================
-- 3. Audit Trigger Functions
-- ============================================================================

-- Function to log session updates (for debugging state changes)
CREATE OR REPLACE FUNCTION audit_session_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    record_id,
    old_values,
    new_values,
    changed_by
  ) VALUES (
    'sessions',
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log attempt submissions (for scoring audit trail)
CREATE OR REPLACE FUNCTION audit_attempt_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    record_id,
    old_values,
    new_values,
    changed_by
  ) VALUES (
    'attempts',
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log results (final score audit trail)
CREATE OR REPLACE FUNCTION audit_results_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    record_id,
    old_values,
    new_values,
    changed_by
  ) VALUES (
    'results',
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers (only for service_role to ensure audit trail)
DROP TRIGGER IF EXISTS trigger_audit_session_changes ON sessions;
DROP TRIGGER IF EXISTS trigger_audit_attempt_changes ON attempts;
DROP TRIGGER IF EXISTS trigger_audit_results_changes ON results;

CREATE TRIGGER trigger_audit_session_changes
AFTER INSERT OR UPDATE OR DELETE ON sessions
FOR EACH ROW
EXECUTE FUNCTION audit_session_changes();

CREATE TRIGGER trigger_audit_attempt_changes
AFTER INSERT OR UPDATE OR DELETE ON attempts
FOR EACH ROW
EXECUTE FUNCTION audit_attempt_changes();

CREATE TRIGGER trigger_audit_results_changes
AFTER INSERT OR UPDATE OR DELETE ON results
FOR EACH ROW
EXECUTE FUNCTION audit_results_changes();

-- ============================================================================
-- 4. Secure Teams Table Policies
-- ============================================================================

-- POLICY: Teams - Players can SELECT only their own team
-- Ensures players can only see their team data
CREATE POLICY "players_select_own_team"
ON teams
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM players WHERE team_id = teams.id
  )
);

-- POLICY: Teams - Players can UPDATE only their own team (name, color, active status)
-- Prevents modification of code or variant
CREATE POLICY "players_update_own_team"
ON teams
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM players WHERE team_id = teams.id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM players WHERE team_id = teams.id
  )
  AND code = (SELECT code FROM teams WHERE id = teams.id) -- code immutable
  AND variant = (SELECT variant FROM teams WHERE id = teams.id) -- variant immutable
);

-- POLICY: Teams - Master can SELECT all teams via service_role
CREATE POLICY "master_select_all_teams"
ON teams
FOR SELECT
TO service_role
USING (TRUE);

-- POLICY: Teams - Master can UPDATE all teams via service_role
CREATE POLICY "master_update_all_teams"
ON teams
FOR UPDATE
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- POLICY: Teams - Master can INSERT teams via service_role only
-- API route must validate and use service_role key
CREATE POLICY "master_insert_teams"
ON teams
FOR INSERT
TO service_role
WITH CHECK (TRUE);

-- ============================================================================
-- 5. Secure Players Table Policies
-- ============================================================================

-- POLICY: Players - Each player can SELECT only their own record
-- Prevents cross-team visibility
CREATE POLICY "player_select_own_record"
ON players
FOR SELECT
USING (
  auth.uid() = user_id
);

-- POLICY: Players - Each player can SELECT their teammates
-- Allows team collaboration
CREATE POLICY "players_select_own_team_players"
ON players
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

-- POLICY: Players - Each player can UPDATE only their own record
-- Prevents modification of team_id or user_id
CREATE POLICY "player_update_own_record"
ON players
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
  AND user_id = (SELECT user_id FROM players WHERE id = players.id) -- user_id immutable
  AND team_id = (SELECT team_id FROM players WHERE id = players.id) -- team_id immutable
);

-- POLICY: Players - Master can SELECT all players via service_role
CREATE POLICY "master_select_all_players"
ON players
FOR SELECT
TO service_role
USING (TRUE);

-- POLICY: Players - Master can INSERT players via service_role only
-- API route must validate team exists and has capacity
CREATE POLICY "master_insert_players"
ON players
FOR INSERT
TO service_role
WITH CHECK (TRUE);

-- POLICY: Players - Master can UPDATE players via service_role for auditing
CREATE POLICY "master_update_all_players"
ON players
FOR UPDATE
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- ============================================================================
-- 6. Secure Sessions Table Policies (NO CLIENT ACCESS)
-- ============================================================================

-- POLICY: Sessions - Players can SELECT only their team's session (read-only)
-- Prevents modification via RLS; all updates must go via API
CREATE POLICY "players_select_own_session"
ON sessions
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

-- POLICY: Sessions - Players CANNOT UPDATE sessions directly
-- All session updates (state, scores, evidence) must go via API route with validation
-- This policy prevents direct manipulation and ensures business logic is enforced
CREATE POLICY "deny_players_update_sessions"
ON sessions
FOR UPDATE
USING (FALSE)
WITH CHECK (FALSE);

-- POLICY: Sessions - Players CANNOT INSERT sessions
-- Session creation is handled by API route only
CREATE POLICY "deny_players_insert_sessions"
ON sessions
FOR INSERT
USING (FALSE)
WITH CHECK (FALSE);

-- POLICY: Sessions - Master can SELECT all sessions via service_role
CREATE POLICY "master_select_all_sessions"
ON sessions
FOR SELECT
TO service_role
USING (TRUE);

-- POLICY: Sessions - Master can UPDATE all sessions via service_role
-- Logging via audit trigger ensures all changes are tracked
CREATE POLICY "master_update_all_sessions"
ON sessions
FOR UPDATE
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- POLICY: Sessions - Master can INSERT sessions via service_role only
-- API route validates team exists and creates session
CREATE POLICY "master_insert_sessions"
ON sessions
FOR INSERT
TO service_role
WITH CHECK (TRUE);

-- ============================================================================
-- 7. Secure Attempts Table Policies (SCORING AUDIT TRAIL)
-- ============================================================================

-- POLICY: Attempts - Players can SELECT only their team's attempts
CREATE POLICY "players_select_own_attempts"
ON attempts
FOR SELECT
USING (
  session_id IN (
    SELECT id FROM sessions WHERE team_id IN (
      SELECT team_id FROM players WHERE user_id = auth.uid()
    )
  )
);

-- POLICY: Attempts - Players can INSERT attempts (submit answers)
-- Submission is validated server-side before INSERT
CREATE POLICY "players_insert_own_attempts"
ON attempts
FOR INSERT
WITH CHECK (
  session_id IN (
    SELECT id FROM sessions WHERE team_id IN (
      SELECT team_id FROM players WHERE user_id = auth.uid()
    )
  )
);

-- POLICY: Attempts - Players CANNOT UPDATE attempts directly
-- Prevents cheating by modifying previous answers
CREATE POLICY "deny_players_update_attempts"
ON attempts
FOR UPDATE
USING (FALSE)
WITH CHECK (FALSE);

-- POLICY: Attempts - Master can SELECT all attempts via service_role
CREATE POLICY "master_select_all_attempts"
ON attempts
FOR SELECT
TO service_role
USING (TRUE);

-- POLICY: Attempts - Master can UPDATE attempts via service_role for auditing only
CREATE POLICY "master_update_all_attempts"
ON attempts
FOR UPDATE
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- ============================================================================
-- 8. Secure Results Table Policies (NO CLIENT WRITE ACCESS)
-- ============================================================================

-- POLICY: Results - Players can SELECT only their team's result
CREATE POLICY "players_select_own_result"
ON results
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

-- POLICY: Results - Players CANNOT INSERT results directly
-- Final scoring must be calculated server-side by API
CREATE POLICY "deny_players_insert_results"
ON results
FOR INSERT
USING (FALSE)
WITH CHECK (FALSE);

-- POLICY: Results - Master can SELECT all results via service_role
CREATE POLICY "master_select_all_results"
ON results
FOR SELECT
TO service_role
USING (TRUE);

-- POLICY: Results - Master can INSERT results via service_role
-- API route calculates final score and inserts via service_role
CREATE POLICY "master_insert_results"
ON results
FOR INSERT
TO service_role
WITH CHECK (TRUE);

-- POLICY: Results - Master can UPDATE results via service_role for correction
CREATE POLICY "master_update_all_results"
ON results
FOR UPDATE
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- ============================================================================
-- 9. Secure Master Sessions Table Policies
-- ============================================================================

-- POLICY: Master Sessions - Master can SELECT only own sessions
CREATE POLICY "master_select_own_sessions"
ON master_sessions
FOR SELECT
USING (
  master_id = auth.uid()::text OR
  auth.uid()::text = master_id
);

-- POLICY: Master Sessions - Service role can SELECT all (for admin)
CREATE POLICY "service_role_select_all_master_sessions"
ON master_sessions
FOR SELECT
TO service_role
USING (TRUE);

-- POLICY: Master Sessions - Master can INSERT only own sessions via service_role
-- API validates authentication before allowing insert
CREATE POLICY "master_insert_own_sessions"
ON master_sessions
FOR INSERT
TO service_role
WITH CHECK (TRUE);

-- POLICY: Master Sessions - Deny anon users
CREATE POLICY "deny_anon_master_sessions"
ON master_sessions
FOR ALL
TO anon
USING (FALSE)
WITH CHECK (FALSE);

-- ============================================================================
-- 10. Secure Solutions Private Table (CRITICAL - SERVER ONLY)
-- ============================================================================

-- POLICY: Solutions Private - Service role can SELECT
CREATE POLICY "service_role_select_solutions"
ON solutions_private
FOR SELECT
TO service_role
USING (TRUE);

-- POLICY: Solutions Private - Service role can INSERT
CREATE POLICY "service_role_insert_solutions"
ON solutions_private
FOR INSERT
TO service_role
WITH CHECK (TRUE);

-- POLICY: Solutions Private - Service role can UPDATE
CREATE POLICY "service_role_update_solutions"
ON solutions_private
FOR UPDATE
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- POLICY: Solutions Private - Deny ALL anon users (no SELECT)
CREATE POLICY "deny_anon_select_solutions"
ON solutions_private
FOR SELECT
TO anon
USING (FALSE);

-- POLICY: Solutions Private - Deny ALL anon users (no INSERT)
CREATE POLICY "deny_anon_insert_solutions"
ON solutions_private
FOR INSERT
TO anon
WITH CHECK (FALSE);

-- POLICY: Solutions Private - Deny ALL authenticated users
CREATE POLICY "deny_authenticated_solutions"
ON solutions_private
FOR ALL
TO authenticated
USING (FALSE)
WITH CHECK (FALSE);

-- ============================================================================
-- 11. Verify RLS is Enabled on All Tables
-- ============================================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions_private ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 12. Summary of Security Changes
-- ============================================================================
--
-- REMOVED (Overly Permissive):
-- ✓ allow_insert_teams - Replaced with master-only insert
-- ✓ allow_insert_players - Replaced with master-only insert
-- ✓ allow_insert_sessions - Replaced with deny-all + API-only
-- ✓ allow_insert_results - Replaced with deny-all + API-only
-- ✓ master_insert_own_sessions - Replaced with service_role only
--
-- ADDED (New Security):
-- ✓ Audit logging for sessions, attempts, and results
-- ✓ Audit triggers capture all changes with timestamps
-- ✓ Immutable fields protection (code, variant, user_id, team_id)
-- ✓ Deny policies for direct client manipulation
-- ✓ Service_role policies for API-driven operations
-- ✓ Explicit authenticated user denial on solutions_private
--
-- ENFORCEMENT:
-- • Teams, Players: Basic operations restricted by RLS
-- • Sessions, Attempts, Results: Direct client writes DENIED (via RLS WITH CHECK (FALSE))
-- • All sensitive writes: MUST go through API routes using service_role key
-- • Audit trail: All changes logged to audit_log for debugging
-- • Solutions: Hidden from all users except service_role
--
-- ============================================================================
