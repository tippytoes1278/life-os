-- Run this in: https://supabase.com/dashboard/project/dhfxjenalattyrgkfdok/sql/new

create table if not exists checkins (
  id          uuid primary key default gen_random_uuid(),
  mood        smallint not null check (mood between 1 and 5),
  energy      smallint not null check (energy between 1 and 5),
  wins        text[] not null default '{}',
  logged_at   timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create table if not exists habits (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists habit_completions (
  id             uuid primary key default gen_random_uuid(),
  habit_id       uuid not null references habits(id) on delete cascade,
  completed_date date not null,
  created_at     timestamptz not null default now(),
  unique (habit_id, completed_date)
);

create table if not exists fitness_logs (
  id               uuid primary key default gen_random_uuid(),
  type             text not null check (type in ('Push', 'Pull', 'Legs', 'Cardio', 'Rest')),
  duration_minutes smallint check (duration_minutes > 0),
  body_weight_kg   numeric(5,1) check (body_weight_kg > 0),
  logged_at        timestamptz not null default now(),
  created_at       timestamptz not null default now()
);
