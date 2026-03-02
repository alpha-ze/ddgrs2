const express = require('express');
const bodyParser = require('body-parser');
const Database = require('./database');

const app = express();
const db = new Database();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// API endpoints
app.get('/api/grievances', async (req, res) => {
    try {
        const grievances = await db.getAllGrievances();
        res.json(grievances);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/respond/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;
        
        const grievance = await db.getGrievanceById(id);
        if (!grievance) {
            return res.status(404).json({ error: 'Grievance not found' });
        }
        
        await db.updateGrievance(id, response);
        
        // Note: WhatsApp message will be sent by the bot process
        // The bot monitors the database for updates
        
        res.json({ success: true, message: 'Response saved successfully' });
    } catch (error) {
        console.error('Error responding to grievance:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Admin Dashboard running at http://localhost:${PORT}`);
});
