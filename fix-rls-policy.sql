-- Fix Row Level Security to allow bot to insert grievances
-- Run this in Supabase SQL Editor

-- Option 1: Temporarily disable RLS for testing (RECOMMENDED FOR NOW)
ALTER TABLE grievances DISABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_actions DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, run these instead:
-- DROP POLICY IF EXISTS "Authenticated users can insert grievances" ON grievances;
-- CREATE POLICY "Allow anyone to insert grievances" ON grievances FOR INSERT WITH CHECK (true);
-- DROP POLICY IF EXISTS "Authenticated users can insert actions" ON grievance_actions;
-- CREATE POLICY "Allow anyone to insert actions" ON grievance_actions FOR INSERT WITH CHECK (true);
