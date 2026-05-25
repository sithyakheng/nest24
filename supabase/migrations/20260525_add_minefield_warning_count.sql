-- Add minefield warning count to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS minefield_warning_count INTEGER DEFAULT 0;
