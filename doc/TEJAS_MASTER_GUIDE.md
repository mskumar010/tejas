# TEJAS — Master Build Guide
> Track Emails for Job Applications & Statuses

---

# ⚡ QUICK SUMMARY (Read This First)

**What TEJAS does:** Connects to Gmail → reads job emails → tags them → shows clean status dashboard. Zero manual entry.

**Core engine (same for both versions):**
- Email domain → company name (Layer 1, 90% accurate)
- Subject line regex → role + status (Layer 2, 60% of emails solved here)
- Weighted keyword scoring → status confidence (Layer 3)
- Tag system → everything is queryable (Layer 4)
- Self-learning → user corrections improve future parses (Layer 5)
- **Realistic accuracy ceiling: 82–85%**

**Two versions, one engine:**
- **Normal** — clean, minimal, average user, MVP scope
- **Advanced** — more data, more control, power user, post-MVP

**Tech stack:** React + TypeScript + Vite → Vercel | Node.js + Express → Railway | MongoDB Atlas (free)

**3 pages only:** Dashboard · Email Viewer · Settings

---
---

# VERSION 1 — NORMAL (MVP)
### *For the average job seeker. Simple. Fast. Just works.*

---

## QUICK REFERENCE

| What | Answer |
|---|---|
| Pages | Dashboard, Email Viewer, Settings |
| Parser accuracy | ~80% |
| Hosting cost | $0 (free tiers) |
| Google OAuth limit | 100 test users |
| Core data model | Tag system |
| Manual fallback | Yes, always |

---

## 1. USER FLOW (What the user actually does)

### Step 1 — Land on the site
- One screen: Logo, one-line description, "Sign in with Gmail" button
- No clutter. No feature list. No pricing table.

### Step 2 — Sign in with Gmail
- Google OAuth 2.0 consent screen
- We request **one scope only:** `gmail.readonly`
- User sees: "TEJAS wants to read your emails" — nothing more

### Step 3 — Onboarding (2 questions only)
After login, before the dashboard loads, ask exactly two things:

```
Q1: How far back should we scan?
    [ Last 30 days ]  [ Last 3 months ]  [ Last 6 months ]

Q2: Roughly how many jobs do you apply to per week?
    [ 1–5 ]  [ 5–15 ]  [ 15+ ]
```

Q2 helps calibrate false positive tolerance. That's it. No more questions.

### Step 4 — Initial sync
- Backend scans emails for the chosen period
- Parsing runs silently
- Loading screen: "Finding your applications..." with a progress indicator
- Redirect to dashboard when done

### Step 5 — Use the dashboard
- User sees their applications, grouped by status
- Clicks a card to see details
- Corrects any wrong parses inline
- Done. Come back tomorrow for new updates.

---

## 2. THE TAG SYSTEM (Core Architecture)

Every parsed email becomes a tag object. This is the foundation of everything.

```javascript
// Every email produces one tag object
{
  emailId: "gmail_msg_id_abc123",
  company: "Google",           // from domain or body
  role: "Software Engineer",   // from subject or body
  status: "interview",         // applied | interview | assessment | offer | rejected | unknown
  date: "2025-12-06",          // email received date
  actionDate: "2025-12-10",    // interview/deadline date if found
  confidence: 87,              // 0–100
  source: "naukri",            // linkedin | naukri | direct | indeed | unknown
  tags: ["has_deadline", "action_required"]  // extra flags
}
```

**Why this matters:** Every filter on the dashboard is just a query on these tags.
- "Show rejected" → `status === "rejected"`
- "Needs action" → `tags.includes("action_required")`
- "This week's interviews" → `status === "interview" && actionDate within 7 days`

No complex logic in the UI. All logic happens at parse time.

---

## 3. PARSING ENGINE (5 Layers)

### Layer 1 — Domain Extraction (90% accuracy for company)
```
recruiter@google.com       → Google
careers@infosys.com        → Infosys
no-reply@greenhouse.io     → (skip, it's an ATS)
noreply@lever.co           → (skip, it's an ATS)
```
Known ATS domains to skip: `greenhouse.io`, `lever.co`, `workday.com`, `taleo.net`, `icims.com`, `smartrecruiters.com`
When ATS domain detected → extract company from email body instead.

