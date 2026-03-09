require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const Database = require('./database-supabase'); // Using Supabase now!

const app = express();
const db = new Database();

// Twilio credentials - Get from https://console.twilio.com
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
const client = twilio(accountSid, authToken);

const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Sandbox number

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const userSessions = new Map();

const DEPARTMENTS = {
    '1': 'Academic',
    '2': 'Hostel',
    '3': 'Faculty',
    '4': 'Infrastructure'
};

// Webhook endpoint for incoming WhatsApp messages
app.post('/webhook', async (req, res) => {
    const userId = req.body.From;
    const userMessage = req.body.Body.trim();
    
    console.log(`Message from ${userId}: ${userMessage}`);

    let responseMessage = ''; // Declare variable at the top

    // Check for tracking command first (before session check)
    if (userMessage.toLowerCase().startsWith('track ')) {
        const trackingId = userMessage.split(' ')[1];
        const grievance = await db.getGrievanceById(trackingId);
        
        if (grievance) {
            responseMessage = 
                `📋 Grievance Status\n\n` +
                `Tracking ID: ${grievance.grievance_id}\n` +
                `Category: ${grievance.category}\n` +
                `Status: ${grievance.status}\n` +
                `Submitted: ${new Date(grievance.created_at).toLocaleString()}\n\n`;
            
            if (grievance.response) {
                responseMessage += `Admin Response:\n${grievance.response}\n\n`;
            } else {
                responseMessage += `Your grievance is being reviewed.\n\n`;
            }
            
            responseMessage += `Type "start" to submit a new grievance.`;
        } else {
            responseMessage = `❌ Tracking ID ${trackingId} not found.\n\nPlease check the ID and try again.`;
        }
        
        // Send response
        await client.messages.create({
            body: responseMessage,
            from: TWILIO_WHATSAPP_NUMBER,
            to: userId
        });
        
        return res.status(200).send('OK');
    }

    if (!userSessions.has(userId)) {
        userSessions.set(userId, { step: 'start' });
    }

    const session = userSessions.get(userId);

    try {
        if (userMessage.toLowerCase() === 'start' || session.step === 'start') {
            session.step = 'anonymous';
            responseMessage = 
                '👋 Welcome to College Grievance Management System\n\n' +
                'Do you want to submit anonymously?\n' +
                '1️⃣ Yes (Anonymous)\n' +
                '2️⃣ No (With my details)\n\n' +
                'Reply with 1 or 2';
        } else if (session.step === 'anonymous') {
            if (userMessage === '1') {
                session.isAnonymous = true;
                session.step = 'category';
                responseMessage = 
                    '✅ Anonymous submission selected\n\n' +
                    'Select Category:\n' +
                    '1️⃣ Academic\n' +
                    '2️⃣ Hostel\n' +
                    '3️⃣ Faculty\n' +
                    '4️⃣ Infrastructure\n\n' +
                    'Reply with the number (1-4)';
            } else if (userMessage === '2') {
                session.isAnonymous = false;
                session.step = 'category';
                responseMessage = 
                    '✅ Submission with details\n\n' +
                    'Select Category:\n' +
                    '1️⃣ Academic\n' +
                    '2️⃣ Hostel\n' +
                    '3️⃣ Faculty\n' +
                    '4️⃣ Infrastructure\n\n' +
                    'Reply with the number (1-4)';
            } else {
                responseMessage = '❌ Invalid selection. Please reply with 1 or 2.';
            }
        } else if (session.step === 'category') {
            if (DEPARTMENTS[userMessage]) {
                session.department = DEPARTMENTS[userMessage];
                session.step = 'grievance';
                responseMessage = 
                    `✅ Category: ${session.department}\n\n` +
                    'Please describe your grievance:\n' +
                    '(You can send text, images, audio, or video)';
            } else {
                responseMessage = '❌ Invalid selection. Please reply with a number between 1-4.';
            }
        } else if (session.step === 'grievance') {
            // Handle media attachments
            const numMedia = parseInt(req.body.NumMedia) || 0;
            let mediaUrls = [];
            
            for (let i = 0; i < numMedia; i++) {
                const mediaUrl = req.body[`MediaUrl${i}`];
                const mediaType = req.body[`MediaContentType${i}`];
                if (mediaUrl) {
                    mediaUrls.push({ url: mediaUrl, type: mediaType });
                }
            }
            
            session.grievance = userMessage;
            session.mediaUrls = mediaUrls;
            session.step = 'confirm';
            
            let mediaInfo = '';
            if (mediaUrls.length > 0) {
                mediaInfo = `\nAttachments: ${mediaUrls.length} file(s)\n`;
            }
            
            responseMessage = 
                '📝 Summary:\n' +
                `Category: ${session.department}\n` +
                `Anonymous: ${session.isAnonymous ? 'Yes' : 'No'}\n` +
                `Grievance: ${session.grievance}${mediaInfo}\n` +
                'Type "confirm" to submit or "cancel" to restart';
        } else if (session.step === 'confirm') {
            if (userMessage.toLowerCase() === 'confirm') {
                const displayUserId = session.isAnonymous ? 'Anonymous' : userId;
                const grievanceId = await db.addGrievance({
                    userId: displayUserId,
                    department: session.department,
                    grievance: session.grievance,
                    status: 'Pending',
                    isAnonymous: session.isAnonymous,
                    mediaUrls: JSON.stringify(session.mediaUrls || [])
                });
                
                responseMessage = 
                    `✅ Your grievance has been submitted!\n` +
                    `Tracking ID: ${grievanceId}\n\n` +
                    `Track your grievance anytime by sending:\n` +
                    `track ${grievanceId}\n\n` +
                    `Type "start" to submit another grievance.`;
                userSessions.delete(userId);
            } else if (userMessage.toLowerCase() === 'cancel') {
                userSessions.delete(userId);
                responseMessage = '❌ Cancelled. Type "start" to begin again.';
            } else {
                responseMessage = 'Please type "confirm" or "cancel"';
            }
        }

        // Send response via Twilio
        await client.messages.create({
            body: responseMessage,
            from: TWILIO_WHATSAPP_NUMBER,
            to: userId
        });

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).send('Error');
    }
});

