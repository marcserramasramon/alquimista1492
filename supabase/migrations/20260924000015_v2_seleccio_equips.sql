-- Entrada per icona: hi ha 8 equips fixos (content/public/equips.ts) i cada
-- mòbil n'agafa un tocant-ne la icona. Ja no hi ha codi ni nom per escriure.
--
-- - `slug`: identificador de l'equip a content/public/equips.ts.
-- - `claimed_at`: quan un mòbil l'ha agafat. Mentre no és null, cap altre
--   mòbil el pot triar (el servidor ho fa amb un UPDATE atòmic).
-- - `session_nonce`: es regenera en cada presa. La cookie de l'equip el porta
--   i el servidor el compara: quan el màster allibera l'equip, el mòbil antic
--   en perd l'accés.
--
-- v2_partida és una fila única amb l'inici global de la partida: el màster
-- prem "Iniciar partida" i tots els equips surten de la pantalla d'espera alhora.

alter table v2_teams
  add column if not exists slug text unique,
  add column if not exists claimed_at timestamptz,
  add column if not exists session_nonce uuid;

create table if not exists v2_partida (
  id smallint primary key default 1 check (id = 1),
  started_at timestamptz
);

insert into v2_partida (id) values (1) on conflict (id) do nothing;

alter table v2_partida enable row level security;

-- Els codis ja no s'escriuen enlloc, però la columna és obligatòria i única.
-- Porten 0 i 1, que el generador antic no fa servir: no poden col·lidir.
insert into v2_teams (code, name, slug) values
  ('EQ0001', 'L''Orde del Crisol Fosc', 'crisol-fosc'),
  ('EQ0002', 'Els Corbs de Mercuri', 'corbs-mercuri'),
  ('EQ0003', 'La Germandat de l''Alambí Negre', 'alambi-negre'),
  ('EQ0004', 'Forjadors de Plom', 'forjadors-plom'),
  ('EQ0005', 'El Cercle de l''Ouroboros', 'ouroboros'),
  ('EQ0006', 'Sang i Sofre', 'sang-sofre'),
  ('EQ0007', 'Custodis del Magnum Opus', 'magnum-opus'),
  ('EQ0008', 'Els Homuncles de Cendra', 'homuncles-cendra')
on conflict (slug) do nothing;
