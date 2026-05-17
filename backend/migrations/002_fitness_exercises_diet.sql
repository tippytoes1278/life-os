-- Run this in: https://supabase.com/dashboard/project/dhfxjenalattyrgkfdok/sql/new

-- 1. Add notes to existing fitness_logs table
alter table fitness_logs add column if not exists notes text;

-- 2. Individual exercises per workout
create table if not exists workout_exercises (
  id             uuid primary key default gen_random_uuid(),
  fitness_log_id uuid not null references fitness_logs(id) on delete cascade,
  name           text not null,
  sets           smallint,
  reps           smallint,
  weight_kg      numeric(5,1),
  order_index    smallint not null default 0,
  created_at     timestamptz not null default now()
);

-- 3. Diet / meal logging
create table if not exists diet_logs (
  id         uuid primary key default gen_random_uuid(),
  meal_name  text not null,
  protein_g  numeric(5,1) not null check (protein_g >= 0),
  logged_at  timestamptz not null default now(),
  created_at timestamptz not null default now()
);
