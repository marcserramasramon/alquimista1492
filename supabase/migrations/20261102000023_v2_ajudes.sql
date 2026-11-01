-- Ajudes que un equip demana al màster per una fita (element) que encara no té: el màster les
-- desbloqueja des del seu panell i el progrés de l'equip queda com si la fita estigués aconseguida.
--
-- Com la resta de taules v2_: RLS activat i SENSE policies. Només hi accedeix el servidor
-- (service role) des de app/api/.

create table if not exists v2_ajudes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references v2_teams(id) on delete cascade,
  element text not null check (element in ('aigua', 'terra', 'foc', 'aire', 'anima')),
  created_at timestamptz not null default now(),
  resolta_at timestamptz,
  unique (team_id, element)
);

create index if not exists idx_v2_ajudes_pendents
  on v2_ajudes(created_at)
  where resolta_at is null;

alter table v2_ajudes enable row level security;
