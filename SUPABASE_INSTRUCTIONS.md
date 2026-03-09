# Supabase Setup Instructions

## Step 1: Get Your Supabase Credentials

From your Supabase dashboard screenshot, you need to copy:

1. **Project URL**: Found at the top of the API settings page
   - Format: `https://xxxxx.supabase.co`

2. **Anon/Public Key**: The publishable key shown in your screenshot
   - Starts with `eyJ...`
   - This is the long string under "Publishable key"

## Step 2: Update Environment File

1. Open `admin-panel/.env` file
2. Replace the placeholder values with your actual credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Run Database Schema

1. In your Supabase dashboard, click on **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `SUPABASE_SETUP.sql` file
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)

You should see: "Success. No rows returned"

## Step 4: Create Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: your-email@example.com
   - Password: (create a strong password)
   - Auto Confirm User: ✓ (check this)
4. Click **Create user**

## Step 5: Create Admin Profile

After creating the user, you need to add their profile:

1. Go to **SQL Editor**
2. Run this query (replace the email with your admin email):

```sql
INSERT INTO profiles (id, full_name, email)
SELECT id, 'Admin Name', 'your-email@example.com'
FROM auth.users
WHERE email = 'your-email@example.com';
```

## Step 6: Verify Setup

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - profiles
   - grievances
   - grievance_actions

## Step 7: Restart Admin Panel

```bash
cd admin-panel
npm run dev
```

Now visit http://localhost:5173/ and login with your admin credentials!

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `admin-panel/.env` file exists
- Check that the values don't have quotes around them
- Restart the dev server after updating .env

### Error: "Invalid login credentials"
- Make sure you created the user in Supabase Authentication
- Check that "Auto Confirm User" was enabled
- Try resetting the password in Supabase dashboard

### Tables not showing up
- Make sure you ran the entire SQL script
- Check for errors in the SQL Editor
- Verify the UUID extension is enabled

## Next Steps

Once the admin panel is working:

1. **Test the interface**: Login and explore the dashboard
2. **Update the bot**: Modify `bot-twilio.js` to insert grievances into Supabase
3. **Migrate existing data**: Move SQLite grievances to Supabase (optional)

Need help with any step? Let me know!
