-- Recorregut de cada equip, només per al màster: cada posició que arriba a
-- /api/ubicacio (com a molt una cada 10 s) es guarda aquí, a més de l'última
-- a v2_teams. El màster en dibuixa el camí al mapa amb els temps de cada fita.
-- Es buida en reiniciar la partida o l'equip.
--
-- Com la resta de v2: RLS activat sense policies, tot passa per API routes
-- amb la service role key.

create table if not exists v2_ubicacions (
  id bigint generated always as identity primary key,
  team_id uuid not null references v2_teams(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  accuracy real,
  created_at timestamptz not null default now()
);

create index if not exists idx_v2_ubicacions_team_created on v2_ubicacions(team_id, created_at);

alter table v2_ubicacions enable row level security;
