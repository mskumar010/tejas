# TEJAS - Track Emails for Job Applications & statuses - Brief Overview

## 🎯 Core Concept

**Automatic job application tracking by reading your Gmail.** No manual entry - the app monitors your email, detects job-related messages, and builds your application pipeline automatically.

**Problem it solves:** Job seekers apply to 50-100+ positions but lose track of where they've applied, what stage they're at, and when to follow up.

---

## ✅ MVP Features (Must Have)

### 1. **Gmail Integration**

- OAuth 2.0 authentication (secure, no password storage)
- Connect Gmail account
- Auto-scan last 30 days of emails on first connection
- Poll for new emails every 15 minutes

### 2. **Smart Email Parsing**

Extract automatically:

- ✅ Company name (from email domain or signature)
- ✅ Job title (e.g., "Senior React Developer")
- ✅ Application status (Applied → Interview → Assignment → Rejected/Offer)
- ✅ Interview dates/times
- ✅ Assignment deadlines
- ✅ Job posting URLs

**Status Detection Keywords:**

- **Applied:** "application received", "thank you for applying"
- **Interview:** "schedule an interview", "would like to meet"
- **Assignment:** "complete this task", "coding challenge", "deadline"
- **Rejected:** "unfortunately", "not moving forward", "other candidates"
- **Offer:** "pleased to offer", "congratulations", "offer letter"

### 3. **Application Dashboard**

```
┌─────────────────────────────────────────┐
│  Applied (23)  │ Interview (5) │ Offer (1) │
├─────────────────────────────────────────┤
│                                          │
│  [Card] Google - Senior Engineer         │
│  Applied: Nov 20  |  Interview: Dec 8    │
│  📧 3 emails  |  ⏰ 2 days until interview│
│                                          │
│  [Card] Meta - Product Manager           │
│  Applied: Nov 15  |  Assignment Due: Dec 10│
│  📧 5 emails  |  ⚠️ Assignment pending    │
│                                          │
└─────────────────────────────────────────┘
```

**Features:**

- Card-based view (like Trello)
- Status pipeline: Applied → Interview → Assignment → Final
- Quick filters: "Needs Action", "Waiting", "This Week"
- Search by company/role
- Sort by date/status

### 4. **Assignment Tracker**

```
📋 Pending Assignments
├─ Meta Coding Challenge  ⏰ 3 days left
├─ Stripe Take-home       ⏰ 5 days left
└─ Netflix System Design  ⏰ Overdue by 1 day
```

### 5. **Interview Countdown**

```
🎤 Upcoming Interviews
├─ Google Phone Screen    ⏰ Tomorrow 2:00 PM
├─ Amazon Loop            ⏰ Dec 12, 9:00 AM
└─ Stripe Final Round     ⏰ Dec 15, 3:00 PM
```

### 6. **Application Timeline**

Click any application → See full history:

```
Google - Senior Software Engineer
├─ Dec 6: Phone screen scheduled
├─ Nov 28: Recruiter replied
├─ Nov 20: Application sent
└─ Nov 19: Applied via LinkedIn
```

### 7. **Email Viewer**

- Read-only view of job-related emails
- Group emails by application
- Mark as "not job-related" to improve parsing
- Quick edit if parsing is wrong

### 8. **Settings**

- Connect/disconnect Gmail
- Manual data entry option (if parsing fails)
- Export to CSV
- Notification preferences

---

## 🎨 UI/UX Design

**Style:** Clean, minimal, dashboard-focused (like Notion or Linear)

**Layout:**

```
┌─────────────────────────────────────────────┐
│ [Logo] WeTrack        [Search] [+ Add] [⚙️] │
├──────┬──────────────────────────────────────┤
│      │  📊 Overview                          │
│ 📥   │  23 Applications  |  5 Interviews     │
│ Inbox│                                       │
│      │  ────────────────────────────────    │
│ 📋   │  [Pipeline View]                      │
│ Board│  Applied → Interview → Assignment     │
│      │                                       │
│ 📧   │  [Application Cards...]               │
│ Emails                                       │
│      │                                       │
│ ⚙️   │                                       │
│ Settings                                     │
└──────┴──────────────────────────────────────┘
```

**Color Scheme:**

- 🟢 Green: Offers, positive updates
- 🔵 Blue: Interviews scheduled
- 🟡 Yellow: Action needed (assignments)
- 🔴 Red: Rejections, overdue
- ⚪ Gray: Applied, waiting

---

## 🛠️ Tech Stack (Simplified for Speed)

### Frontend

- **React + TypeScript + Vite**
- **Tailwind CSS** (fast styling)
- **Redux Toolkit** (state management)
- **Recharts** (analytics charts - optional for MVP)

### Backend

- **Node.js + Express**
- **Gmail API** (email fetching)
- **OAuth 2.0** (authentication)
- **Simple NLP/Regex** (email parsing)
  - Don't overcomplicate - regex + keyword matching is enough for MVP
  - Can add OpenAI later for 95% accuracy

### Database

- **MongoDB Atlas** (free tier)
  - Users collection
  - Applications collection
  - Emails collection (cache emails for faster access)
  - Assignments collection
  - Interviews collection

### Deployment

- **Frontend:** Vercel (free)
- **Backend:** Railway/Render (free tier)
- **Database:** MongoDB Atlas (512MB free)

---

## 📋 Database Schema

