-- Per-set workout logging with last-session memory
CREATE TABLE IF NOT EXISTS workout_sets (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fitness_log_id uuid NOT NULL REFERENCES fitness_logs(id) ON DELETE CASCADE,
  exercise_name  text NOT NULL,
  set_number     int  NOT NULL,
  weight_kg      numeric(6,2),
  reps           int,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS workout_sets_name_date_idx
  ON workout_sets (exercise_name, created_at DESC);

-- Progress photo timeline
CREATE TABLE IF NOT EXISTS progress_photos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url  text NOT NULL,
  photo_type text NOT NULL CHECK (photo_type IN ('front', 'side', 'other')),
  weight_kg  numeric(5,2),
  logged_at  timestamptz NOT NULL DEFAULT now()
);
