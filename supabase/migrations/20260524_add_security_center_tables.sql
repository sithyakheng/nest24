-- Add security fields for seller profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS security_pin TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS minefield_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS minefield_message TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS firewall_enabled BOOLEAN DEFAULT false;

-- Create device sessions table
CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device_name TEXT,
  browser TEXT,
  ip_address TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_current BOOLEAN DEFAULT false
);

-- Create activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT,
  device TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on tables
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for device sessions
CREATE POLICY IF NOT EXISTS "Users can view own devices"
ON device_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own devices"
ON device_sessions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own devices"
ON device_sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own devices"
ON device_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS policies for activity logs
CREATE POLICY IF NOT EXISTS "Users can view own activity"
ON activity_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own activity logs"
ON activity_logs FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own activity"
ON activity_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);
