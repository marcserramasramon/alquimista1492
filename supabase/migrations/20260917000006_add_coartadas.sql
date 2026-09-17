-- Add coartadas (alibis) system for players to memorize and maintain consistent stories
-- Used in Act II (Pla de Masset) where the Emissary interrogates teams
-- Coartadas are distributed as 4 phrases split cyclically among players (1,2,3,4,1,2,3,4,...)

-- Table: team_coartadas
-- Stores the coartada template assigned to each team
CREATE TABLE team_coartadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  coartada_id VARCHAR(50) NOT NULL,
  -- coartada_id maps to templates: A (Midwife), B (Medicine), C (Notify Rector), D (Lost Person), E (Summon Master)
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_team_coartadas_team_id ON team_coartadas(team_id);
CREATE INDEX idx_team_coartadas_assigned_at ON team_coartadas(assigned_at);

-- Table: player_coartada_frases
-- Stores the individual phrases each player must memorize and recite
-- A team's coartada is split into 4 phrases, distributed cyclically (1,2,3,4,1,2,3,4,...)
CREATE TABLE player_coartada_frases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_index INTEGER NOT NULL,
  -- player_index: position in team (0-based), 0 to N-1 where N = team size
  frase_number INTEGER NOT NULL,
  -- frase_number: 1-4, each player gets one frase assigned cyclically
  frase_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, player_index, frase_number)
);

CREATE INDEX idx_player_coartada_frases_team_id ON player_coartada_frases(team_id);
CREATE INDEX idx_player_coartada_frases_player_index ON player_coartada_frases(player_index);

-- Enable RLS on both tables
ALTER TABLE team_coartadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_coartada_frases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_coartadas
-- Players see only their team's coartada
CREATE POLICY "players_select_own_team_coartada"
ON team_coartadas
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

-- Master (service_role) can see all coartadas
CREATE POLICY "master_select_all_coartadas"
ON team_coartadas
FOR SELECT
TO service_role
USING (TRUE);

-- Master (service_role) can insert coartadas
CREATE POLICY "master_insert_coartadas"
ON team_coartadas
FOR INSERT
TO service_role
WITH CHECK (TRUE);

-- Master (service_role) can update coartadas
CREATE POLICY "master_update_coartadas"
ON team_coartadas
FOR UPDATE
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Allow system to insert (for signup/session initialization)
CREATE POLICY "allow_insert_team_coartadas"
ON team_coartadas
FOR INSERT
WITH CHECK (TRUE);

-- RLS Policies for player_coartada_frases
-- Players see only their team's phrases
CREATE POLICY "players_select_own_coartada_frases"
ON player_coartada_frases
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM players WHERE user_id = auth.uid()
  )
);

-- Master (service_role) can see all phrases
CREATE POLICY "master_select_all_coartada_frases"
ON player_coartada_frases
FOR SELECT
TO service_role
USING (TRUE);

-- Master (service_role) can insert phrases
CREATE POLICY "master_insert_coartada_frases"
ON player_coartada_frases
FOR INSERT
TO service_role
WITH CHECK (TRUE);

-- Master (service_role) can update phrases
CREATE POLICY "master_update_coartada_frases"
ON player_coartada_frases
FOR UPDATE
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Allow system to insert (for session initialization)
CREATE POLICY "allow_insert_coartada_frases"
ON player_coartada_frases
FOR INSERT
WITH CHECK (TRUE);
