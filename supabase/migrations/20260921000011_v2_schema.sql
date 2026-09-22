-- App v2 (versió senzilla): esquema nou i independent, prefix v2_.
-- No toca ni depèn de cap taula de l'app v1.
--
-- Disseny: 1 sol mòbil per equip. Cap client parla mai directament amb
-- Supabase (ni jugadors ni màster): tot passa per API routes amb la
-- service role key. Per això RLS es deixa activat sense policies:
-- denegació per defecte és exactament el comportament desitjat.

create table if not exists v2_teams (
  id uuid primary key default gen_random_uuid(),
  code varchar(6) unique not null,
  name text not null,
  status text not null default 'espera' check (status in ('espera', 'joc', 'final')),
  started_at timestamptz,
  finished_at timestamptz,
  coartada_revelada_at timestamptz,
  campanes_fetes_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_v2_teams_code on v2_teams(code);

create table if not exists v2_progres (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references v2_teams(id) on delete cascade,
  estacio_id text not null,
  resolta boolean not null default false,
  intents integer not null default 0,
  pistes_usades integer not null default 0,
  resolta_at timestamptz,
  created_at timestamptz not null default now(),
  unique (team_id, estacio_id)
);

create index if not exists idx_v2_progres_team_id on v2_progres(team_id);

alter table v2_teams enable row level security;
alter table v2_progres enable row level security;
