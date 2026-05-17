-- Add body weight tracking to check-ins
ALTER TABLE checkins
  ADD COLUMN IF NOT EXISTS weight_kg numeric(5,2) CHECK (weight_kg > 0);

-- Add calorie tracking to diet logs
ALTER TABLE diet_logs
  ADD COLUMN IF NOT EXISTS calories integer CHECK (calories >= 0);
