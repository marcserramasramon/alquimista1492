-- Arreglar columnes que manquen a v2_teams (migració 15 probablement no s'ha executat).
alter table v2_teams
  add column if not exists slug text unique,
  add column if not exists claimed_at timestamptz,
  add column if not exists session_nonce uuid;

-- Poblar els equips fixos si no existeixen.
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
