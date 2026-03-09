# DDGRS Admin Panel - Setup Guide

## Overview
This guide will help you set up the new React + TypeScript admin panel for the Data-Driven Grievance Redressal System.

## Architecture

```
Current Structure:
├── bot-twilio.js          # WhatsApp bot (keep as-is)
├── dashboard.js           # Old dashboard (will be replaced)
├── database.js            # SQLite (will migrate to Supabase)
└── public/
    └── index.html         # Old UI (will be replaced)

New Structure:
├── bot-twilio.js          # WhatsApp bot (keep, update API endpoints)
├── admin-panel/           # NEW React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Supabase client, utils
│   │   ├── hooks/         # React Query hooks
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── vite.config.ts
└── api/                   # NEW Express API for bot integration
    └── server.js
```

## Step 1: Create React Admin Panel

```bash
# Create new Vite + React + TypeScript project
npm create vite@latest admin-panel -- --template react-ts
cd admin-panel

# Install dependencies
npm install

# Install required packages
npm install @supabase/supabase-js
npm install @tanstack/react-query
npm install react-router-dom
npm install recharts
npm install lucide-react
npm install clsx tailwind-merge

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui
npx shadcn-ui@latest init
```

## Step 2: Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Note your project URL and anon key
3. Create `.env` file in admin-panel:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Database Schema (Supabase SQL Editor)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Grievance actions table
CREATE TABLE grievance_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  grievance_id UUID REFERENCES grievances(id) ON DELETE CASCADE,
  action_by UUID REFERENCES profiles(id),
  admin_name TEXT NOT NULL,
  remarks TEXT,
  new_status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate grievance_id
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

-- Auto-update updated_at
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

-- RLS Policies
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
```

## Step 4: Update WhatsApp Bot Integration

The bot needs to insert grievances into Supabase instead of SQLite.

Install Supabase in main project:
```bash
npm install @supabase/supabase-js
```

Update bot-twilio.js to use Supabase client.

## Step 5: Project Structure

```
admin-panel/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── Layout.tsx       # Main layout with sidebar
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   ├── StatsCard.tsx    # Dashboard stat cards
│   │   ├── CategoryCard.tsx # Category grid cards
│   │   └── GrievanceTable.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── GrievanceList.tsx
│   │   ├── GrievanceDetail.tsx
│   │   ├── Search.tsx
│   │   └── Reports.tsx
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useGrievances.ts
│   │   ├── useStats.ts
│   │   └── useAuth.ts
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── .env
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## Step 6: Run Development

```bash
# Terminal 1: Admin Panel
cd admin-panel
npm run dev
# Opens at http://localhost:5173

# Terminal 2: WhatsApp Bot
cd ..
node bot-twilio.js
# Runs at http://localhost:3001

# Terminal 3: ngrok
ngrok http 3001
```

## Features Checklist

- [ ] Authentication (email/password)
- [ ] Dashboard with stats and charts
- [ ] Grievance list with filters
- [ ] Grievance detail with actions
- [ ] Search by ID
- [ ] Reports & analytics
- [ ] Status workflow
- [ ] Action history timeline
- [ ] Responsive design
- [ ] Media viewer

## Next Steps

1. Create the admin panel using the commands above
2. Set up Supabase project and run SQL schema
3. Build React components
4. Update bot to use Supabase
5. Deploy admin panel (Vercel/Netlify)
6. Deploy bot (Railway/Render)

Would you like me to proceed with creating the full admin panel code?