// Function to send admin responses
async function sendResponseToUser(userId, message) {
    try {
        await client.messages.create({
            body: `📢 Admin Response:\n\n${message}\n\nThank you for your patience!`,
            from: TWILIO_WHATSAPP_NUMBER,
            to: userId
        });
        console.log(`Response sent to ${userId}`);
        return true;
    } catch (error) {
        console.error('Error sending response:', error);
        return false;
    }
}

// Endpoint to proxy Twilio media (to avoid auth popup)
app.get('/media/:messageId/:index', async (req, res) => {
    try {
        const { messageId, index } = req.params;
        const grievance = await db.getGrievanceById(messageId);
        
        if (!grievance || !grievance.mediaUrls) {
            return res.status(404).send('Media not found');
        }
        
        const mediaUrls = JSON.parse(grievance.mediaUrls);
        const media = mediaUrls[index];
        
        if (!media) {
            return res.status(404).send('Media not found');
        }
        
        // Fetch media from Twilio with authentication
        const response = await fetch(media.url, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
            }
        });
        
        const buffer = await response.buffer();
        res.set('Content-Type', media.type);
        res.send(buffer);
    } catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).send('Error fetching media');
    }
});

// Monitor database for admin responses
setInterval(async () => {
    try {
        const grievances = await db.getAllGrievances();
        const resolved = grievances.filter(g => g.status === 'Resolved' && !g.responseSent && g.response);
        
        for (const grievance of resolved) {
            if (grievance.userId !== 'Anonymous') {
                const success = await sendResponseToUser(
                    grievance.userId, 
                    `Tracking ID: ${grievance.id}\n\n${grievance.response}`
                );
                
                if (success) {
                    await db.markResponseSent(grievance.id);
                }
            } else {
                // Mark as sent for anonymous users (they can track manually)
                await db.markResponseSent(grievance.id);
            }
        }
    } catch (error) {
        console.error('Error checking for responses:', error);
    }
}, 5000);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`WhatsApp Bot (Twilio) running on port ${PORT}`);
    console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
    console.log('Configure this URL in Twilio Console');
});

module.exports = { sendResponseToUser };
