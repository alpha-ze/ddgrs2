# WhatsApp Grievance Management Bot

A WhatsApp bot that allows users to submit grievances by category, with an admin dashboard for managing and responding to them.

## Features

- 📱 WhatsApp bot with QR code authentication
- 🏢 Department-based grievance routing
- 📊 Admin dashboard for managing grievances
- 💬 Direct response system to users
- 🗄️ SQLite database for storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the WhatsApp bot:
```bash
npm start
```

3. Scan the QR code with WhatsApp to connect:
   - A QR code will appear in your terminal
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices (or WhatsApp Web)
   - Tap "Link a Device"
   - Point your phone camera at the QR code in the terminal
   - Wait for connection confirmation

4. In a separate terminal, start the admin dashboard:
```bash
npm run dashboard
```

5. Access the dashboard at: http://localhost:3000

## How It Works

### For Users:
1. Send "start" to the bot on WhatsApp
2. Select a department (1-5)
3. Describe the grievance
4. Confirm submission
5. Receive a ticket ID
6. Get notified when admin responds

### For Admins:
1. Open the dashboard at http://localhost:3000
2. View all grievances with filters
3. Respond to pending grievances
4. Responses are sent directly to users via WhatsApp

## Departments

1. Technical Support
2. Billing
3. Human Resources
4. General Inquiry
5. Complaints

## Database

SQLite database stores:
- User ID (WhatsApp number)
- Department
- Grievance text
- Status (pending/resolved)
- Admin response
- Timestamps

## Notes

- First run will create a `.wwebjs_auth` folder for WhatsApp session
- Keep the bot running to receive and send messages
- Dashboard can run independently for viewing grievances
