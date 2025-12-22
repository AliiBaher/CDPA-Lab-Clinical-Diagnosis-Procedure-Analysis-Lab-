-- Add is_approved column to doctor_profiles table
ALTER TABLE app.doctor_profiles 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Set existing doctors to approved (optional - if you want to approve all existing doctors)
-- UPDATE app.doctor_profiles SET is_approved = TRUE;
