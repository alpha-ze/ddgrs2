const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor() {
        this.db = new sqlite3.Database('./grievances.db', (err) => {
            if (err) {
                console.error('Database error:', err);
            } else {
                console.log('Connected to database');
                this.init();
            }
        });
    }

    init() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS grievances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                department TEXT NOT NULL,
                grievance TEXT NOT NULL,
                status TEXT DEFAULT 'Pending',
                response TEXT,
                responseSent INTEGER DEFAULT 0,
                isAnonymous INTEGER DEFAULT 0,
                mediaUrls TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    addGrievance(data) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO grievances (userId, department, grievance, status, isAnonymous, mediaUrls) VALUES (?, ?, ?, ?, ?, ?)',
                [data.userId, data.department, data.grievance, data.status, data.isAnonymous ? 1 : 0, data.mediaUrls || '[]'],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    getAllGrievances() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM grievances ORDER BY createdAt DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    updateGrievance(id, response) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE grievances SET response = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [response, 'Resolved', id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    updateGrievanceStatus(id, status) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE grievances SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [status, id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    getGrievanceById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM grievances WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    markResponseSent(id) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE grievances SET responseSent = 1 WHERE id = ?',
                [id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }
}

module.exports = Database;
