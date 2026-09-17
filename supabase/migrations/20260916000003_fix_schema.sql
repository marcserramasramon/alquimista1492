-- Fix database schema to match PRD requirements
-- Key change: sessions.team_id → teams.session_id (many teams per session)
-- Add: sessions.master_id to track which master runs the session
-- Create missing tables for comprehensive game state tracking

-- Drop existing RLS policies on sessions and teams (will recreate after structure change)
DROP POLICY IF EXISTS "players_select_own_session" ON sessions;
DROP POLICY IF EXISTS "players_update_own_session" ON sessions;
DROP POLICY IF EXISTS "master_select_all_sessions" ON sessions;
DROP POLICY IF EXISTS "master_update_all_sessions" ON sessions;
DROP POLICY IF EXISTS "allow_insert_sessions" ON sessions;

DROP POLICY IF EXISTS "players_select_own_team" ON teams;
DROP POLICY IF EXISTS "master_select_all_teams" ON teams;
DROP POLICY IF EXISTS "allow_insert_teams" ON teams;

-- Step 1: Drop foreign key constraint from sessions.team_id
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_team_id_fkey;

-- Step 2: Alter sessions table - remove team_id, add master_id
ALTER TABLE sessions DROP COLUMN IF EXISTS team_id;
ALTER TABLE sessions ADD COLUMN master_id UUID;

-- Add foreign key for master_id (references master_sessions table)
-- Note: master_sessions doesn't have a UUID id, so we'll link to service role identity
-- For now, we store master_id as UUID that can be generated when master creates a session

-- Step 3: Alter teams table - add session_id, ensure code is VARCHAR(6)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sessions(id) ON DELETE CASCADE;

-- Ensure code field is exactly VARCHAR(6)
ALTER TABLE teams ALTER COLUMN code TYPE VARCHAR(6);

-- Create index for session_id queries
CREATE INDEX IF NOT EXISTS idx_teams_session_id ON teams(session_id);

-- ============================================================================
-- Step 4: Create missing tables for comprehensive game state
-- ============================================================================

-- Table: team_stations
-- Tracks progress on each station per team (solved, attempt count)
CREATE TABLE IF NOT EXISTS team_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  station_id VARCHAR(50) NOT NULL,
  solved BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  solved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, station_id)
);

COMMENT ON TABLE team_stations IS 'Tracks each team''s progress on stations (solved status, attempt count)';
COMMENT ON COLUMN team_stations.solved IS 'Whether the team has solved this station';
COMMENT ON COLUMN team_stations.attempts IS 'Number of attempts made on this station';

CREATE INDEX IF NOT EXISTS idx_team_stations_team_id ON team_stations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_stations_solved ON team_stations(solved);

-- Table: team_evidences
-- Tracks which evidence pieces each team has unlocked
CREATE TABLE IF NOT EXISTS team_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  evidence_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, evidence_id)
);

COMMENT ON TABLE team_evidences IS 'Tracks which evidence pieces each team has discovered/unlocked';
COMMENT ON COLUMN team_evidences.evidence_id IS 'Reference to evidence in content/public/evidences';

CREATE INDEX IF NOT EXISTS idx_team_evidences_team_id ON team_evidences(team_id);
CREATE INDEX IF NOT EXISTS idx_team_evidences_evidence_id ON team_evidences(evidence_id);

-- Table: score_events
-- Granular tracking of points awarded (for audit trail and final scoring)
CREATE TABLE IF NOT EXISTS score_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE score_events IS 'Audit trail of points awarded: station solved, time bonus, hint penalty, etc.';
COMMENT ON COLUMN score_events.event_type IS 'Type: station_solved, hint_used, time_bonus, accusation_correct, etc.';
COMMENT ON COLUMN score_events.details IS 'Additional context: {station_id, hint_level, etc.}';

CREATE INDEX IF NOT EXISTS idx_score_events_team_id ON score_events(team_id);
CREATE INDEX IF NOT EXISTS idx_score_events_created_at ON score_events(created_at);

-- Table: hints_used
-- Tracks which hints each team has used (to prevent reuse and for scoring)
CREATE TABLE IF NOT EXISTS hints_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  hint_id VARCHAR(50) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, hint_id)
);

COMMENT ON TABLE hints_used IS 'Tracks which hints each team has used (prevents duplicate use)';

CREATE INDEX IF NOT EXISTS idx_hints_used_team_id ON hints_used(team_id);
CREATE INDEX IF NOT EXISTS idx_hints_used_hint_id ON hints_used(hint_id);

-- Table: accusations
-- Tracks accusations of suspects (with evidence provided)
CREATE TABLE IF NOT EXISTS accusations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  suspect_id VARCHAR(50) NOT NULL,
  evidence_ids TEXT[] DEFAULT '{}',
  correct BOOLEAN,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE accusations IS 'Final accusations made by team against suspects, with evidence list';
COMMENT ON COLUMN accusations.evidence_ids IS 'Array of evidence IDs provided to support accusation';
COMMENT ON COLUMN accusations.correct IS 'Whether the accusation was correct (identifies the traitor)';
COMMENT ON COLUMN accusations.points_awarded IS 'Points awarded for this accusation (varies by correctness)';

