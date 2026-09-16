-- Initialize database schema for El Traïdor de la Guixa
-- Tables: teams, players, sessions, attempts, results, master_sessions, solutions_private

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE session_variant AS ENUM ('A', 'B', 'C');
CREATE TYPE attempt_status AS ENUM ('correct', 'incorrect', 'partial');

-- Table: teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  variant session_variant NOT NULL DEFAULT 'A',
  name VARCHAR(100),
  color VARCHAR(7),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_code ON teams(code);

-- Table: players
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  player_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_user_id ON players(user_id);

-- Table: sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  current_act INTEGER DEFAULT 1,
  current_station VARCHAR(50),
  solved_stations TEXT[] DEFAULT '{}',
  code_digits TEXT[] DEFAULT ARRAY['', '', '', ''],
  evidence_unlocked TEXT[] DEFAULT '{}',
  suspects_dismissed TEXT[] DEFAULT '{}',
  salconduits_remaining INTEGER DEFAULT 3,
  salconduits_used TEXT[] DEFAULT '{}',
  discovered_at TIMESTAMP WITH TIME ZONE,
  solved_at TIMESTAMP WITH TIME ZONE,
  score INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_team_id ON sessions(team_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Function and trigger for session expiry (90 minutes from start)
CREATE OR REPLACE FUNCTION set_session_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NEW.started_at + INTERVAL '90 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_session_expiry
BEFORE INSERT ON sessions
FOR EACH ROW
EXECUTE FUNCTION set_session_expiry();

-- Table: attempts
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  station_id VARCHAR(50) NOT NULL,
  attempt_number INTEGER NOT NULL,
  answer TEXT,
  is_correct BOOLEAN,
  status attempt_status,
  hints_used TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attempts_session_id ON attempts(session_id);
CREATE INDEX idx_attempts_station_id ON attempts(station_id);

-- Table: results
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  time_elapsed INTEGER NOT NULL,
  moral_choice VARCHAR(20),
  epilogue_id VARCHAR(50),
  finished_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_results_team_id ON results(team_id);

-- Table: master_sessions
CREATE TABLE master_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id VARCHAR(255) NOT NULL,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_master_sessions_master_id ON master_sessions(master_id);

-- Table: solutions_private (SECRET - RLS protected)
CREATE TABLE solutions_private (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id VARCHAR(50) NOT NULL,
  variant session_variant NOT NULL,
  solution JSONB NOT NULL,
  hints JSONB DEFAULT '{"level_1": "", "level_2": "", "level_3": ""}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(station_id, variant)
);

CREATE INDEX idx_solutions_private_station_id ON solutions_private(station_id);
CREATE INDEX idx_solutions_private_variant ON solutions_private(variant);
