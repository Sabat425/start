☁️ CloudBox - Unlimited Telegram Cloud Storage
![alt text](https://img.shields.io/badge/status-active-success.svg)
![alt text](https://img.shields.io/badge/Node.js-v18+-green.svg)
![alt text](https://img.shields.io/badge/license-MIT-blue.svg)
CloudBox is a modern, self-hosted web application that turns your Telegram Group into an unlimited, free cloud storage drive. It features a beautiful "Glassmorphism" UI, drag-and-drop uploads, code highlighting, PDF viewing, and instant file retrieval.
📖 Table of Contents
Why CloudBox?
Features
Tech Stack & NPM Modules
API Documentation
Installation & Setup
Configuration
How to Run
Screenshots
💡 Why CloudBox? (The Problem & Solution)
The Problem
Traditional cloud storage services (AWS S3, Google Drive, Dropbox) are expensive. They charge you for storage space and bandwidth. For students, developers, or data hoarders, these costs add up quickly.
The Solution
Telegram offers unlimited cloud storage for free. You can upload files up to 2GB per file (4GB with Premium) to a private group.
However, using Telegram as a file manager is messy—it's just a chat log.
CloudBox solves this by:
Acting as a Bridge: It provides a professional Web UI (like Google Drive) but stores the actual data in Telegram.
Zero Cost: You pay nothing for storage. The bot handles the heavy lifting.
Better UI: It creates a searchable database (db.json) so you don't have to scroll through thousands of messages to find a file.
✨ Key Features
📦 Unlimited Storage: Leveraging Telegram's infrastructure.
🚀 Batch Uploads: Drag and drop 50+ files at once; the system queues them automatically.
🎨 Pro UI/UX: Dark mode, ambient lighting, glassmorphism, and responsive mobile design.
👁️ Smart Previews:
Images: View thumbnails and full-size images instantly.
Code: Syntax highlighting for 15+ languages (JS, PY, HTML, SQL, etc.).
PDFs: Full-featured built-in PDF viewer with zoom controls.
🗑️ Full Management: Delete files from the interface (removes them from the DB and the Telegram Group).
🔍 Instant Search: Real-time filtering by filename.
🛠 Tech Stack & NPM Modules
We use Node.js for the backend because it handles asynchronous I/O (uploading/downloading streams) efficiently.
NPM Module	Why we use it?
express	The web framework used to create the server and API endpoints. It routes traffic from the browser to our logic.
node-telegram-bot-api	The core bridge. It allows our Node.js server to talk to Telegram (send documents, get file links, delete messages).
multer	Middleware for handling multipart/form-data. It processes the files you drag-and-drop before sending them to Telegram.
cors	(Cross-Origin Resource Sharing). Ensures security protocols are met so the browser allows the frontend to talk to the backend.
fs (Native)	File System. Used to read/write the local db.json database.
https (Native)	Used to create proxy streams, allowing us to pipe binary data (like PDFs) from Telegram directly to the browser.
Frontend: Pure HTML5, Tailwind CSS (via CDN), Phosphor Icons, Highlight.js, and PDF.js.
🔌 API Endpoints Explained
The backend (project.js) exposes these REST API endpoints:
1. GET /api/files
Purpose: Fetches the list of all stored files.
Logic: Reads db.json, parses it, and sends the array to the frontend to generate the grid.
2. POST /api/upload
Purpose: Handles file uploads.
Logic:
Receives file via multer.
Bot sends file to Telegram Group (bot.sendDocument).
Extracts file_id, message_id, and generates a link.
Saves metadata to db.json.
3. GET /api/download/:fileId
Purpose: Generates a direct download link.
Logic: Uses bot.getFileLink(fileId) to get a temporary, 1-hour valid link from Telegram servers.
4. GET /api/content/:fileId
Purpose: Fetches raw text for code previews.
Logic: Downloads the file stream from Telegram and sends it as text string to the <code> block in the UI.
5. GET /api/proxy/:fileId
Purpose: Streams binary data (Crucial for PDF/Images).
Logic: This acts as a middleman. Browser <-> Node Server <-> Telegram. It allows PDF.js to render files without CORS errors.
6. DELETE /api/delete/:fileId
Purpose: Deletes a file.
Logic:
Finds the message_id in the database.
Tells Telegram to delete that message (bot.deleteMessage).
Removes the entry from db.json.
🚀 Installation & Setup
Prerequisites
Node.js installed on your computer.
A Telegram account.
Step 1: Clone the Project
Create a folder and place all project files inside.
Step 2: Install Dependencies
Open your terminal/command prompt in the project folder and run:
code
Bash
npm init -y
npm install express multer node-telegram-bot-api cors
⚙️ Configuration
You need to set up config.json to connect the app to your Telegram.
Get Bot Token:
Open Telegram and search for @BotFather.
Send /newbot, name it, and get the HTTP API Token.
Get Group ID:
Create a New Group in Telegram.
Add your Bot to the group as an Admin.
Forward a message from that group to @userinfobot (or use any ID fetching bot) to get the Group ID (it usually starts with -100).
Edit config.json:
code
JSON
{
  "telegram_group": -1001234567890, 
  "telegram_bot_token": "YOUR_BOT_TOKEN_HERE"
}
Replace the numbers and token with your actual data.
▶️ How to Run
Open your terminal in the project folder.
Run the server:
code
Bash
node project.js
You should see:
🚀 Storage V6 (Pro Design) running at http://localhost:3000
Open your web browser and go to:
http://localhost:3000
🔧 How to Change the Port
If port 3000 is busy, open project.js, find this line, and change the number:
code
JavaScript
const PORT = 3000; // Change to 4000 or 8080
📂 Project Structure
code
Text
CloudBox/
├── config.json       # Credentials (Bot Token & Group ID)
├── db.json           # Local Database (Stores file metadata)
├── project.js        # Main Backend Server (Express + Bot Logic)
├── package.json      # NPM Dependencies list
└── storage/
    └── index.html    # The Frontend UI (HTML + Tailwind + Scripts)
🛡️ License
This project is open-source and available for personal and educational use.
