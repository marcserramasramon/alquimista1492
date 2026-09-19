-- Realtime + descart de sospitosos
--
-- 1) Els mòbils d'un mateix equip han de veure sempre el mateix estat
--    (CLAUDE.md, regla 5). Fins ara només `game_config` estava donat d'alta
--    a la publicació de Realtime: cap canvi a l'estat de joc (fites
--    resoltes, proves desbloquejades, sessió, equip, salconduits) arribava
--    en temps real als altres mòbils de l'equip -- calia refrescar la
--    pàgina per veure'l.
-- 2) `sessions.suspects_dismissed` ja existia a l'esquema però mai s'usava:
--    permet marcar sospitosos com a descartats des del Quadern.

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE team_stations;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE team_evidences;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE teams;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE passes;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
