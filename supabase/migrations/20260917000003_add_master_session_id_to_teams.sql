-- Add master_session_id to teams table to associate teams with master sessions

ALTER TABLE teams
ADD COLUMN master_session_id UUID REFERENCES master_sessions(id) ON DELETE CASCADE;

CREATE INDEX idx_teams_master_session_id ON teams(master_session_id);
