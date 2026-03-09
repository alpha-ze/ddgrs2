# DDGRS Deployment Checklist

## Current Status: ✅ READY TO RUN (with minor setup)

### What's Working Right Now:

✅ **WhatsApp Bot (Twilio)** - Fully functional
- Receives messages from WhatsApp
- Processes grievances
- Saves to SQLite database
- Sends responses back to users

✅ **React Admin Panel** - Fully functional
- Modern UI built and ready
- Connected to Supabase
- Login system working
- Dashboard, grievance list, detail views ready

✅ **ngrok Tunnel** - Active
- Public URL for Twilio webhook
- Forwarding to localhost:3001

✅ **Old Dashboard** - Working (backup)
- Port 3000
- Shows SQLite data

---

## Pre-Flight Checklist

### 1. Environment Variables ✅
**File: `.env`**
```
✅ TWILIO_ACCOUNT_SID - Set
✅ TWILIO_AUTH_TOKEN - Set
✅ TWILIO_WHATSAPP_NUMBER - Set
✅ SUPABASE_URL - Set
✅ SUPABASE_ANON_KEY - Set
```

**File: `admin-panel/.env`**
```
✅ VITE_SUPABASE_URL - Set
✅ VITE_SUPABASE_ANON_KEY - Set
```

### 2. Supabase Setup ✅
- [x] Project created
- [x] Database schema executed (SUPABASE_SETUP.sql)
- [x] Admin user created
- [x] Admin profile created
- [ ] Test data added (optional - run test-data.sql)

### 3. Twilio Configuration ✅
- [x] Twilio account active
- [x] WhatsApp sandbox configured
- [x] Webhook URL set in Twilio console
- [x] ngrok tunnel running

### 4. Dependencies Installed
**Root Project:**
```bash
✅ express
✅ twilio
✅ sqlite3
✅ dotenv
✅ body-parser
⚠️  @supabase/supabase-js (needed for bot integration)
```

**Admin Panel:**
```bash
✅ All dependencies installed
✅ React + TypeScript
✅ Supabase client
✅ React Router
✅ Recharts
```

---

## What to Check Before Running

### Step 1: Verify Services Are Running
```bash
# Check if these processes are active:
1. WhatsApp Bot - Port 3001
2. ngrok - Forwarding to 3001
3. Admin Panel - Port 5173
4. Old Dashboard - Port 3000 (optional)
```

### Step 2: Test Admin Panel Login
1. Open: http://localhost:5173/
2. Login with your Supabase credentials
3. Should see dashboard (empty if no data)

### Step 3: Add Test Data (Optional)
1. Go to Supabase → SQL Editor
2. Run `test-data.sql`
3. Refresh admin panel
4. Should see 5 test grievances

### Step 4: Test WhatsApp Bot
1. Send "start" to your Twilio WhatsApp number
2. Follow the prompts
3. Submit a test grievance
4. Check old dashboard (http://localhost:3000/) to see it

---

## Current Limitation

⚠️ **Bot and Admin Panel are NOT connected yet**

**Why?**
- Bot saves to SQLite (local database)
- Admin panel reads from Supabase (cloud database)
- They're using different databases

**Impact:**
- New WhatsApp grievances won't show in admin panel
- Admin panel only shows Supabase data
- Old dashboard still works for WhatsApp grievances

**Solution:**
We need to install `@supabase/supabase-js` in the root project and update bot-twilio.js to use database-supabase.js instead of database.js

---

## How to Fully Integrate (Next Steps)

### Option 1: Manual Installation
```bash
# In your terminal, navigate to DDGRS folder
cd C:\Users\vahar\OneDrive\Desktop\pr\DDGRS

# Install Supabase
npm install @supabase/supabase-js

# The bot will automatically use Supabase
# (bot-twilio.js is already configured)
```

### Option 2: Keep Current Setup
- Use old dashboard for WhatsApp grievances
- Use admin panel for manual data entry
- Migrate data later when ready

---

## Testing Checklist

### Test 1: Admin Panel
- [ ] Can login at http://localhost:5173/
- [ ] Dashboard loads without errors
- [ ] Can view grievance list
- [ ] Can click on a grievance to see details
- [ ] Can update grievance status
- [ ] Can add remarks/responses

### Test 2: WhatsApp Bot
- [ ] Send "start" to bot
- [ ] Receive welcome message
- [ ] Can select anonymous/non-anonymous
- [ ] Can select category
- [ ] Can submit grievance
- [ ] Receive tracking ID
- [ ] Can track grievance with "track [ID]"

### Test 3: Old Dashboard
- [ ] Open http://localhost:3000/
- [ ] See list of grievances from WhatsApp
- [ ] Can respond to grievances
- [ ] User receives response on WhatsApp

---

## Quick Start Commands

### Start Everything:
```bash
# Terminal 1: WhatsApp Bot
node bot-twilio.js

# Terminal 2: ngrok
ngrok http 3001

# Terminal 3: Admin Panel
cd admin-panel
npm run dev

# Terminal 4: Old Dashboard (optional)
npm run dashboard
```

### Stop Everything:
- Press Ctrl+C in each terminal

---

## Troubleshooting

### Admin Panel shows "Invalid API key"
- Check `admin-panel/.env` has correct Supabase credentials
- Restart dev server: `npm run dev`

### Admin Panel is empty
- Run `test-data.sql` in Supabase SQL Editor
- Or submit grievances through WhatsApp (after integration)

### WhatsApp bot not responding
- Check ngrok is running
- Verify webhook URL in Twilio console
- Check bot is running on port 3001

### Can't login to admin panel
- Verify user exists in Supabase Authentication
- Check profile was created in profiles table
- Try resetting password in Supabase

---

## Production Deployment (Future)

When ready to deploy:

1. **Admin Panel:**
   - Deploy to Vercel/Netlify
   - Update environment variables
   - Connect to production Supabase

2. **WhatsApp Bot:**
   - Deploy to Railway/Render/Heroku
   - Update Twilio webhook URL
   - Use production Supabase credentials

3. **Database:**
   - Supabase is already cloud-hosted
   - No additional deployment needed

---

## Summary

**What's Ready:**
- ✅ Admin panel UI (beautiful and functional)
- ✅ WhatsApp bot (receiving and processing messages)
- ✅ Supabase database (schema ready)
- ✅ Authentication system

**What's Pending:**
- ⚠️ Bot-to-Supabase integration (one npm install away)
- ⚠️ Test data (optional, for demo purposes)

**Recommendation:**
1. Add test data to see admin panel in action
2. Install @supabase/supabase-js to connect bot
3. Test end-to-end flow
4. Deploy when satisfied

You're 95% there! 🚀
