# TEJAS: Intelligent Job Application Tracker

> _Automating the job search pipeline so you can focus on landing the offer._

## 📖 Overview

**TEJAS** (Track Emails for Job Applications & Statuses) is an intelligent, automated job application tracking system designed to solve the chaos of modern job hunting. It integrates directly with Gmail to automatically detect, parse, and organize job application updates into a visual, Kanban-style dashboard.

Stop manually updating spreadsheets. Let Tejas build your pipeline for you.

## 🌟 Key Features

- **Zero-Touch Automation**: Securely connects via OAuth 2.0 to scan your inbox for job-related emails.
- **Smart Parsing**: Automatically extracts Company Name, Job Title, and Application Status (Applied, Interview, Offer, Rejected).
- **Visual Kanban Board**: Drag-and-drop interface to manage your application lifecycle.
- **Auto-Status Logic**: Automatically flags applications as "Ghosted" or "Follow-up Needed" based on inactivity.
- **Intelligent Insights**: Tracks interview countdowns and assessment deadlines.
- **Self-Learning Parser**: The system gets smarter as you correct it, learning new email patterns for better accuracy.

## 🛠️ Technology Stack

Tejas is built on a modern, robust tech stack:

### Frontend (`/web`)

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & Framer Motion
- **State**: Redux Toolkit

### Backend (`/server`)

- **Runtime**: Node.js + Express
- **Database**: MongoDB Atlas
- **Auth**: Google OAuth 2.0 + JWT
- **Services**: Gmail API, Node-cron

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas Configured)
- A Google Cloud Project with Gmail API enabled (for OAuth credentials)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/tejas.git
    cd tejas
    ```

2.  **Install Backend Dependencies:**

    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../web
    npm install
    ```

### 📋 Configuration

Create `.env` files in both `server` and `web` directories before running the app.

#### Backend (`server/.env`)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tejas
JWT_SECRET=your_jwt_secret_key

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

#### Frontend (`web/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

### 🏃‍♂️ Running the Application

**Start the Backend:**

```bash
cd server
npm run dev
```

**Start the Frontend:**

```bash
cd web
npm run dev
```

Visit `http://localhost:5173` (or your Vite output URL) to access the application.

## 📄 License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
