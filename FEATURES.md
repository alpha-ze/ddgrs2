# Enhanced Grievance Management System - Features

## ✨ New Features Implemented

### 1. **Updated Categories**
- Academic
- Hostel
- Faculty
- Infrastructure

### 2. **Tracking System**
Users can track their grievances anytime by sending:
```
track <ID>
```
Example: `track 5`

Response includes:
- Tracking ID
- Category
- Current Status
- Submission date
- Admin response (if available)

### 3. **Anonymous Submissions**
Users can choose to submit grievances anonymously:
- Option presented at the start
- Anonymous grievances show "ANONYMOUS" badge in dashboard
- User identity is hidden from admins

### 4. **Media Support (Images, Audio, Video)**
Users can attach:
- Images (photos of issues)
- Videos (recorded evidence)
- Audio (voice notes)

Admins can view all attachments in the dashboard.

### 5. **Status Management**
Admins can change grievance status to:
- **Pending** - Just submitted
- **In Progress** - Being worked on
- **Resolved** - Issue fixed
- **Closed** - Completed

Status changes are reflected in real-time.

## 📱 User Flow

### Step 1: Start Conversation
User sends: `start`

### Step 2: Choose Anonymous Option
```
Do you want to submit anonymously?
1️⃣ Yes (Anonymous)
2️⃣ No (With my details)
```

### Step 3: Select Category
```
Select Category:
1️⃣ Academic
2️⃣ Hostel
3️⃣ Faculty
4️⃣ Infrastructure
```

### Step 4: Describe Grievance
User can:
- Type text description
- Send images
- Send videos
- Send audio recordings

### Step 5: Confirm Submission
Review summary and confirm

### Step 6: Get Tracking ID
```
✅ Your grievance has been submitted!
Tracking ID: 15

Track your grievance anytime by sending:
track 15
```

### Step 7: Track Status
User sends: `track 15`

Response:
```
📋 Grievance Status

Tracking ID: 15
Category: Hostel
Status: In Progress
Submitted: 3/3/2026, 10:30 AM

Your grievance is being reviewed.
```

## 🖥️ Admin Dashboard Features

### View Grievances
- Filter by status (Pending, In Progress, Resolved, Closed)
- Filter by category (Academic, Hostel, Faculty, Infrastructure)
- See anonymous submissions marked with badge
- View all media attachments (images, videos, audio)

### Change Status
Dropdown menu to update status:
- Pending → In Progress → Resolved → Closed

### Respond to Grievances
- Type response in text area
- Click "Send Response"
- User receives notification automatically

### Track Information
Each grievance shows:
- Tracking ID
- Category
- Status badge
- Anonymous indicator
- Submission timestamp
- Media attachments
- User details (or "Anonymous")

## 🔄 Automatic Notifications

When admin responds:
- Non-anonymous users: Receive WhatsApp notification
- Anonymous users: Can track status using tracking ID

## 🎨 Dashboard UI Updates

- Color-coded status badges:
  - Pending: Yellow
  - In Progress: Blue
  - Resolved: Green
  - Closed: Gray
- Media preview for images/videos
- Audio player for voice notes
- Status dropdown for quick updates

## 📊 Database Schema

```sql
CREATE TABLE grievances (
    id INTEGER PRIMARY KEY,
    userId TEXT,              -- WhatsApp number or "Anonymous"
    department TEXT,          -- Academic, Hostel, Faculty, Infrastructure
    grievance TEXT,           -- Description
    status TEXT,              -- Pending, In Progress, Resolved, Closed
    response TEXT,            -- Admin response
    responseSent INTEGER,     -- Whether notification was sent
    isAnonymous INTEGER,      -- 1 for anonymous, 0 for identified
    mediaUrls TEXT,           -- JSON array of media attachments
    createdAt DATETIME,
    updatedAt DATETIME
);
```

## 🚀 How to Use

### Start the System
```bash
# Terminal 1: Start Twilio bot
node bot-twilio.js

# Terminal 2: Start admin dashboard
npm run dashboard

# Terminal 3: Expose webhook
ngrok http 3001
```

### Configure Twilio
1. Copy ngrok URL
2. Go to Twilio Console → WhatsApp Sandbox Settings
3. Set webhook: `https://your-ngrok-url.ngrok.io/webhook`

### Test Features
1. Send "start" to sandbox number
2. Choose anonymous option
3. Select category
4. Send text + media
5. Confirm submission
6. Get tracking ID
7. Track status: `track <ID>`

## 🎯 Benefits

- **Privacy**: Anonymous submissions protect user identity
- **Transparency**: Tracking system keeps users informed
- **Evidence**: Media support for better issue documentation
- **Efficiency**: Status management helps prioritize work
- **Professional**: College-appropriate categories and workflow
