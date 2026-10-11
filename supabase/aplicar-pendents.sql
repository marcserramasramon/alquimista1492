-- Aplicar al SQL Editor de Supabase (una sola execució).
-- Conté les migracions 20260928000020 (v2_avisos) i 20260928000021
-- (v2_master_location.equips_sharing), tal com són a supabase/migrations/.
-- És idempotent: es pot executar més d'una vegada sense error.
-- No toca cap dada existent.

begin;

-- ---------------------------------------------------------------------------
-- 20260928000020_v2_avisos.sql
-- Avisos que un equip envia al màster (botó "?" al mapa).
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 20260928000021_v2_equips_veuen_equips.sql
-- Interruptor global: els equips es veuen entre ells al mapa.
-- ---------------------------------------------------------------------------

alter table v2_master_location
  add column if not exists equips_sharing boolean not null default false;

commit;

-- ---------------------------------------------------------------------------
-- Comprovació (ha de retornar 2 files: v2_avisos i equips_sharing)
-- ---------------------------------------------------------------------------
select 'v2_avisos' as element, to_regclass('public.v2_avisos') is not null as existeix
union all
select 'v2_master_location.equips_sharing',
       exists (
         select 1 from information_schema.columns
         where table_name = 'v2_master_location' and column_name = 'equips_sharing'
       );
