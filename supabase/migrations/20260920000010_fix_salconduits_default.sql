-- L'equip només disposa de 2 salconduits (permisos de pas), no 3.
ALTER TABLE sessions ALTER COLUMN salconduits_remaining SET DEFAULT 2;

UPDATE sessions
SET salconduits_remaining = 2
WHERE salconduits_remaining > 2;
