-- Ampliació de 8 a 25 equips (content/public/equips.ts).
-- Els 8 primers (EQ0001–EQ0008) ja hi són per les migracions 15 i 27.
-- Aquí s'afegeixen EQ0009–EQ0025 amb el mateix `slug` que la llista de l'app.
-- `on conflict (slug) do nothing`: és segura de tornar a executar.

insert into v2_teams (code, name, slug) values
  ('EQ0009', 'Els Fills del Sol Negre', 'sol-negre'),
  ('EQ0010', 'La Confraria de la Lluna de Plata', 'lluna-plata'),
  ('EQ0011', 'Els Guardians de la Sal', 'estrella-sal'),
  ('EQ0012', 'La Clau del Secret', 'clau-secreta'),
  ('EQ0013', 'Els Cercadors de la Pedra', 'pedra-filosofal'),
  ('EQ0014', 'L''Ampolla Verda', 'ampolla-verda'),
  ('EQ0015', 'El Llibre Tancat', 'llibre-tancat'),
  ('EQ0016', 'La Corona de Cendra', 'corona-cendra'),
  ('EQ0017', 'Els Guardians de l''Espasa Quieta', 'espasa-quieta'),
  ('EQ0018', 'L''Àncora Fosca', 'ancora-fosca'),
  ('EQ0019', 'Les Tres Fulles', 'fulla-tres'),
  ('EQ0020', 'La Torre de Vigia', 'torre-vigia'),
  ('EQ0021', 'Els Ferrers de la Corretja', 'corretja-ferro'),
  ('EQ0022', 'La Flama Blava', 'flama-blava'),
  ('EQ0023', 'L''Arbre Ocult', 'arbre-ocult'),
  ('EQ0024', 'L''Ull Clar', 'ull-clar'),
  ('EQ0025', 'El Llum Ferit', 'llum-ferit')
on conflict (slug) do nothing;
