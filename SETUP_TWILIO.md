# Setting Up WhatsApp Bot with Twilio (No Personal Number Needed)

## Why Twilio for College Grievance System?

- ✅ Dedicated business number (not your personal number)
- ✅ Official WhatsApp Business API
- ✅ Free sandbox for testing
- ✅ Scalable and reliable
- ✅ Professional solution for institutions

## Setup Steps

### 1. Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your email and phone

### 2. Get WhatsApp Sandbox (Free for Testing)

1. Go to Twilio Console: https://console.twilio.com
2. Navigate to: Messaging → Try it out → Send a WhatsApp message
3. You'll see a sandbox number like: `+1 415 523 8886`
4. Join the sandbox by sending the code (e.g., "join <code>") to that number from WhatsApp

### 3. Get Your Credentials

1. From Twilio Console Dashboard, copy:
   - Account SID
   - Auth Token
2. Create a `.env` file in your project:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
PORT=3001
```

### 4. Install Dependencies

```bash
npm install twilio dotenv
```

### 5. Configure Webhook

For local testing, use ngrok:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3001
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

In Twilio Console:
1. Go to Messaging → Settings → WhatsApp sandbox settings
2. Set "When a message comes in" to: `https://abc123.ngrok.io/webhook`
3. Save

### 6. Run the Bot

```bash
node bot-twilio.js
```

### 7. Test

1. Send "start" to the Twilio WhatsApp sandbox number
2. Follow the prompts
3. Check the admin dashboard to see grievances

## For Production (After Testing)

### Option A: Twilio Production Number ($$$)
1. Request WhatsApp Business Profile approval
2. Get a dedicated phone number
3. Complete business verification
4. Cost: ~$15-25/month + per-message fees

### Option B: Meta Cloud API (Free tier available)
1. Go to https://developers.facebook.com/
2. Create a business app
3. Add WhatsApp product
4. Get free tier: 1000 conversations/month
5. Requires business verification

### Option C: Other Providers
- MessageBird: https://messagebird.com/
- Vonage: https://www.vonage.com/
- Infobip: https://www.infobip.com/

## Advantages Over whatsapp-web.js

| Feature | whatsapp-web.js | Twilio/Official API |
|---------|----------------|---------------------|
| Personal number needed | ✅ Yes | ❌ No |
| Dedicated business number | ❌ No | ✅ Yes |
| Reliability | ⚠️ Can break | ✅ Stable |
| Official support | ❌ No | ✅ Yes |
| Scalability | ⚠️ Limited | ✅ High |
| Terms of Service | ⚠️ Gray area | ✅ Compliant |
| Cost | Free | Free sandbox, paid production |

## Recommended for College

For a college grievance system, I recommend:
1. Start with Twilio sandbox (free testing)
2. Once approved, upgrade to Meta Cloud API (free tier)
3. This gives you a professional, dedicated number
4. No personal number involved
5. Compliant with WhatsApp's terms of service

## Support

- Twilio Docs: https://www.twilio.com/docs/whatsapp
- Meta Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