### Layer 2 — Subject Line Regex (catches 60% of emails)
```
"Your application for [ROLE] at [COMPANY]"      → Applied
"Interview invitation: [ROLE] at [COMPANY]"     → Interview
"Assessment for [ROLE] — [COMPANY]"             → Assessment
"Update on your application to [COMPANY]"       → check body
"Thank you for applying to [COMPANY]"           → Applied
```

### Layer 3 — Weighted Keyword Scoring (status detection)

Score each status by keyword hits × weight. Highest score wins.

| Status | Keywords | Weight |
|---|---|---|
| Rejected | "regret to inform", "not moving forward", "other candidates", "decided to pursue", "will not be considering" | 10 |
| Offer | "pleased to offer", "offer letter", "congratulations on", "accept the offer" | 10 |
| Assessment | "complete the assessment", "coding challenge", "hackerrank", "test link", "submit by" | 10 |
| Interview | "schedule an interview", "would like to meet", "phone screen", "video call", "next round" | 8 |
| Applied | "received your application", "thank you for applying", "successfully applied", "under review" | 5 |

**Rule:** If top score < 15 and second score within 5 points → confidence = low → show to user for confirmation.

### Layer 4 — Tag Assignment
After scoring, assign final tags:
- `action_required` → if status is `assessment` or `interview`
- `has_deadline` → if a future date was extracted
- `low_confidence` → if overall confidence < 60
- `needs_review` → show on dashboard for user to confirm

### Layer 5 — Self-Learning
When user corrects a parse:
- If company was wrong → store `{fromDomain: "x.com", correctCompany: "Stripe"}` in corrections DB
- If status was wrong → decrease weight of matched keyword by 1, increase weight of correct status keywords
- Next email from same domain → use stored correction first, before running parser

---

## 4. DASHBOARD (Normal Version)

### Layout
```
┌──────────────────────────────────────────────┐
│  TEJAS          [Search...]    [Sync] [⚙️]   │
├──────────────────────────────────────────────┤
│                                              │
│  📊 OVERVIEW                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │
│  │   23   │ │   4    │ │   2    │ │   1   │ │
│  │Applied │ │Intervw │ │Assessmt│ │ Offer │ │
│  └────────┘ └────────┘ └────────┘ └───────┘ │
│                                              │
│  ⚠️ NEEDS ATTENTION                          │
│  ├─ Meta assessment due in 2 days            │
│  └─ Google interview tomorrow 2pm            │
│                                              │
│  📋 APPLICATIONS                             │
│  [ All ] [ Interview ] [ Assessment ] [ ... ]│
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 🔵 Google · Software Engineer        │    │
│  │ Interview · Dec 10, 2pm · 4 days     │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 🟡 Meta · Frontend Developer         │    │
│  │ Assessment due Dec 8 · 2 days left   │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ ⚪ Infosys · React Developer          │    │
│  │ Applied · Nov 28 · Waiting           │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 🔴 TCS · Full Stack Developer        │    │
│  │ Rejected · Nov 25                    │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

### Card Colors
- 🔵 Blue = Interview scheduled
- 🟡 Yellow = Action needed (assessment/response required)
- 🟢 Green = Offer received
- ⚪ Grey = Applied / waiting
- 🔴 Red = Rejected

### Card Click → Detail View
```
Google · Software Engineer
Status: Interview Scheduled
Applied: Nov 20
Interview: Dec 10, 2:00 PM
Emails: 3 emails from this company  [View Emails →]

[Edit Details]  [Mark as Incorrect Parse]
```

### "Needs Attention" Section Rules
Show here if:
- Assessment deadline within 5 days
- Interview within 2 days
- Low confidence parse needs user review (`low_confidence` tag)
- No update in 14 days on an active application → "Consider following up"

### What is NOT on the dashboard (Normal)
- No analytics charts
- No kanban drag-and-drop
- No cooldown period tracking
- No companies page
- No application pipeline visualisation

Keep it simple. User sees status. User takes action. Done.

---

## 5. EMAIL VIEWER

- Left sidebar: list of job-related emails, sorted by date
- Right panel: email content (read-only)
- Each email shows: sender, subject, date, which application it belongs to
- Button: "This is not job-related" → removes from dashboard, trains parser
- Button: "Fix parsing" → inline edit for company/role/status

**Not shown:** All non-job emails. They don't exist in this view.

---

## 6. SETTINGS PAGE

| Setting | Options |
|---|---|
| Gmail account | Connected as X · Disconnect |
| Sync frequency | Every 15 min / Every hour / Manual only |
| Scan depth | Change how far back to scan |
| Export data | Download as CSV |
| Delete all data | Nuclear option, clears everything |

Nothing else.

---

## 7. TECH STACK & HOSTING

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS (styling)
- Redux Toolkit (state)
- Deployed on **Vercel** (free)

### Backend
- Node.js + Express
- Gmail API (read-only)
- node-cron (15-min sync)
- Deployed on **Railway** or **Render** (free tier)

### Database
- **MongoDB Atlas** — free 512MB tier
- Collections: `users`, `applications`, `emails`, `patterns`

### Cost to run for 100 users: $0

---

## 8. DATABASE SCHEMA (Minimal)

```javascript
// User
{
  _id, email, gmailAccessToken, gmailRefreshToken,
  lastSyncedAt, scanDepthDays, weeklyApplicationVolume
}

