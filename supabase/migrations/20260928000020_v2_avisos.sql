-- Avisos que un equip envia al màster (botó "?" al mapa): equip → màster,
-- una sola direcció, sense fil de conversa (no és el xat esborrany de
-- docs/app-nova.md §7bis.3, que segueix PENDENT i sense migració).
--
-- Simètrica a v2_missatges (màster → equip) però sempre text lliure: no hi ha
-- claus preconfigurades perquè l'equip pot escriure qualsevol cosa.
--
-- Com la resta de taules v2_: RLS activat i SENSE policies. Només hi accedeix
-- el servidor (service role) des de app/api/.

create table if not exists v2_avisos (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references v2_teams(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 300),
  created_at timestamptz not null default now(),
  llegit_at timestamptz
);

create index if not exists idx_v2_avisos_pendents
  on v2_avisos(created_at)
  where llegit_at is null;

create index if not exists idx_v2_avisos_created_at on v2_avisos(created_at desc);

alter table v2_avisos enable row level security;
