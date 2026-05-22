-- Morning / evening check-in columns
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS log_type    text    DEFAULT 'legacy';
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS todos       jsonb;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS day_rating  int     CHECK (day_rating BETWEEN 1 AND 10);
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS improvement text;
