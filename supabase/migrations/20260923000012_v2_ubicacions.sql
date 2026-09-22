-- Ubicació en viu (docs/app-nova.md §7ter): el màster veu els equips i els
-- equips veuen el màster. Només l'última posició, sense historial.
-- Com la resta de v2: RLS activat sense policies, tot passa per API routes
-- amb la service role key.

alter table v2_teams
  add column if not exists last_lat double precision,
  add column if not exists last_lng double precision,
  add column if not exists last_accuracy real,
  add column if not exists last_location_at timestamptz;

-- Fila única amb la posició del màster i si la comparteix.
create table if not exists v2_master_location (
  id smallint primary key default 1 check (id = 1),
  lat double precision,
  lng double precision,
  accuracy real,
  sharing boolean not null default false,
  updated_at timestamptz
);

insert into v2_master_location (id) values (1) on conflict (id) do nothing;

alter table v2_master_location enable row level security;
