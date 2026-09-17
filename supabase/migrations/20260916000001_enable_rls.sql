-- Enable Row Level Security on all tables
-- Players can only access their own team's data
-- Master can access all data
-- solutions_private is completely hidden from non-service_role users

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions_private ENABLE ROW LEVEL SECURITY;

-- Teams: Players see only their own team
CREATE POLICY "players_select_own_team"
ON teams
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM players WHERE team_id = teams.id
  )
);

-- Teams: Master can see all teams
CREATE POLICY "master_select_all_teams"
ON teams
FOR SELECT
TO service_role
USING (TRUE);

-- Teams: Allow insert for signup
CREATE POLICY "allow_insert_teams"
ON teams
FOR INSERT
WITH CHECK (TRUE);

-- Players: Players see only their teammates
CREATE POLICY "players_select_own_team_players"
ON players
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

-- Players: Master can see all players
CREATE POLICY "master_select_all_players"
ON players
FOR SELECT
TO service_role
USING (TRUE);

-- Players: Allow insert for signup
CREATE POLICY "allow_insert_players"
ON players
FOR INSERT
WITH CHECK (TRUE);

-- Sessions: Players see only their team's session
CREATE POLICY "players_select_own_session"
ON sessions
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

-- Sessions: Players can update only their own session
CREATE POLICY "players_update_own_session"
ON sessions
FOR UPDATE
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

-- Sessions: Master can see all sessions
CREATE POLICY "master_select_all_sessions"
ON sessions
FOR SELECT
TO service_role
USING (TRUE);

-- Sessions: Master can update all sessions
CREATE POLICY "master_update_all_sessions"
ON sessions
FOR UPDATE
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Sessions: Allow insert during signup
CREATE POLICY "allow_insert_sessions"
ON sessions
FOR INSERT
WITH CHECK (TRUE);

-- Attempts: Players see only their team's attempts
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

-- Attempts: Players can insert attempts (submit answers)
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

-- Attempts: Master can see all attempts
CREATE POLICY "master_select_all_attempts"
ON attempts
FOR SELECT
TO service_role
USING (TRUE);

-- Attempts: Master can update attempts (for auditing)
CREATE POLICY "master_update_all_attempts"
ON attempts
FOR UPDATE
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Results: Players see only their team's result
CREATE POLICY "players_select_own_result"
ON results
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

-- Results: Master can see all results
CREATE POLICY "master_select_all_results"
ON results
FOR SELECT
TO service_role
USING (TRUE);

-- Results: Allow insert for final scoring
CREATE POLICY "allow_insert_results"
ON results
FOR INSERT
WITH CHECK (TRUE);

-- Master sessions: Master can see own sessions
CREATE POLICY "master_select_own_sessions"
ON master_sessions
FOR SELECT
USING (
  master_id = current_user_id() OR
  auth.uid()::text = master_id
);

-- Master sessions: Master can insert own sessions
CREATE POLICY "master_insert_own_sessions"
ON master_sessions
FOR INSERT
WITH CHECK (TRUE);

-- Master sessions: Allow service role to see all
CREATE POLICY "service_role_select_all_master_sessions"
ON master_sessions
FOR SELECT
TO service_role
USING (TRUE);

-- CRITICAL: solutions_private - DENY ALL by default
-- Only service_role can access (via server-side API)
CREATE POLICY "service_role_select_solutions"
ON solutions_private
FOR SELECT
TO service_role
USING (TRUE);

CREATE POLICY "service_role_insert_solutions"
ON solutions_private
FOR INSERT
TO service_role
WITH CHECK (TRUE);

CREATE POLICY "service_role_update_solutions"
ON solutions_private
FOR UPDATE
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Deny all anonymous users from accessing solutions
CREATE POLICY "deny_anon_select_solutions"
ON solutions_private
FOR SELECT
TO anon
USING (FALSE);

-- Helper function to get current user ID (for master_sessions)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid()::text
$$;
