
***

# ☁️ CloudBox - Unlimited Telegram Cloud Storage

![Project Status](https://img.shields.io/badge/status-active-success.svg) ![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg) ![License](https://img.shields.io/badge/license-MIT-blue.svg)

**CloudBox** is a modern, self-hosted web application that turns your **Telegram Group** into an unlimited, free cloud storage drive. It features a beautiful "Glassmorphism" UI, drag-and-drop uploads, code highlighting, PDF viewing, and instant file retrieval.

---

## 📖 Table of Contents
- [Why CloudBox?](#-why-cloudbox-the-problem--solution)
- [Features](#-key-features)
- [Tech Stack & NPM Modules](#-tech-stack--npm-modules)
- [API Documentation](#-api-endpoints-explained)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-%EF%B8%8F-configuration)
- [How to Run](#-how-to-run)
- [Screenshots](#-preview)

---

## 💡 Why CloudBox? (The Problem & Solution)

### The Problem
Traditional cloud storage services (AWS S3, Google Drive, Dropbox) are expensive. They charge you for storage space and bandwidth. For students, developers, or data hoarders, these costs add up quickly.

### The Solution
**Telegram** offers unlimited cloud storage for free. You can upload files up to **2GB per file** (4GB with Premium) to a private group.
However, using Telegram as a file manager is messy—it's just a chat log.

**CloudBox solves this by:**
1.  **Acting as a Bridge:** It provides a professional Web UI (like Google Drive) but stores the actual data in Telegram.
2.  **Zero Cost:** You pay nothing for storage. The bot handles the heavy lifting.
3.  **Better UI:** It creates a searchable database (`db.json`) so you don't have to scroll through thousands of messages to find a file.

---

## ✨ Key Features

*   **📦 Unlimited Storage:** Leveraging Telegram's infrastructure.
*   **🚀 Batch Uploads:** Drag and drop 50+ files at once; the system queues them automatically.
*   **🎨 Pro UI/UX:** Dark mode, ambient lighting, glassmorphism, and responsive mobile design.
*   **👁️ Smart Previews:**
    *   **Images:** View thumbnails and full-size images instantly.
    *   **Code:** Syntax highlighting for 15+ languages (JS, PY, HTML, SQL, etc.).
    *   **PDFs:** Full-featured built-in PDF viewer with zoom controls.
*   **🗑️ Full Management:** Delete files from the interface (removes them from the DB and the Telegram Group).
*   **🔍 Instant Search:** Real-time filtering by filename.

---

## 🛠 Tech Stack & NPM Modules

We use **Node.js** for the backend because it handles asynchronous I/O (uploading/downloading streams) efficiently.

| NPM Module | Why we use it? |
| :--- | :--- |
| **`express`** | The web framework used to create the server and API endpoints. It routes traffic from the browser to our logic. |
| **`node-telegram-bot-api`** | The core bridge. It allows our Node.js server to talk to Telegram (send documents, get file links, delete messages). |
| **`multer`** | Middleware for handling `multipart/form-data`. It processes the files you drag-and-drop before sending them to Telegram. |
| **`cors`** | (Cross-Origin Resource Sharing). Ensures security protocols are met so the browser allows the frontend to talk to the backend. |
| **`fs`** (Native) | File System. Used to read/write the local `db.json` database. |
| **`https`** (Native) | Used to create proxy streams, allowing us to pipe binary data (like PDFs) from Telegram directly to the browser. |

**Frontend:** Pure HTML5, Tailwind CSS (via CDN), Phosphor Icons, Highlight.js, and PDF.js.

---

## 🔌 API Endpoints Explained

The backend (`project.js`) exposes these REST API endpoints:

### 1. `GET /api/files`
*   **Purpose:** Fetches the list of all stored files.
*   **Logic:** Reads `db.json`, parses it, and sends the array to the frontend to generate the grid.

### 2. `POST /api/upload`
*   **Purpose:** Handles file uploads.
*   **Logic:** 
    1.  Receives file via `multer`.
    2.  Bot sends file to Telegram Group (`bot.sendDocument`).
    3.  Extracts `file_id`, `message_id`, and generates a link.
    4.  Saves metadata to `db.json`.

### 3. `GET /api/download/:fileId`
*   **Purpose:** Generates a direct download link.
*   **Logic:** Uses `bot.getFileLink(fileId)` to get a temporary, 1-hour valid link from Telegram servers.

### 4. `GET /api/content/:fileId`
*   **Purpose:** Fetches raw text for code previews.
*   **Logic:** Downloads the file stream from Telegram and sends it as text string to the `<code>` block in the UI.

### 5. `GET /api/proxy/:fileId`
*   **Purpose:** Streams binary data (Crucial for PDF/Images).
*   **Logic:** This acts as a middleman. Browser <-> Node Server <-> Telegram. It allows PDF.js to render files without CORS errors.

### 6. `DELETE /api/delete/:fileId`
*   **Purpose:** Deletes a file.
*   **Logic:** 
    1.  Finds the `message_id` in the database.
    2.  Tells Telegram to delete that message (`bot.deleteMessage`).
    3.  Removes the entry from `db.json`.

---

## 🚀 Installation & Setup

### Prerequisites
*   Node.js installed on your computer.
*   A Telegram account.

### Step 1: Clone the Project
Create a folder and place all project files inside.

### Step 2: Install Dependencies
Open your terminal/command prompt in the project folder and run:
```bash
npm init -y
npm install express multer node-telegram-bot-api cors
```

---

## ⚙️ Configuration

You need to set up `config.json` to connect the app to your Telegram.

1.  **Get Bot Token:**
    *   Open Telegram and search for **@BotFather**.
    *   Send `/newbot`, name it, and get the **HTTP API Token**.
2.  **Get Group ID:**
    *   Create a New Group in Telegram.
    *   Add your Bot to the group as an **Admin**.
    *   Forward a message from that group to **@userinfobot** (or use any ID fetching bot) to get the Group ID (it usually starts with `-100`).

3.  **Edit `config.json`:**
```json
{
  "telegram_group": -1001234567890, 
  "telegram_bot_token": "YOUR_BOT_TOKEN_HERE"
}
```
*Replace the numbers and token with your actual data.*

---

## ▶️ How to Run

1.  Open your terminal in the project folder.
2.  Run the server:
    ```bash
    node project.js
    ```
3.  You should see:
    > 🚀 Storage V6 (Pro Design) running at http://localhost:3000
4.  Open your web browser and go to:
    `http://localhost:3000`

### 🔧 How to Change the Port
If port `3000` is busy, open `project.js`, find this line, and change the number:
```javascript
const PORT = 3000; // Change to 4000 or 8080
```

---

## 📂 Project Structure

```text
CloudBox/
├── config.json       # Credentials (Bot Token & Group ID)
├── db.json           # Local Database (Stores file metadata)
├── project.js        # Main Backend Server (Express + Bot Logic)
├── package.json      # NPM Dependencies list
└── storage/
    └── index.html    # The Frontend UI (HTML + Tailwind + Scripts)
```

---

## 🛡️ License
This project is open-source and available for personal and educational use.

**Happy Coding!** 🚀Node.js-v18%2B-green) ![Express](https://img.shields.io/badge/Express-Server-blue) ![Telegram API](https://img.shields.io/badge/Telegram-Bot_API-2CA5E0) ![License](https://img.shields.io/badge/License-MIT-orange)

**CloudBox** is a powerful, self-hosted web application that transforms a private Telegram Group into an unlimited, secure cloud storage drive. It features a modern, high-end "Glassmorphism" UI with advanced file management capabilities.

---

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack Explained](#-tech-stack--npm-modules)
- [API Documentation](#-api-endpoints)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-%EF%B8%8F-configuration)
- [Running the App](#-how-to-run)
- [Project Structure](#-project-structure)

---

## 💡 About the Project

### The Problem
Traditional cloud storage (Google Drive, AWS S3, Dropbox) is expensive and has strict storage limits. Developers and students often need a place to dump files, code snippets, and assets without paying monthly fees.

### The Solution
Telegram allows users to upload unlimited files (up to 2GB each) for free. However, managing files inside a chat interface is difficult.
**CloudBox** acts as a "Bridge":
1.  **Web UI:** You interact with a clean, professional website.
2.  **Backend:** The server seamlessly forwards files to Telegram.
3.  **Database:** A local JSON database keeps track of files so you can search and manage them instantly.

---

## ✨ Key Features

*   **📦 Unlimited Storage:** Leveraging Telegram's infrastructure for zero-cost storage.
*   **🚀 Batch Uploads:** Drag & Drop 50+ files at once. The frontend handles sequential queuing to ensure reliability.
*   **🎨 Premium UI:** Dark mode, ambient lighting effects, glassmorphism, and responsive mobile design.
*   **👁️ Universal Previews:**
    *   **Code:** Syntax highlighting for 15+ languages (Python, JS, C++, SQL, etc.).
    *   **PDFs:** Built-in PDF viewer with Zoom In/Out controls.
    *   **Images:** Instant gallery view.
*   **🗑️ Full Management:** Delete files permanently (removes from Telegram & Database).
*   **📊 Storage Stats:** Real-time calculation of total used space (MB/GB).
*   **🔍 Instant Search:** Filter files by name instantly.

---

## 🛠 Tech Stack & NPM Modules

We use a lightweight, efficient stack to keep the application fast.

| Module | Purpose | Why we use it? |
| :--- | :--- | :--- |
| **`express`** | Web Server | Routing API requests (`GET`, `POST`) and serving the frontend HTML. |
| **`multer`** | File Handling | Processes incoming file uploads from the browser before sending them to the bot. |
| **`node-telegram-bot-api`** | Telegram Bridge | The core library that talks to Telegram (uploads documents, gets download links). |
| **`cors`** | Security | Cross-Origin Resource Sharing. Allows our frontend to fetch data from the API safely. |
| **`https`** | Data Streaming | Native Node module used to pipe binary data (like PDFs) from Telegram to the browser without downloading it first. |
| **`fs`** | Database | Native File System module to read/write the `db.json` file. |

---

## 🔌 API Endpoints

The backend (`project.js`) exposes these RESTful endpoints:

*   `GET /api/files` - Returns the list of all files from `db.json`.
*   `POST /api/upload` - Accepts `multipart/form-data` (files) and uploads them to the Telegram Group.
*   `DELETE /api/delete/:fileId` - Deletes a specific file from the database and the Telegram chat.
*   `GET /api/download/:fileId` - Generates a temporary direct download link.
*   `GET /api/content/:fileId` - Fetches raw text content (for Code View).
*   `GET /api/proxy/:fileId` - Streams binary data (Essential for the PDF Viewer to avoid CORS issues).
*   `GET /api/view/:fileId` - Redirects to the image URL.

---

## 🚀 Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js** installed.
```bash
node -v
# Should print v14.x.x or higher
```

### 2. Clone/Setup Project
Create a folder for your project and open your terminal inside it.

### 3. Install Dependencies
Run the following command to install all required modules:
```bash
npm init -y
npm install express multer node-telegram-bot-api cors
```

---

## ⚙️ Configuration

You must create a `config.json` file in the root directory to connect your Telegram Bot.

**1. Create the Bot:**
*   Open Telegram and chat with **@BotFather**.
*   Send `/newbot`, give it a name, and copy the **API Token**.

**2. Get Group ID:**
*   Create a New Group in Telegram.
*   Add your new Bot to the group as an **Admin**.
*   Forward a message from that group to **@userinfobot** (or use another ID bot) to get the Group ID (Usually starts with `-100`).

**3. Create `config.json`:**
```json
{
  "telegram_group": -100123456789,
  "telegram_bot_token": "123456789:ABC-DefGhiJklMnoPqrStuVwxYz"
}
```

---

## ▶️ How to Run

1.  Start the server:
    ```bash
    node project.js
    ```
2.  You should see the message:
    > 🚀 Storage V6 (Pro Design) running at http://localhost:3000
3.  Open your browser and visit:
    `http://localhost:3000`

### 🔧 Changing the Port
If port `3000` is occupied, open `project.js` and change:
```javascript
const PORT = 3000; // Change to 4000, 8080, etc.
```

---

## 📂 Project Structure

```text
CloudBox/
├── config.json       # API Keys (Do not commit this to Git!)
├── db.json           # Stores file metadata (created automatically)
├── project.js        # Main Backend Server
├── package.json      # Dependencies list
└── storage/
    └── index.html    # Frontend UI (HTML/CSS/JS)
```

---

## 🛡️ Git Safety
If you push this to GitHub, **create a `.gitignore` file** to protect your secrets:
```text
node_modules/
config.json
db.json
```

---

*Built with ❤️ for the Open Source Community.*
```