// Application (one per job)
{
  _id, userId,
  company, role, status,
  appliedDate, lastEmailDate, actionDate,
  confidence, tags: [],
  emailIds: [],      // linked Gmail message IDs
  userCorrected: Boolean
}

// Email (raw + parsed)
{
  _id, userId, applicationId,
  gmailMessageId, subject, from, snippet,
  receivedAt, isJobRelated,
  parsedTags: {}     // the tag object from parser
}

// PatternCorrections (self-learning store)
{
  _id, fromDomain, correctCompany,
  subjectPattern, correctStatus,
  timesUsed, successCount
}
```

---

## 9. KNOWN LIMITATIONS (Tell users upfront)

- Parser accuracy: ~80%. You will need to correct ~1 in 5 emails.
- HTML-only emails from some ATS systems may parse poorly.
- Very new or obscure companies may not extract correctly.
- The app only reads emails. It cannot send, delete, or modify anything.
- First sync on 6 months of data may take 1–2 minutes.

---

## 10. MVP CHECKLIST

**Must have before any user touches it:**
- [ ] Gmail OAuth working
- [ ] Initial email scan + parse
- [ ] Dashboard with status cards
- [ ] "Fix parsing" inline edit
- [ ] "Not job related" button
- [ ] Self-learning corrections stored
- [ ] 15-minute background sync
- [ ] Rate limiting on Gmail API calls (max 10 concurrent)
- [ ] CSV export
- [ ] Settings page

**Do NOT build yet:**
- Analytics charts
- Kanban drag-and-drop
- Mobile app
- Companies page
- Cooldown tracking
- AI integration

---
---

# VERSION 2 — ADVANCED
### *For power users who want full visibility and control.*

> Same parsing engine. Same tag system. More data surfaces, more control, more detail.

---

## QUICK REFERENCE

| What | Answer |
|---|---|
| Extra pages | + Analytics, + Companies |
| Dashboard extras | Cooldown tracker, pipeline view, company stats |
| Parser extras | Cooldown period extraction, job ID, assessment platform |
| Tag extras | `cooldown_active`, `multi_application`, `ghosted` |
| Self-learning extras | Pattern export/import, per-pattern stats visible to user |
| Auto-status rules | Full automation logic (ghosted, no-longer-considering, follow-up) |

---

## 1. EXTENDED TAG OBJECT

```javascript
{
  emailId: "gmail_msg_id_abc123",
  company: "IBM",
  companyVariants: ["IBM India", "IBM Corporation"],  // normalized to root
  role: "Application Developer",
  status: "rejected",
  date: "2025-12-06",
  actionDate: null,
  confidence: 95,
  source: "direct",
  jobId: "71863",              // extracted job reference number
  cooldown: {
    active: true,
    duration: 12,
    unit: "months",
    reapplyAfter: "2026-12-06"
  },
  assessment: {
    platform: "HackerRank",    // HackerRank | HackerEarth | Codility | custom
    deadline: "2025-12-10",
    type: "coding"             // coding | aptitude | spoken | written
  },
  patternsUsed: ["domain_extraction", "subject_regex_v2", "keyword_rejected_v1"],
  tags: ["has_deadline", "action_required", "cooldown_active", "low_confidence"]
}
```

---

## 2. EXTENDED DASHBOARD

Everything in Normal version, plus:

### Extra Sections

**Cooldown Tracker**
```
🚫 COOLDOWN COMPANIES (Cannot reapply yet)
├─ IBM India · Rejected Nov 2025 · Reapply after: Nov 2026
├─ Wipro · Rejected Oct 2025 · Reapply after: Apr 2026
└─ TCS · Rejected Sep 2025 · Reapply after: Mar 2026
```

**Application Pipeline View** (non-drag-and-drop, just visual)
```
Applied (23) → Interview (4) → Assessment (2) → Offer (1)
     └─ Rejected (18)            └─ Ghosted (3)
