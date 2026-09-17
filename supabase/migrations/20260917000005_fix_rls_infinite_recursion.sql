-- Fix infinite recursion in RLS policies for players and teams
-- By using a SECURITY DEFINER function, queries inside the policy bypass RLS, breaking the recursion loop.

-- 1. Helper function to get current user's team_id without triggering RLS recursion
CREATE OR REPLACE FUNCTION get_current_user_team_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT team_id FROM players WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 2. Drop recursive policies on players
DROP POLICY IF EXISTS "players_select_own_team_players" ON players;
DROP POLICY IF EXISTS "player_select_own_record" ON players;

-- Allow player to select their own record
CREATE POLICY "player_select_own_record"
ON players
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Allow player to select teammates using the SECURITY DEFINER function (no recursion)
CREATE POLICY "players_select_own_team_players"
ON players
FOR SELECT
USING (
  team_id = get_current_user_team_id()
);

-- 3. Drop and recreate policy on teams to use SECURITY DEFINER function
DROP POLICY IF EXISTS "players_select_own_team" ON teams;

CREATE POLICY "players_select_own_team"
ON teams
FOR SELECT
USING (
  id = get_current_user_team_id()
);

-- 4. Update sessions policy for players to use SECURITY DEFINER function
DROP POLICY IF EXISTS "players_select_own_session" ON sessions;

CREATE POLICY "players_select_own_session"
ON sessions
FOR SELECT
USING (
  id IN (
    SELECT session_id FROM teams WHERE id = get_current_user_team_id()
  )
);
