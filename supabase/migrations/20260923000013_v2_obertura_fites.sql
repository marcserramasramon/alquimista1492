-- Obertura de les fites: una fita elemental no es pot jugar fins que l'equip
-- hi arriba (GPS dins el radi) o escaneja/entra el codi del QR del cartell.
-- El servidor en desa quan i com es va obrir.

alter table v2_progres
  add column if not exists oberta_at timestamptz,
  add column if not exists obertura text check (obertura in ('gps', 'qr', 'codi'));
