-- Add missing columns to app_cases table
ALTER TABLE app.app_cases 
ADD COLUMN IF NOT EXISTS gender character varying(10) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS dob timestamp without time zone NOT NULL DEFAULT NOW();