CREATE INDEX IF NOT EXISTS idx_accusations_team_id ON accusations(team_id);
CREATE INDEX IF NOT EXISTS idx_accusations_suspect_id ON accusations(suspect_id);

-- Table: passes
-- Tracks free passes (salconduit) issued to teams
CREATE TABLE IF NOT EXISTS passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  pass_token VARCHAR(50) NOT NULL UNIQUE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_on_station_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE passes IS 'Free passes (salconduits) - teams can skip one station';
COMMENT ON COLUMN passes.pass_token IS 'Unique token for validation (could be used for physical QR)';
COMMENT ON COLUMN passes.used_on_station_id IS 'Which station this pass was used on (NULL if unused)';

CREATE INDEX IF NOT EXISTS idx_passes_team_id ON passes(team_id);
CREATE INDEX IF NOT EXISTS idx_passes_used_at ON passes(used_at);

-- Table: events
-- Real-time game events for live master dashboard (who solved what, when)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE events IS 'Real-time event log for master dashboard (station solved, hint used, etc.)';
COMMENT ON COLUMN events.event_type IS 'Type: team_joined, station_solved, hint_requested, accusation_made, session_ended, etc.';
COMMENT ON COLUMN events.data IS 'Event-specific data: {team_id, team_name, station_id, hint_level, etc.}';

CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_team_id ON events(team_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- ============================================================================
-- Step 5: Recreate RLS policies for sessions table with new structure
-- ============================================================================

-- Sessions: Players see only sessions their team is part of
CREATE POLICY "players_select_own_session"
ON sessions
FOR SELECT
USING (
  id IN (
    SELECT session_id FROM teams WHERE id IN (
      SELECT team_id FROM players WHERE user_id = auth.uid()
    )
  )
);

-- Sessions: Players can update only their session
CREATE POLICY "players_update_own_session"
ON sessions
FOR UPDATE
USING (
  id IN (
    SELECT session_id FROM teams WHERE id IN (
      SELECT team_id FROM players WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  id IN (
    SELECT session_id FROM teams WHERE id IN (
      SELECT team_id FROM players WHERE user_id = auth.uid()
    )
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

-- Sessions: Allow insert during game creation
CREATE POLICY "allow_insert_sessions"
ON sessions
FOR INSERT
WITH CHECK (TRUE);

-- ============================================================================
-- Step 6: Recreate RLS policies for teams table with new structure
-- ============================================================================

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

-- ============================================================================
-- Step 7: Enable RLS on new tables with appropriate policies
-- ============================================================================

ALTER TABLE team_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hints_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE accusations ENABLE ROW LEVEL SECURITY;
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- team_stations: Players see only their team's data
CREATE POLICY "players_select_own_team_stations"
ON team_stations
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

CREATE POLICY "master_select_all_team_stations"
ON team_stations
FOR SELECT
TO service_role
USING (TRUE);

CREATE POLICY "allow_insert_team_stations"
ON team_stations
FOR INSERT
WITH CHECK (TRUE);

-- team_evidences: Players see only their team's data
CREATE POLICY "players_select_own_team_evidences"
ON team_evidences
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

CREATE POLICY "master_select_all_team_evidences"
ON team_evidences
FOR SELECT
TO service_role
USING (TRUE);

CREATE POLICY "allow_insert_team_evidences"
ON team_evidences
FOR INSERT
WITH CHECK (TRUE);

-- score_events: Players see only their team's data
CREATE POLICY "players_select_own_score_events"
ON score_events
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

CREATE POLICY "master_select_all_score_events"
ON score_events
FOR SELECT
TO service_role
USING (TRUE);

CREATE POLICY "allow_insert_score_events"
ON score_events
FOR INSERT
WITH CHECK (TRUE);

-- hints_used: Players see only their team's data
CREATE POLICY "players_select_own_hints_used"
ON hints_used
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

CREATE POLICY "master_select_all_hints_used"
ON hints_used
FOR SELECT
TO service_role
USING (TRUE);

CREATE POLICY "allow_insert_hints_used"
ON hints_used
FOR INSERT
WITH CHECK (TRUE);

-- accusations: Players see only their team's data
CREATE POLICY "players_select_own_accusations"
ON accusations
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

CREATE POLICY "master_select_all_accusations"
ON accusations
FOR SELECT
TO service_role
USING (TRUE);

CREATE POLICY "allow_insert_accusations"
ON accusations
FOR INSERT
WITH CHECK (TRUE);

-- passes: Players see only their team's data
CREATE POLICY "players_select_own_passes"
ON passes
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

CREATE POLICY "master_select_all_passes"
ON passes
FOR SELECT
TO service_role
USING (TRUE);

CREATE POLICY "allow_insert_passes"
ON passes
FOR INSERT
WITH CHECK (TRUE);

-- events: Players see only events from their session
CREATE POLICY "players_select_own_session_events"
ON events
FOR SELECT
USING (
  session_id IN (
    SELECT session_id FROM teams WHERE id IN (
      SELECT team_id FROM players WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "master_select_all_events"
ON events
FOR SELECT
TO service_role
USING (TRUE);

CREATE POLICY "allow_insert_events"
ON events
FOR INSERT
WITH CHECK (TRUE);
