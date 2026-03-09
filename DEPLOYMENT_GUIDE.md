# DDGRS Deployment Guide

## Current Status
✅ Admin Panel running locally: http://localhost:5173/
✅ WhatsApp Bot running with ngrok
✅ Supabase database configured

## Deploy Admin Panel to Vercel (Recommended - FREE)

### Step 1: Prepare for Deployment

1. **Build the admin panel:**
```bash
cd admin-panel
npm run build
```

This creates a `dist` folder with production files.

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
cd admin-panel
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **ddgrs-admin**
   - Directory? **./admin-panel** (or just press Enter)
   - Override settings? **N**

5. Set environment variables:
```bash
vercel env add VITE_SUPABASE_URL
# Paste: https://qpklahpxqafobibvvcob.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwa2xhaHB4cWFmb2JpYnZ2Y29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTE3NzcsImV4cCI6MjA4ODA4Nzc3N30.bOioB89AhhiKQf5MGexY6w69r0sk7ei41eo813UK7DQ
```

6. Deploy to production:
```bash
vercel --prod
```

**Option B: Using Vercel Website**

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New" → "Project"
4. Import your Git repository (or upload the admin-panel folder)
5. Configure:
   - Framework Preset: **Vite**
   - Root Directory: **admin-panel**
   - Build Command: **npm run build**
   - Output Directory: **dist**
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`: `https://qpklahpxqafobibvvcob.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
7. Click "Deploy"

### Step 3: Update Supabase URL (Optional)

If you want to restrict access, update Supabase:
1. Go to Supabase → Settings → API
2. Add your Vercel URL to allowed origins

---

## Alternative: Deploy to Netlify (Also FREE)

### Using Netlify CLI:

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login:
```bash
netlify login
```

3. Deploy:
```bash
cd admin-panel
npm run build
netlify deploy --prod --dir=dist
```

4. Set environment variables in Netlify dashboard

### Using Netlify Website:

1. Go to https://netlify.com
2. Drag and drop the `admin-panel/dist` folder
3. Go to Site Settings → Environment Variables
4. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Redeploy

---

## Deploy WhatsApp Bot (Backend)

### Option 1: Railway (Recommended - FREE tier)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `PORT` = 3001
6. Railway will auto-deploy and give you a URL
7. Update Twilio webhook to Railway URL

### Option 2: Render (FREE tier)

1. Go to https://render.com
2. Sign up
3. Click "New" → "Web Service"
4. Connect GitHub repository
5. Configure:
   - Name: **ddgrs-bot**
   - Environment: **Node**
   - Build Command: **npm install**
   - Start Command: **node bot-twilio.js**
6. Add environment variables (same as above)
7. Deploy
8. Update Twilio webhook URL

### Option 3: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create ddgrs-bot`
4. Set env vars: `heroku config:set KEY=VALUE`
5. Deploy: `git push heroku main`
6. Update Twilio webhook

---

## Quick Start: Deploy Admin Panel Now

**Fastest way (5 minutes):**

1. Build the admin panel:
```bash
cd admin-panel
npm run build
```

2. Go to https://vercel.com
3. Sign up with GitHub
4. Click "Add New" → "Project"
5. Drag and drop the `dist` folder
6. Add environment variables
7. Deploy!

You'll get a URL like: `https://ddgrs-admin.vercel.app`

---

## Post-Deployment Checklist

- [ ] Admin panel accessible online
- [ ] Can login with Supabase credentials
- [ ] Grievances display correctly
- [ ] Can update status and add remarks
- [ ] Bot deployed and webhook updated
- [ ] WhatsApp messages working
- [ ] Test end-to-end flow

---

## Production URLs

After deployment, you'll have:
- **Admin Panel**: `https://your-app.vercel.app`
- **Bot API**: `https://your-app.railway.app` (or Render)
- **Database**: Supabase (already hosted)

---

## Need Help?

1. **Build fails?** Check `admin-panel/package.json` dependencies
2. **Environment variables not working?** Make sure they start with `VITE_`
3. **Can't login?** Verify Supabase credentials
4. **Bot not responding?** Check Twilio webhook URL

---

## Cost Breakdown

- **Vercel**: FREE (Hobby plan)
- **Railway**: FREE ($5 credit/month)
- **Render**: FREE (750 hours/month)
- **Supabase**: FREE (500MB database)
- **Twilio**: Pay per message (~$0.0079/message)
- **ngrok**: FREE (for development)

**Total Monthly Cost: ~$0-5** (depending on usage)
