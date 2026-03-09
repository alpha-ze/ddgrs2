-- ============================================
-- DDGRS Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grievances table
CREATE TABLE grievances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  grievance_id TEXT UNIQUE NOT NULL, -- GRV-000001 format
  category TEXT NOT NULL CHECK (category IN (
    'Academic', 'Examination', 'Infrastructure', 'Hostel', 
    'Library', 'Administration', 'IT / Network', 
    'Discipline / Harassment', 'Other'
  )),
  description TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  user_id TEXT, -- WhatsApp number or "Anonymous"
  user_name TEXT,
  user_role TEXT,
  user_department TEXT,
  image_url TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'Submitted' CHECK (status IN (
    'Submitted', 'Acknowledged', 'Under Review', 'In Progress',
    'Awaiting Confirmation', 'Resolved', 'Closed', 'Rejected'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grievance actions table (for tracking status changes and admin actions)
CREATE TABLE grievance_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  grievance_id UUID REFERENCES grievances(id) ON DELETE CASCADE,
  action_by UUID REFERENCES profiles(id),
  admin_name TEXT NOT NULL,
  remarks TEXT,
  new_status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-generate grievance_id (GRV-000001 format)
CREATE OR REPLACE FUNCTION generate_grievance_id()
RETURNS TRIGGER AS $$
DECLARE
  next_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(grievance_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_id
  FROM grievances;
  
  NEW.grievance_id := 'GRV-' || LPAD(next_id::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_grievance_id
BEFORE INSERT ON grievances
FOR EACH ROW
WHEN (NEW.grievance_id IS NULL)
EXECUTE FUNCTION generate_grievance_id();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grievances_updated_at
BEFORE UPDATE ON grievances
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_actions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Grievances: Authenticated users can read all
CREATE POLICY "Authenticated users can read grievances"
ON grievances FOR SELECT
TO authenticated
USING (true);

-- Grievances: Authenticated users can insert
CREATE POLICY "Authenticated users can insert grievances"
ON grievances FOR INSERT
TO authenticated
WITH CHECK (true);

-- Grievances: Authenticated users can update
CREATE POLICY "Authenticated users can update grievances"
ON grievances FOR UPDATE
TO authenticated
USING (true);

-- Grievance actions: Authenticated users can insert
CREATE POLICY "Authenticated users can insert actions"
ON grievance_actions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Grievance actions: Authenticated users can read all
CREATE POLICY "Authenticated users can read actions"
ON grievance_actions FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- INDEXES (for better query performance)
-- ============================================

CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_grievances_category ON grievances(category);
CREATE INDEX idx_grievances_created_at ON grievances(created_at DESC);
CREATE INDEX idx_grievance_actions_grievance_id ON grievance_actions(grievance_id);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample grievances
/*
INSERT INTO grievances (category, description, is_anonymous, user_id, status) VALUES
('Academic', 'Unable to access online course materials', false, 'whatsapp:+1234567890', 'Submitted'),
('Infrastructure', 'Broken AC in classroom 301', false, 'whatsapp:+1234567891', 'Under Review'),
('Hostel', 'Water supply issue in Block A', true, 'Anonymous', 'In Progress');
*/
