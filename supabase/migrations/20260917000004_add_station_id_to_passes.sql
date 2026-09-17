-- Add station_id column to passes table
-- This allows QR tokens to be associated with specific stations

ALTER TABLE passes
ADD COLUMN station_id VARCHAR(50);

-- Add comment explaining the column
COMMENT ON COLUMN passes.station_id IS 'Station that this pass token is associated with (used for station-specific QR codes)';

-- Create a check constraint to ensure station_id is set when pass is created
ALTER TABLE passes
ADD CONSTRAINT passes_station_id_required CHECK (station_id IS NOT NULL);

-- Create index for efficient lookups
CREATE INDEX idx_passes_station_id ON passes(station_id);
