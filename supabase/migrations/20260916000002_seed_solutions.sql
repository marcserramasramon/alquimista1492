-- Seed initial solutions and stations data for El Traïdor de la Guixa
-- Populates solutions_private for variants A, B, C

INSERT INTO solutions_private (station_id, variant, solution, hints) VALUES
-- Joc 1: Serrat de les Bruixes (Polybius Square)
('serrat-bruixes', 'A', 
  '{"answer": "SAP DE LLETRA", "digit": 4, "evidence": "fire_beacons", "suspects_dismissed": ["Pere", "Joan"]}'::jsonb,
  '{"level_1": "Comença per S", "level_2": "Cada parell de fogueres indica fila i columna al tauler de 5x5", "level_3": "Desxifra el missatge lletra a lletra amb el quadrat de Polibi"}'::jsonb),
('serrat-bruixes', 'B', 
  '{"answer": "ESCRIU", "digit": 4, "evidence": "fire_beacons", "suspects_dismissed": ["Pere", "Joan"]}'::jsonb,
  '{"level_1": "Comença per E", "level_2": "Cada parell de fogueres indica fila i columna al tauler de 5x5", "level_3": "Desxifra el missatge lletra a lletra amb el quadrat de Polibi"}'::jsonb),
('serrat-bruixes', 'C', 
  '{"answer": "LLEGEIX", "digit": 4, "evidence": "fire_beacons", "suspects_dismissed": ["Pere", "Joan"]}'::jsonb,
  '{"level_1": "Comença per L", "level_2": "Cada parell de fogueres indica fila i columna al tauler de 5x5", "level_3": "Desxifra el missatge lletra a lletra amb el quadrat de Polibi"}'::jsonb),

-- Joc 2: Font del Ferro (Date Calculation)
('font-ferro', 'A', 
  '{"answer": "1705-05-12", "day": 12, "digit": 2, "evidence": "water_ledger", "suspects_dismissed": ["Marianna"], "waterskinCount": 2}'::jsonb,
  '{"level_1": "Revisa les dates de registre de recollida d''aigua a la font", "level_2": "Calcula quants dies abans o després es va fer la càrrega de dos càntirs", "level_3": "La data exacta correspon al 12 de maig de 1705"}'::jsonb),
('font-ferro', 'B', 
  '{"answer": "1705-05-11", "day": 11, "digit": 2, "evidence": "water_ledger", "suspects_dismissed": ["Marianna"], "waterskinCount": 2}'::jsonb,
  '{"level_1": "Revisa les dates de registre de recollida d''aigua a la font", "level_2": "Calcula quants dies abans o després es va fer la càrrega de dos càntirs", "level_3": "La data exacta correspon a l''11 de maig de 1705"}'::jsonb),
('font-ferro', 'C', 
  '{"answer": "1705-05-13", "day": 13, "digit": 2, "evidence": "water_ledger", "suspects_dismissed": ["Marianna"], "waterskinCount": 2}'::jsonb,
  '{"level_1": "Revisa les dates de registre de recollida d''aigua a la font", "level_2": "Calcula quants dies abans o després es va fer la càrrega de dos càntirs", "level_3": "La data exacta correspon al 13 de maig de 1705"}'::jsonb),

-- Joc 3: Planes Bones (Map Navigation)
('planes-bones', 'A', 
  '{"answer": "02:15", "time": "02:15", "digit": 3, "evidence": "patrol_route", "suspects_dismissed": ["Isidre"]}'::jsonb,
  '{"level_1": "Segueix la ruta marcada al mapa de patrulla", "level_2": "Suma el temps estimat de trajecte i l''estada a la masia", "level_3": "L''hora calculada de pas és a les 02:15"}'::jsonb),
('planes-bones', 'B', 
  '{"answer": "01:15", "time": "01:15", "digit": 3, "evidence": "patrol_route", "suspects_dismissed": ["Isidre"]}'::jsonb,
  '{"level_1": "Segueix la ruta marcada al mapa de patrulla", "level_2": "Suma el temps estimat de trajecte i l''estada a la masia", "level_3": "L''hora calculada de pas és a les 01:15"}'::jsonb),
('planes-bones', 'C', 
  '{"answer": "03:15", "time": "03:15", "digit": 3, "evidence": "patrol_route", "suspects_dismissed": ["Isidre"]}'::jsonb,
  '{"level_1": "Segueix la ruta marcada al mapa de patrulla", "level_2": "Suma el temps estimat de trajecte i l''estada a la masia", "level_3": "L''hora calculada de pas és a les 03:15"}'::jsonb),