```javascript
// User
{
  email: string,
  gmailAccessToken: string,
  gmailRefreshToken: string,
  lastSyncedAt: Date
}

// Application
{
  userId: ObjectId,
  company: string,
  role: string,
  status: 'applied' | 'interview' | 'assignment' | 'offer' | 'rejected',
  source: 'linkedin' | 'indeed' | 'email' | 'direct',
  appliedDate: Date,
  jobUrl: string?,
  notes: string?
}

// Email
{
  userId: ObjectId,
  applicationId: ObjectId?,
  gmailMessageId: string,
  subject: string,
  from: string,
  body: string,
  receivedAt: Date,
  isJobRelated: boolean
}

// Assignment
{
  applicationId: ObjectId,
  description: string,
  deadline: Date,
  completed: boolean,
  url: string?
}

// Interview
{
  applicationId: ObjectId,
  scheduledDate: Date,
  type: 'phone' | 'video' | 'onsite',
  notes: string?
}
```

---

## 🚀 Development Plan (4 Weeks)

### Week 1: Foundation

- ✅ Gmail OAuth flow
- ✅ Fetch and display emails
- ✅ Basic auth (signup/login)
- ✅ Database setup

### Week 2: Parsing Engine

- ✅ Email parsing (regex + NLP)
- ✅ Auto-create applications
- ✅ Status detection
- ✅ Manual confirmation/editing

### Week 3: Dashboard

- ✅ Application cards
- ✅ Status pipeline view
- ✅ Assignment tracker
- ✅ Interview countdown
- ✅ Email viewer

### Week 4: Polish

- ✅ Error handling
- ✅ Settings page
- ✅ CSV export
- ✅ Deploy
- ✅ Demo video for portfolio

---

## 🎯 Key Features That Make It Stand Out

### 1. **Zero Manual Entry**

Most job trackers require tedious spreadsheet updates. WeTrack is automatic.

### 2. **Intelligent Parsing**

Uses NLP to understand email context, not just keywords.

### 3. **Actionable Insights**

- "You have 3 assignments due this week"
- "Follow up with Google (no response in 2 weeks)"
- "Interview tomorrow - prepare!"

### 4. **Timeline View**

Visual journey of each application from start to finish.

---

## 🔮 Future Enhancements (Post-MVP)

**Don't build these yet - they're for v2:**

1. **React Native Mobile App** - Track on the go
2. **AI-Powered Parsing** - Use GPT-4 for 95%+ accuracy
3. **LinkedIn Integration** - Auto-track portal applications
4. **Analytics Dashboard** - Response rates, success patterns
5. **Email Templates** - Quick replies and follow-ups
6. **Salary Tracking** - Compare offers
7. **Browser Extension** - One-click save from job sites
8. **Cold Email Tracker** - Monitor outreach campaigns
9. **Collaborative** - Share opportunities with friends

---

## 💡 Why This Project Is Better Than Chat Apps

| Chat Apps            | WeTrack                 |
| -------------------- | ----------------------- |
| Everyone builds them | Unique problem          |
| "Can you code?"      | "Can you think?"        |
| Tutorial-like        | Original solution       |
| Hard to stand out    | Memorable in interviews |
| Personal use: No     | Personal use: YES ✅    |

---

## 🎤 Your Interview Story

> "I was applying to 50+ jobs and losing track in spreadsheets. I built WeTrack to automatically monitor my Gmail, parse job emails using NLP, and track everything in a visual pipeline. It saved me hours and helped me stay organized. Now I can see all my applications, upcoming interviews, and pending assignments in one place."

**This shows:**

- ✅ Problem identification
- ✅ Technical skills (OAuth, APIs, parsing)
- ✅ Product thinking
- ✅ Real-world usage

---

## ⚡ MVP Scope (Be Realistic)

**Must Have:**

- ✅ Gmail OAuth + email fetching
- ✅ Basic parsing (70-80% accuracy is fine)
- ✅ Dashboard with cards
- ✅ Manual editing (when parsing fails)
- ✅ Assignment/interview tracking

**Can Skip for MVP:**

- ❌ Perfect parsing (explain limitations in demo)
- ❌ Mobile app
- ❌ Advanced analytics
- ❌ AI integration
- ❌ Multi-email accounts

**Goal:** Get a working product in 3-4 weeks that YOU use during your job search.

---

## 🎯 Success Metrics

- Parse 70%+ of job emails correctly
- Track 20+ applications without manual entry
- Dashboard loads in <2 seconds
- Zero security vulnerabilities
- Deployed and accessible via URL

---

Want me to help you:

1. Simplify the parsing logic for faster development?
2. Break down Week 1 into daily tasks?
3. Create the exact Mongoose schemas?
4. Design the dashboard layout?

This is your portfolio centerpiece - let's make it great! 🚀


# ui structure
TEJAS
│
├─ 📊 Dashboard (Main Page)
│   ├─ Overview Stats
│   ├─ Needs Attention (Alerts)
│   ├─ Application Pipeline (Kanban)
│   ├─ Upcoming Interviews
│   ├─ Pending Assessments
│   ├─ Rejected (Collapsible)
│   └─ Unrelated Emails (Confirmation)
│
├─ 📧 Email Viewer
│   ├─ Email List (Sidebar)
│   ├─ Email Content (Main)
│   └─ Link to Application
│
├─ 🏢 Companies
│   ├─ Applied To (All companies)
│   ├─ Multiple applications per company
│   └─ Cooldown Companies
│
├─ ⚙️ Settings
│   ├─ Account
│   ├─ Sync Settings
│   ├─ Notifications
│   ├─ Parsing Rules
│   └─ Data Export Data (CSV/JSON) 
│      