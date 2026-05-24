-- Add carbohydrate and fat tracking to diet logs
ALTER TABLE diet_logs
  ADD COLUMN IF NOT EXISTS carbs_g numeric(6,1) CHECK (carbs_g >= 0),
  ADD COLUMN IF NOT EXISTS fat_g   numeric(6,1) CHECK (fat_g   >= 0);
