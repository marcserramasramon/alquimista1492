-- Create team_bells_sequences table for tracking bell game attempts
-- Stores the sequence of bell presses made by each team during the Bells (Sometent) game

CREATE TABLE IF NOT EXISTS team_bells_sequences (
  id BIGSERIAL PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  station_id TEXT NOT NULL DEFAULT 'bells-sometent',

  -- Moral choice made by the team
  moral_choice CHAR(1) CHECK (moral_choice IN ('A', 'B')),

  -- Bell sequence attempt (JSON array of bell numbers)
  player_sequence INTEGER[] NOT NULL DEFAULT '{}',

  -- Metadata
  attempts INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Composite key to ensure one active sequence per team/station per session
  UNIQUE(team_id, session_id, station_id)
);

-- Create index for efficient team lookups
CREATE INDEX IF NOT EXISTS idx_team_bells_sequences_team_id
  ON team_bells_sequences(team_id);

CREATE INDEX IF NOT EXISTS idx_team_bells_sequences_session_id
  ON team_bells_sequences(session_id);

CREATE INDEX IF NOT EXISTS idx_team_bells_sequences_station_id
  ON team_bells_sequences(station_id);

-- RLS: Teams can only read their own records
ALTER TABLE team_bells_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_can_read_own_bell_sequences"
  ON team_bells_sequences FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM players WHERE id = auth.uid()
    )
  );

CREATE POLICY "service_role_can_manage_bell_sequences"
  ON team_bells_sequences FOR ALL
  USING (true)
  WITH CHECK (true);
