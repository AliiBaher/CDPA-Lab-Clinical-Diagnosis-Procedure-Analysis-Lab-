-- Add notes column to appointments table
ALTER TABLE app.appointments 
ADD COLUMN IF NOT EXISTS notes TEXT;
