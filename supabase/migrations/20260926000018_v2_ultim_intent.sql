-- Hora de l'última resposta enviada a cada fita. /api/resposta en deixa passar
-- com a molt una cada 3 s per equip i fita: amb respostes d'una xifra, sense
-- aquest límit es podrien provar totes en pocs segons.

alter table v2_progres add column if not exists ultim_intent_at timestamptz;
