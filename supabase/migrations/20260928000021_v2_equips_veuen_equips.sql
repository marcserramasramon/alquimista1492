-- El màster pot fer que tots els equips es vegin entre ells al mapa
-- (docs/app-nova.md §7ter). Interruptor global, no per equip.

alter table v2_master_location
  add column if not exists equips_sharing boolean not null default false;
