-- Run this script to apply all pending database changes

-- 1. Add notes column to appointments table
ALTER TABLE app.appointments 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Add is_approved column to doctor_profiles table
ALTER TABLE app.doctor_profiles 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Optional: Approve all existing doctors (uncomment if needed)
-- UPDATE app.doctor_profiles SET is_approved = TRUE;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'app' 
  AND table_name = 'doctor_profiles'
  AND column_name = 'is_approved';

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'app' 
  AND table_name = 'appointments'
  AND column_name = 'notes';
