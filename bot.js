const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Database = require('./database');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

const db = new Database();
const userSessions = new Map();

const DEPARTMENTS = {
    '1': 'Technical Support',
    '2': 'Billing',
    '3': 'Human Resources',
    '4': 'General Inquiry',
    '5': 'Complaints'
};

client.on('qr', (qr) => {
    console.log('Scan this QR code to connect:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Bot is ready!');
    console.log('Users can now send "start" to submit grievances');
});

client.on('authenticated', () => {
    console.log('Authentication successful!');
});

client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
});

client.on('message', async (msg) => {
    const userId = msg.from;
    const userMessage = msg.body.trim();

    if (!userSessions.has(userId)) {
        userSessions.set(userId, { step: 'start' });
    }

    const session = userSessions.get(userId);

    if (userMessage.toLowerCase() === 'start' || session.step === 'start') {
        session.step = 'category';
        await msg.reply(
            '👋 Welcome to Grievance Management System\n\n' +
            'Please select a department:\n' +
            '1️⃣ Technical Support\n' +
            '2️⃣ Billing\n' +
            '3️⃣ Human Resources\n' +
            '4️⃣ General Inquiry\n' +
            '5️⃣ Complaints\n\n' +
            'Reply with the number (1-5)'
        );
    } else if (session.step === 'category') {
        if (DEPARTMENTS[userMessage]) {
            session.department = DEPARTMENTS[userMessage];
            session.step = 'grievance';
            await msg.reply(
                `✅ Department: ${session.department}\n\n` +
                'Please describe your grievance:'
            );
        } else {
            await msg.reply('❌ Invalid selection. Please reply with a number between 1-5.');
        }
    } else if (session.step === 'grievance') {
        session.grievance = userMessage;
        session.step = 'confirm';
        await msg.reply(
            '📝 Summary:\n' +
            `Department: ${session.department}\n` +
            `Grievance: ${session.grievance}\n\n` +
            'Type "confirm" to submit or "cancel" to restart'
        );
    } else if (session.step === 'confirm') {
        if (userMessage.toLowerCase() === 'confirm') {
            const grievanceId = await db.addGrievance({
                userId: userId,
                department: session.department,
                grievance: session.grievance,
                status: 'pending'
            });
            
            await msg.reply(
                `✅ Your grievance has been submitted!\n` +
                `Ticket ID: #${grievanceId}\n\n` +
                `You will be notified when an admin responds.\n\n` +
                `Type "start" to submit another grievance.`
            );
            userSessions.delete(userId);
        } else if (userMessage.toLowerCase() === 'cancel') {
            userSessions.delete(userId);
            await msg.reply('❌ Cancelled. Type "start" to begin again.');
        } else {
            await msg.reply('Please type "confirm" or "cancel"');
        }
    }
});

client.initialize();

// Monitor database for admin responses
setInterval(async () => {
    try {
        const grievances = await db.getAllGrievances();
        const resolved = grievances.filter(g => g.status === 'resolved' && !g.responseSent);
        
        for (const grievance of resolved) {
            try {
                await client.sendMessage(
                    grievance.userId, 
                    `📢 Admin Response to Ticket #${grievance.id}:\n\n${grievance.response}\n\nThank you for your patience!`
                );
                await db.markResponseSent(grievance.id);
                console.log(`Response sent to ${grievance.userId} for ticket #${grievance.id}`);
            } catch (error) {
                console.error(`Failed to send response for ticket #${grievance.id}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error checking for responses:', error.message);
    }
}, 5000); // Check every 5 seconds