```

**Companies View** (inside dashboard as a tab, not a separate page)
```
Google        3 applications  |  1 active  |  Last: Dec 2025
Meta          2 applications  |  0 active  |  Last: Nov 2025
IBM           1 application   |  0 active  |  COOLDOWN until Nov 2026
```

---

## 3. AUTO-STATUS RULES (Time-based automation)

These run via the cron job, no user action needed:

| Rule | Trigger | Action |
|---|---|---|
| Follow-up suggestion | No reply in 14 days after applying | Tag `suggest_followup` |
| Ghosted | No update in 30 days after interview | Status → `ghosted` |
| No longer considering | 45 days of silence after applying | Tag `likely_closed` |
| Auto-archive | 90 days of no activity | Move to archived |
| Cooldown expiry | Reapply date reached | Remove `cooldown_active` tag, notify user |

---

## 4. EXTENDED PARSING — EXTRA EXTRACTIONS

On top of the 5 layers in Normal version, also extract:

### Cooldown Period
```
Keywords: "6 months", "12 months", "one year", "six months"
Context check: appears near "reapply", "future opportunities", "keep your profile"
Output: cooldown.duration + cooldown.unit
```

### Job ID / Reference Number
```
Patterns:
  "Job ID: 71863"
  "Reference: REF-2025-ABC"
  "Requisition #: 4421"
  Regex: /(job\s*id|ref(?:erence)?|req(?:uisition)?)[:\s#]+([A-Z0-9\-]+)/i
```

### Assessment Platform Detection
```
Keywords → Platform:
  "hackerrank.com"     → HackerRank
  "hackerearth.com"    → HackerEarth
  "codility.com"       → Codility
  "spoken language"    → IBM Spoken Language Assessment
  "hirevue"            → HireVue (video)
  "mettl"              → Mercer | Mettl
```

### Company Name Normalization
```
"IBM India Pvt Ltd"    → IBM
"Google LLC"           → Google
"Amazon.com Inc."      → Amazon
"Tata Consultancy Services" → TCS
```
Maintain a normalization map in `companyAliases.json`. User corrections auto-add to this map.

---

## 5. ANALYTICS PAGE (Advanced only)

Simple stats, no fancy charts needed for v1 of this page:

```
📈 YOUR JOB SEARCH STATS

Total applications:     47
Response rate:          34%  (16 of 47 got any response)
Interview rate:         17%  (8 of 47 reached interview)
Offer rate:              4%  (2 of 47 got offers)

Most applied to:        Infosys (4), TCS (3), Wipro (3)
Best response source:   Direct applications (42% response rate)
Avg time to rejection:  11 days
Avg time to interview:  8 days

Active applications:    12
Cooldown companies:      3
```

No chart library needed for MVP of analytics. Plain numbers are more readable anyway.

---

## 6. PATTERN LIBRARY — VISIBLE TO USER (Advanced only)

In Settings → Parsing Rules, advanced users can see:

```
ACTIVE PATTERNS

Domain Rules (23)
  google.com          → Google         ✓ Used 12x  ✓ 100% accurate
  infosys.com         → Infosys        ✓ Used 4x   ✓ 100% accurate

Subject Patterns (18)
  "application for * at *"  → Applied  ✓ Used 34x  ✓ 94% accurate
  "interview * [COMPANY]"   → Interview ✓ Used 8x  ✓ 87% accurate

Status Keywords
  "regret to inform"  Weight: 10   ✓ Used 18x  ✓ 100%
  "not moving forward" Weight: 10  ✓ Used 9x   ✓ 89%

[Export Pattern Library]  [Import Pattern Library]
[Reset to Default Patterns]
```

This is the power user's superpower. They can see exactly why the parser made a decision.

---

## 7. FEEDBACK API (Self-Learning — Full Spec)

```javascript
// Endpoint: POST /api/parser/feedback
{
  emailId: "abc123",
  isCorrect: false,
  corrections: {
    company: "IBM India",      // what it should have been
    status: "assessment",
    role: "Application Developer"
  }
}

// What happens internally:
// 1. Find which patterns fired on this email
// 2. For each wrong field:
//    - Decrease confidence of fired pattern by 10
//    - If confidence < 40 → flag for review
// 3. For each corrected field:
//    - Extract regex pattern from surrounding email text
//    - Test against last 20 emails
//    - If match rate > 70% → add to pattern library with confidence 75
// 4. Save correction to PatternCorrections collection
// 5. Next email from same domain → apply correction first
```

---

## 8. EXTENDED DATABASE SCHEMA (Advanced additions)

```javascript
// Company (aggregated view)
{
  _id, userId,
  name, normalizedName,
  applicationIds: [],
  totalApplications,
  activeApplications,
  cooldown: { active: Boolean, until: Date },
  lastContactDate
}

// Pattern (self-learning store)
{
  _id,
  field: "company" | "role" | "status",
  pattern: String,       // regex string
  confidence: Number,    // 0–100
  successCount, failCount,
  lastUsed: Date,
  addedBy: "system" | "user_correction"
}

// Analytics snapshot (computed periodically)
{
  userId,
  computedAt: Date,
  totalApplications,
  responseRate,
  interviewRate,
  offerRate,
  avgDaysToRejection,
  avgDaysToInterview,
  sourceBreakdown: {}
}
```

---

## 9. WHAT ADVANCED DOES NOT ADD TO PARSER

To be clear: the Advanced version does NOT make the parser more accurate. Both versions share the same 5-layer parsing engine. Advanced only surfaces more extracted data and gives users more control.

**Accuracy is the same: ~80–85% for both.**

The only way accuracy improves is through user corrections feeding the self-learning system — and that's available in both versions.

---

## 10. ADVANCED SETTINGS EXTRAS

| Setting | Options |
|---|---|
| Auto-status rules | Enable/disable each rule (follow-up, ghosted, archive) |
| Cooldown defaults | Set default cooldown when not found in email (6mo / 12mo / none) |
| Parsing rules | View/export/import pattern library |
| Company aliases | View/edit company name normalization map |
| Confidence threshold | Set minimum confidence before auto-accepting parse (default: 70) |
| Export data | CSV or JSON |

---
---

# APPENDIX — SHARED REFERENCE

## Onboarding Questions (Both Versions)

```
Q1: How far back should we scan your Gmail?
    [ Last 30 days ]  [ Last 3 months ]  [ Last 6 months ]

Q2: Roughly how many jobs do you apply to per week?
    [ 1–5 "Selective" ]  [ 5–15 "Active" ]  [ 15+ "Aggressive" ]
```

Q2 is used to set the false-positive tolerance threshold. Aggressive appliers → more permissive matching. Selective appliers → stricter matching, fewer false positives.

---

## Status Definitions

| Status | Meaning |
|---|---|
| `applied` | Application submitted, no response yet |
| `interview` | Interview invited or scheduled |
| `assessment` | Coding test / assignment / task sent |
| `offer` | Job offer received |
| `rejected` | Explicitly rejected |
| `ghosted` | (Advanced) No update 30+ days after interview |
| `unknown` | Parser could not determine status |

---

## Gmail API Rate Limit Fix (Critical — Both Versions)

Never fire parallel Gmail API requests. Always batch:

```javascript
// BAD — will get HTTP 429
const results = await Promise.all(ids.map(id => gmail.get(id)));

// GOOD — max 10 concurrent
import pLimit from 'p-limit';
const limit = pLimit(10);
const results = await Promise.all(ids.map(id => limit(() => gmail.get(id))));
```

---

## ATS Domain Skip List

Always extract company from body, not domain, when sender is from these:
```
greenhouse.io, lever.co, workday.com, taleo.net,
icims.com, smartrecruiters.com, myworkdayjobs.com,
successfactors.com, brassring.com, jobvite.com,
kenexa.com, silkroad.com, recruitee.com
```

---

## Confidence Score Formula

```
confidence = (
  companyConfidence × 0.30 +
  roleConfidence    × 0.25 +
  statusConfidence  × 0.35 +
  dateConfidence    × 0.10
) × patternSuccessRate
```

If any field is `unknown`, its contribution to confidence = 0.

---

*End of TEJAS Master Guide*
*Normal version = your build target. Advanced version = your v2 roadmap.*
*Parser is the same. Ship Normal. Layer Advanced on top later.*
