-- Morning check-ins have mood+energy; evening check-ins do not.
-- Drop the NOT NULL constraints so both log_types can share the table.
ALTER TABLE checkins ALTER COLUMN mood   DROP NOT NULL;
ALTER TABLE checkins ALTER COLUMN energy DROP NOT NULL;
