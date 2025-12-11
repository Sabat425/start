require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- API ---
app.post('/api/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE (email = ? OR phone_number = ?) AND password = ?', 
            [identifier, identifier, password]
        );
        if (users.length > 0) {
            res.json({ success: true, userId: users[0].id, name: users[0].name });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/verify-pin', async (req, res) => {
    const { userId, pin } = req.body;
    try {
        const [accounts] = await pool.execute(
            'SELECT * FROM accounts WHERE user_id = ? AND account_pin = ?', 
            [userId, pin]
        );
        if (accounts.length > 0) res.json({ success: true });
        else res.status(401).json({ success: false });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.get('/api/data/:userId', async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, name, email, phone_number FROM users WHERE id = ?', [req.params.userId]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        const [accounts] = await pool.execute('SELECT account_id, currency, balance, userqrcodedata FROM accounts WHERE user_id = ?', [req.params.userId]);
        res.json({ user: users[0], accounts: accounts });
    } catch (e) { res.status(500).json({ error: 'DB Error' }); }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));