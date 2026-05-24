-- Migration 008: add category to diet_logs
ALTER TABLE diet_logs
  ADD COLUMN IF NOT EXISTS category text;
