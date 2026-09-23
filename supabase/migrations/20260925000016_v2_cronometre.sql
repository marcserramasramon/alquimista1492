-- Compte enrere de la partida (com a l'app antiga): el màster tria la durada,
-- prem "Iniciar partida" i el temps corre per a tothom fins a `ends_at`.
-- El màster pot afegir o treure minuts movent `ends_at`.
--
-- `guardians_at`: el frare ha consagrat l'equip com a Guardians del Secret
-- (el LED del Gresol s'ha encès i el màster ho activa des del seu mòbil).
-- L'equip passa a la pantalla final.

alter table v2_partida
  add column if not exists duration_minutes integer check (duration_minutes between 1 and 600),
  add column if not exists ends_at timestamptz;

alter table v2_teams
  add column if not exists guardians_at timestamptz;
