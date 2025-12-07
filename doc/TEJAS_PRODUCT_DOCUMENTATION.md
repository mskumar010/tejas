# TEJAS: Intelligent Job Application Tracker

> _Automating the job search pipeline so you can focus on landing the offer._

---

## 📖 Executive Summary

**TEJAS** (Track Emails for Job Applications & Statuses) is an intelligent, automated job application tracking system designed to solve the chaos of modern job hunting. Instead of relying on manual spreadsheet entries, TEJAS integrates directly with Gmail to automatically detect, parse, and organize job application updates into a visual dashboard.

**The Problem:** Job seekers apply to hundreds of positions but lose track of statuses, miss critical follow-ups, and get overwhelmed by inbox clutter.
**The Solution:** A zero-manual-entry dashboard that creates itself by reading your emails.

---

## 🌟 Key Features

### 1. Zero-Touch Automation

- **Gmail Integration**: Securely connects via OAuth 2.0 to scan for job-related emails.
- **Smart Parsing**: Automatically extracts Company Name, Job Title, and Application Status (Applied, Interview, Offer, Rejected).
- **Background Sync**: Polls every 15 minutes to keep the dashboard up-to-date without user intervention.

### 2. Intelligent Pipeline Management

- **Visual Kanban Board**: Drag-and-drop interface (Applied → Screening → Interview → Offer) that mirrors the real-world hiring process.
- **Status Detection**: Uses Natural Language Processing (NLP) and keyword weighting to determine if an email is a rejection, an interview invite, or an assessment request.
- **Auto-Status Logic**: Automatically flags applications as "Ghosted" or "Follow-up Needed" based on periods of inactivity.

### 3. Actionable Insights & Alerts

- **Interview Countdown**: Highlights upcoming interviews with a countdown timer.
- **Assessment Tracker**: Tracks deadlines for take-home assignments and coding challenges.
- **"Needs Attention"**: A dedicated priority view for overdue tasks, expiring offers, or unread recruiter messages.

### 4. Self-Learning Parser

- **Adaptive Accuracy**: The system learns from user corrections. If the user corrects a parsed company name, the system updates its pattern library to improve future accuracy.
- **Confidence Scoring**: Each parsed field comes with a confidence score, alerting the user to double-check uncertain data.

---

## 🛠️ Technology Stack

TEJAS is built on a modern, scalable, and type-safe stack designed for performance and reliability.

### Frontend

- **Framework**: React 19 + Vite (High-performance SPA)
- **Language**: TypeScript (Strict type safety)
- **Styling**: Tailwind CSS v4 (Utility-first design system)
- **State Management**: Redux Toolkit (Centralized data store)
- **Animations**: Framer Motion (Smooth UI transitions)
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js + Express
- **Database**: MongoDB Atlas (Scalable document storage)
- **Authentication**: OAuth 2.0 (Google) + JWT (Session management)
- **Email Fetching**: Gmail API (Read-only access)
- **Scheduling**: Node-cron (Background synchronization tasks)

### Infrastructure

- **Hosting**: Vercel (Frontend) / Railway or Render (Backend)
- **Security**:
  - Standardized OAuth scopes (Limited to `gmail.readonly`)
  - Encrypted tokens
  - CORS policies

---

## 🔄 Core User Flows

### 1. The Onboarding Flow

1. **User Lands**: User visits `tejas.app` and clicks "Sign in with Gmail".
2. **Authorize**: Google OAuth consent screen requests permission to read emails.
3. **Initial Sync**: Backend fetches the last 30 days of emails.
4. **Parsing**: The engine filters for keywords (e.g., "application received", "interview", "offer") and creates the initial dashboard.
5. **Dashboard Reveal**: User is redirected to the dashboard, populated with their active job applications.

### 2. The "New Email" Flow (Background)

1. **Cron Job**: Every 15 minutes, the system checks for new emails.
2. **Detection**: A new email arrives from "recruiter@google.com" with subject "Interview Schedule".
3. **Extraction**:
   - Company: "Google" (from domain)
   - Status: "Interview" (from keywords "schedule", "meet")
   - Date: "Dec 10, 2:00 PM" (regex extraction)
4. **Update**: The existing application for Google is moved from "Applied" to "Interview" column.
5. **Notification**: User sees a "New Interview" alert on their dashboard.

### 3. The Pattern Learning Flow

1. **Prediction**: System parses an email from a new ATS (Applicant Tracking System) as "Unknown Company".
2. **Correction**: User manually edits the card to say "Stripe".
3. **Learning**: The system analyzes the email structure again, associates the specific "From" address or subject pattern with "Stripe", and saves this pattern.
4. **Improvement**: Next time an email matches this pattern, it auto-detects "Stripe" with high confidence.

---

## 🏗️ Technical Architecture

### Database Schema (Simplified)

**User Collection**

- `email`: User's identifier
- `gmailTokens`: Access/Refresh tokens (Encrypted)
- `lastSyncedAt`: Timestamp for incremental syncing

**Application Collection**

- `company`: String (e.g., "Netflix")
- `role`: String (e.g., "Senior Engineer")
- `status`: Enum (Applied, Screening, Interview, Offer, Rejected, etc.)
- `events`: Array (Timeline of emails/updates)
- `cooldown`: Date (When to re-apply if rejected)

**Email Collection**

- `rawContent`: Snippet of the email (for context)
- `isJobRelated`: Boolean flag
- `parsedData`: JSON object of extracted fields

### System Structure

```
TEJAS
├── 🖥️ Web (Frontend)
│   ├── src/components/ (Dashboard, Kanban, StatsCard)
│   ├── src/store/ (Redux slices for Applications, User)
│   └── src/utils/ (Date formatters, API clients)
│
├── ⚙️ Server (Backend)
│   ├── src/services/ (GmailService, ParserEngine)
│   ├── src/models/ (Mongoose Schemas)
│   ├── src/routes/ (Auth, Sync, Applications)
│   └── src/cron/ (Scheduled tasks)
```

---

## 🔮 Future Roadmap

1.  **AI-Powered Parsing**: Integration with LLMs (e.g., GPT-4o) for 99% accuracy in understanding complex email threads.
2.  **Browser Extension**: "One-click Save" button for job boards (LinkedIn, Indeed) to track applications even before the confirmation email arrives.
3.  **Salary Negotiation Assistant**: Benchmarking offer details against market data.
4.  **Mobile App**: React Native wrapper for on-the-go status checks.

---

_Tejas is not just a tool; it's your personal career assistant, working 24/7 to ensure you never miss an opportunity._
