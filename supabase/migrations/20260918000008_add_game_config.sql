-- Global game clock: single source of truth for "Partida Única".
-- The countdown must never start on its own — only when the master explicitly
-- starts the game with a chosen duration.

CREATE TABLE IF NOT EXISTS game_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'finished')),
  duration_minutes INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT game_config_singleton CHECK (id = 1)
);

INSERT INTO game_config (id, status)
VALUES (1, 'pending')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE game_config ENABLE ROW LEVEL SECURITY;

-- Players (anon) and master must be able to read the clock to render the countdown.
CREATE POLICY "game_config_public_read" ON game_config
  FOR SELECT
  USING (true);

-- No insert/update/delete policy for anon/authenticated: only the service role
-- (used by /api/master/* routes) can change the clock, per RLS default-deny.

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE game_config;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