-- Joc 4: Cementiri (Text Comparison)
('cementiri', 'A', 
  '{"answer": "Corminas", "wrong": "Corminas", "correct": "Joseph Coromines", "digit": 1, "evidence": "tombstone", "suspects_dismissed": ["Anton"]}'::jsonb,
  '{"level_1": "Compara el nom inscrit a la làpida amb el llibre parroquial", "level_2": "Cerca la falta ortogràfica o el cognom deformat", "level_3": "El cognom mal escrit a la làpida és Corminas"}'::jsonb),
('cementiri', 'B', 
  '{"answer": "Sarrat", "wrong": "Sarrat", "correct": "Maria Serrat", "digit": 1, "evidence": "tombstone", "suspects_dismissed": ["Anton"]}'::jsonb,
  '{"level_1": "Compara el nom inscrit a la làpida amb el llibre parroquial", "level_2": "Cerca la falta ortogràfica o el cognom deformat", "level_3": "El cognom mal escrit a la làpida és Sarrat"}'::jsonb),
('cementiri', 'C', 
  '{"answer": "Puch", "wrong": "Puch", "correct": "Antoni Puig", "digit": 1, "evidence": "tombstone", "suspects_dismissed": ["Anton"]}'::jsonb,
  '{"level_1": "Compara el nom inscrit a la làpida amb el llibre parroquial", "level_2": "Cerca la falta ortogràfica o el cognom deformat", "level_3": "El cognom mal escrit a la làpida és Puch"}'::jsonb),

-- Joc 5: Pla de Masset (Control Checkpoint)
('pla-masset-control', 'A', '{"answer": "4231", "digit": null}'::jsonb, '{"level_1": "Introdueix els 4 dígits recollits a l''Acte 1"}'::jsonb),
('pla-masset-control', 'B', '{"answer": "4231", "digit": null}'::jsonb, '{"level_1": "Introdueix els 4 dígits recollits a l''Acte 1"}'::jsonb),
('pla-masset-control', 'C', '{"answer": "4231", "digit": null}'::jsonb, '{"level_1": "Introdueix els 4 dígits recollits a l''Acte 1"}'::jsonb),

-- Joc 6: Pla de Masset (Accusation)
('pla-masset-accusation', 'A', '{"answer": "bernat", "traitor": "bernat", "minEvidence": 3}'::jsonb, '{"level_1": "Revisa qui dels sospitosos no ha estat descartat"}'::jsonb),
('pla-masset-accusation', 'B', '{"answer": "bernat", "traitor": "bernat", "minEvidence": 3}'::jsonb, '{"level_1": "Revisa qui dels sospitosos no ha estat descartat"}'::jsonb),
('pla-masset-accusation', 'C', '{"answer": "bernat", "traitor": "bernat", "minEvidence": 3}'::jsonb, '{"level_1": "Revisa qui dels sospitosos no ha estat descartat"}'::jsonb),

-- Joc 7: Rectoria (Caixa d''Almoines)
('rectoria-caixa', 'A', '{"answer": "4231", "seal": "A", "phrase": "L''alba ve de Vic"}'::jsonb, '{"level_1": "El codi és l''ordre dels 4 elements: Foc, Pedra, Aire, Aigua"}'::jsonb),
('rectoria-caixa', 'B', '{"answer": "4231", "seal": "A", "phrase": "L''alba ve de Vic"}'::jsonb, '{"level_1": "El codi és l''ordre dels 4 elements: Foc, Pedra, Aire, Aigua"}'::jsonb),
('rectoria-caixa', 'C', '{"answer": "4231", "seal": "A", "phrase": "L''alba ve de Vic"}'::jsonb, '{"level_1": "El codi és l''ordre dels 4 elements: Foc, Pedra, Aire, Aigua"}'::jsonb),

-- Joc 8: Campanar (Sometent)
('campanar-sometent', 'A', '{"answer": "4-2-3-1", "code": "4-2-3-1"}'::jsonb, '{"level_1": "Seguiu la rima tradicional del poble"}'::jsonb),
('campanar-sometent', 'B', '{"answer": "4-2-3-1", "code": "4-2-3-1"}'::jsonb, '{"level_1": "Seguiu la rima tradicional del poble"}'::jsonb),
('campanar-sometent', 'C', '{"answer": "4-2-3-1", "code": "4-2-3-1"}'::jsonb, '{"level_1": "Seguiu la rima tradicional del poble"}'::jsonb)
ON CONFLICT (station_id, variant) DO UPDATE SET solution = EXCLUDED.solution, hints = EXCLUDED.hints;

-- Equip de prova per a desenvolupament
INSERT INTO teams (code, variant, name)
VALUES ('TEST01', 'A', 'Equip de Prova')
ON CONFLICT (code) DO NOTHING;
