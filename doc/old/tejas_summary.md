# TEJAS - Project Documentation Summary

## 1. Core Concept (`tejas.md`)

**Tejas** is an automated job application tracker that integrates with Gmail to build your application pipeline automatically.

- **Problem:** Manual tracking of job applications is tedious and error-prone.
- **Solution:** Auto-scan emails, detect job-related messages (Applications, Interviews, Assessments), and organize them in a Trello-like dashboard.
- **Key Features:**
  - Gmail OAuth Integration.
  - Smart Parsing (Company, Role, Status).
  - Kanban Dashboard (Applied → Interview → Offer).
  - Auto-Status Updates (Time-based progression).
  - Interview Countdowns & Assessment Deadlines.

## 2. System Flow (`tejas_flow.md`)

The application follows a strict data flow from Gmail to the Dashboard.

1.  **Auth:** User logs in via Google OAuth → Backend stores tokens.
2.  **Sync:** Backend fetches emails from Gmail API (incremental sync every 15 mins).
3.  **Parsing:** Backend analyzes emails for keywords (e.g., "Schedule interview") and extracts metadata.
4.  **Storage:** Data is saved to MongoDB (Applications, Emails, Interviews).
5.  **UI:** Frontend fetches processed data and displays it on the Dashboard.
6.  **Background:** Cron jobs run periodically to sync new emails and update application statuses based on time rules.

## 3. UI & Structure (`tejas_structure.md`)

A detailed breakdown of the User Interface and Server Archetecture.

### User Interface

- **Dashboard:** Overview stats, Needs Attention alerts, Pipeline board, Upcoming Interviews.
- **Email Viewer:** Threaded view of job-related emails linked to applications.
- **Companies Page:** Track multiple apps per company, manage cooldown periods.
- **Analytics:** Funnel visualization, response rates.
- **Settings:** Sync preferences, notifications, auto-status rules.

### Automation Logic

- **Follow-ups:** Suggested after 14 days of silence (2 weeks policy).
- **No Longer Considering:** Auto-marked after 45 days.
- **Auto-Archive:** After 90 days.
- **Interview Staling:** Marked "Likely Rejected" if no update 21 days after interview.

### Database Schema Alignment

The backend implements the following Mongoose models to support this structure:

- **User:** Auth, settings, sync timestamps.
- **Application:** Core application data, status, foreign keys to User.
- **Email:** Raw and parsed email data, linked to Applications.
- **Interview:** Scheduled interview details (date, type, link).
- **Assessment:** Coding tests/take-homes with deadlines.
- **Company:** Aggregated company stats and cooldown tracking.
- **Notification:** System alerts for user actions.
