-- Missatges del màster als equips (pop-up al mòbil de l'equip).
--
-- Un missatge "a tots" es desa com una fila per equip: així cada equip el
-- marca com a llegit pel seu compte i el màster veu qui l'ha llegit.
-- `clau` és l'id del missatge preconfigurat (content/public/missatgesMaster.ts)
-- o null si és text lliure; `titol` i `text` en guarden una còpia tal com es
-- va enviar, per si després es canvia el fitxer de contingut.
--
-- Com la resta de taules v2_: RLS activat i SENSE policies. Només hi accedeix
-- el servidor (service role) des de app/api/.

create table if not exists v2_missatges (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references v2_teams(id) on delete cascade,
  clau text,
  titol text not null,
  text text not null check (char_length(text) between 1 and 500),
  created_at timestamptz not null default now(),
  llegit_at timestamptz
);

create index if not exists idx_v2_missatges_team_pendents
  on v2_missatges(team_id, created_at)
  where llegit_at is null;

create index if not exists idx_v2_missatges_created_at on v2_missatges(created_at desc);

alter table v2_missatges enable row level security;
