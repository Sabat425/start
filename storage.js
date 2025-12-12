const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');
const config = require('./config.json');

const app = express();
const PORT = 3000;

// Initialize Bot
const bot = new TelegramBot(config.telegram_bot_token, { polling: false });
const GROUP_ID = config.telegram_group;

// Setup Multer (Unlimited size here, controlled by chunks in frontend)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } 
});

const DB_PATH = path.join(__dirname, 'db.json');

// --- DATABASE HELPERS ---
const getDb = () => {
    try {
        if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]');
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (e) { return []; }
};

const saveDb = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

app.use(express.static('storage'));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cors());

// --- ROUTES ---

// 1. List Files
app.get('/api/files', (req, res) => {
    const files = getDb();
    res.json(files.reverse());
});

// 2. Upload Single File (Used by frontend looper)
app.post('/api/upload', upload.array('files'), async (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files' });

    const uploadedFiles = [];
    const db = getDb();

    try {
        for (const file of req.files) {
            const sentMessage = await bot.sendDocument(GROUP_ID, file.buffer, {}, {
                filename: file.originalname,
                contentType: file.mimetype
            });

            const doc = sentMessage.document || sentMessage.photo?.[sentMessage.photo.length - 1];
            if (!doc) continue;

            const cleanChatId = GROUP_ID.toString().replace('-100', '');
            const messageLink = `https://t.me/c/${cleanChatId}/${sentMessage.message_id}`;

            const newFile = {
                id: doc.file_id,
                unique_id: doc.file_unique_id,
                name: file.originalname,
                size: doc.file_size,
                mime: file.mimetype,
                upload_date: new Date().toISOString(),
                message_id: sentMessage.message_id,
                message_link: messageLink
            };

            db.push(newFile);
            uploadedFiles.push(newFile);
        }
        saveDb(db);
        res.json({ success: true, count: uploadedFiles.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// 3. Delete File
app.delete('/api/delete/:fileId', async (req, res) => {
    const { fileId } = req.params;
    let db = getDb();
    
    const fileIndex = db.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return res.status(404).json({ error: 'File not found' });

    const file = db[fileIndex];

    try {
        await bot.deleteMessage(GROUP_ID, file.message_id);
    } catch (error) {
        console.log('Telegram delete skipped');
    }

    db.splice(fileIndex, 1);
    saveDb(db);

    res.json({ success: true });
});

// 4. Download Link
app.get('/api/download/:fileId', async (req, res) => {
    try {
        const fileLink = await bot.getFileLink(req.params.fileId);
        res.json({ link: fileLink });
    } catch (error) {
        res.status(500).json({ error: 'Error' });
    }
});

// 5. View Image (Redirect)
app.get('/api/view/:fileId', async (req, res) => {
    try {
        const fileLink = await bot.getFileLink(req.params.fileId);
        res.redirect(fileLink);
    } catch (error) {
        res.status(404).send('Not found');
    }
});

// 6. Get Content (Text)
app.get('/api/content/:fileId', async (req, res) => {
    try {
        const fileLink = await bot.getFileLink(req.params.fileId);
        https.get(fileLink, (stream) => {
            let data = '';
            stream.on('data', (chunk) => data += chunk);
            stream.on('end', () => res.send(data));
        }).on('error', () => res.status(500).send('Error'));
    } catch (error) {
        res.status(500).send('Error');
    }
});

// 7. NEW: Proxy Stream (For PDF/Binary) - Pipes raw data
app.get('/api/proxy/:fileId', async (req, res) => {
    try {
        const fileLink = await bot.getFileLink(req.params.fileId);
        https.get(fileLink, (stream) => {
            res.setHeader('Content-Type', 'application/pdf'); // Default hint
            stream.pipe(res);
        });
    } catch (error) {
        res.status(500).send('Error');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Storage V6 (Pro Design) running at http://localhost:${PORT}`);
});