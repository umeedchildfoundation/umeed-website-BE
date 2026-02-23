-- Add title and rsvp_enabled columns to sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS rsvp_enabled boolean DEFAULT false;

-- Create session_rsvps table
CREATE TABLE IF NOT EXISTS session_rsvps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  volunteer_id uuid REFERENCES volunteers(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('yes', 'no', 'maybe')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, volunteer_id)
);

-- Policies
-- Drop existing policies to allow re-running the script without errors
DROP POLICY IF EXISTS "Volunteers can view their own RSVPs" ON session_rsvps;
DROP POLICY IF EXISTS "Volunteers can manage their own RSVPs" ON session_rsvps;
DROP POLICY IF EXISTS "Admins can view all RSVPs" ON session_rsvps;

-- Volunteers can view their own RSVPs
CREATE POLICY "Volunteers can view their own RSVPs" ON session_rsvps
  FOR SELECT USING (auth.uid()::text IN (SELECT user_id::text FROM volunteers WHERE id::text = volunteer_id::text));

-- Volunteers can insert/update their own RSVPs
CREATE POLICY "Volunteers can manage their own RSVPs" ON session_rsvps
  FOR ALL USING (auth.uid()::text IN (SELECT user_id::text FROM volunteers WHERE id::text = volunteer_id::text));

-- Admins can view all RSVPs
CREATE POLICY "Admins can view all RSVPs" ON session_rsvps
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );
