
# This is a refwerence doc no need to implement exactly as it is but this is a complete flow breakdown of tejas

# TEJAS - Complete Flow Breakdown

Let me walk you through **one email's journey** from login to dashboard display.

---

## 🔄 Complete Flow: Login → Email → Dashboard

### **Scenario:** User gets an interview email from Google

---

## 📧 The Email (Example)

```
From: recruiter@google.com
To: user@gmail.com
Subject: Google - Software Engineer Interview

Hi John,

Thank you for applying to the Software Engineer position at Google.

We'd like to schedule a phone interview with you on December 10, 2024 at 2:00 PM PST.

Please confirm your availability.

Best regards,
Sarah - Google Recruiting
```

---

## 🎬 STEP-BY-STEP FLOW

---

### **STEP 1: User Opens TEJAS**

**Frontend (React):**
```
User visits: https://tejas.app
├─ Sees landing page
└─ Clicks "Sign In with Gmail"
```

**What happens:**
- Frontend redirects to backend OAuth endpoint

---

### **STEP 2: Gmail Authentication**

**Backend (Express):**
```javascript
// Route: GET /auth/google
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
  });
  res.redirect(authUrl); // Redirect to Google's login
});
```

**What user sees:**
```
Google OAuth Screen
├─ "TEJAS wants to access your Gmail"
├─ "Read your emails"
└─ [Allow] [Deny] buttons
```

**User clicks Allow**

---

### **STEP 3: OAuth Callback**

**Backend receives authorization code from Google:**

```javascript
// Route: GET /auth/google/callback?code=ABC123
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  // 1. Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code);
  
  // 2. Get user's Gmail address
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const profile = await gmail.users.getProfile({ userId: 'me' });
  
  // 3. Save user to database
  const user = await User.findOneAndUpdate(
    { email: profile.data.emailAddress },
    {
      email: profile.data.emailAddress,
      gmailAccessToken: tokens.access_token,
      gmailRefreshToken: tokens.refresh_token,
      lastSyncedAt: null
    },
    { upsert: true, new: true }
  );
  
  // 4. Create JWT for frontend
  const jwtToken = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // 5. Redirect to frontend with token
  res.redirect(`https://tejas.app/dashboard?token=${jwtToken}`);
});
```

**Database now has:**
```javascript
User {
  _id: "67890",
  email: "user@gmail.com",
  gmailAccessToken: "ya29.a0AX...",
  gmailRefreshToken: "1//0eF...",
  lastSyncedAt: null
}
```

---

### **STEP 4: Frontend Receives Token**

**Frontend (React):**
```javascript
// Component: Dashboard.tsx
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Save token to localStorage
    localStorage.setItem('authToken', token);
    
    // Trigger initial email sync
    dispatch(syncEmails());
  }
}, []);
```

**What user sees:**
```
Loading screen:
"Syncing your emails... This may take a minute."
[Progress spinner]
```

---

### **STEP 5: Initial Email Sync**

**Frontend calls backend:**
```javascript
// Redux action
const syncEmails = () => async (dispatch) => {
  dispatch({ type: 'SYNC_START' });
  
  const response = await axios.post('/api/emails/sync', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  dispatch({ type: 'SYNC_SUCCESS', payload: response.data });
};
```

---

### **STEP 6: Backend Fetches Emails from Gmail**

**Backend:**
```javascript
// Route: POST /api/emails/sync
app.post('/api/emails/sync', authenticateToken, async (req, res) => {
  const user = await User.findById(req.userId);
  
  // 1. Setup Gmail API client
  oauth2Client.setCredentials({
    access_token: user.gmailAccessToken,
    refresh_token: user.gmailRefreshToken
  });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  // 2. Fetch emails from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const query = `after:${Math.floor(thirtyDaysAgo.getTime() / 1000)}`;
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 100
  });
  
  const messageIds = response.data.messages || [];
  
  // 3. Fetch full details for each email
  const emails = [];
  for (const { id } of messageIds) {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: id,
      format: 'full'
    });
    
    // Extract email data
    const headers = msg.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value;
    const from = headers.find(h => h.name === 'From')?.value;
    const date = headers.find(h => h.name === 'Date')?.value;
    
    // Get body (simplified)
    let body = '';
    if (msg.data.payload.body.data) {
      body = Buffer.from(msg.data.payload.body.data, 'base64').toString();
    }
    
    emails.push({ id, subject, from, date, body });
  }
  
  // 4. Parse each email for job content
  const parsedApplications = [];
  for (const email of emails) {
    const parsed = await parseJobEmail(email, user._id);
    if (parsed) {
      parsedApplications.push(parsed);
    }
  }
  
  // 5. Update last synced time
  user.lastSyncedAt = new Date();
  await user.save();
  
  res.json({ 
    success: true, 
    emailsProcessed: emails.length,
    applicationsFound: parsedApplications.length
  });
});
```

---

### **STEP 7: Email Parsing (THE MAGIC)**

**Backend parsing function:**
```javascript
async function parseJobEmail(email, userId) {
  const { subject, from, body, date, id } = email;
  
  // 1. Check if it's job-related
  const jobKeywords = [
    'application', 'interview', 'job', 'position', 
    'candidate', 'recruiter', 'hiring', 'offer'
  ];
  
  const isJobRelated = jobKeywords.some(keyword => 
    subject.toLowerCase().includes(keyword) || 
    body.toLowerCase().includes(keyword)
  );
  
  if (!isJobRelated) return null;
  
  // 2. Extract company name
  const fromEmail = from.match(/<(.+)>/)?.[1] || from;
  const domain = fromEmail.split('@')[1];
  const company = domain.split('.')[0]; // "recruiter@google.com" → "google"
  
  // 3. Extract job title from subject/body
  const titlePatterns = [
    /for (?:the )?(.+?) position/i,
    /(.+?) - interview/i,
    /applied (?:for|to) (.+)/i
  ];
  
  let jobTitle = 'Unknown Position';
  for (const pattern of titlePatterns) {
    const match = subject.match(pattern) || body.match(pattern);
    if (match) {
      jobTitle = match[1].trim();
      break;
    }
  }
  
  // 4. Detect status
  let status = 'applied';
  if (/interview|schedule|meet/i.test(body)) {
    status = 'interview';
  } else if (/unfortunately|not moving forward|regret/i.test(body)) {
    status = 'rejected';
  } else if (/offer|congratulations|pleased to offer/i.test(body)) {
    status = 'offer';
  } else if (/assignment|task|challenge|complete/i.test(body)) {
    status = 'assignment';
  }
  
  // 5. Extract interview date (if status is interview)
  let interviewDate = null;
  if (status === 'interview') {
    const datePattern = /(?:on|schedule for) ([A-Z][a-z]+ \d+, \d{4}(?: at \d+:\d+ [AP]M)?)/i;
    const match = body.match(datePattern);
    if (match) {
      interviewDate = new Date(match[1]);
    }
  }
  
  // 6. Save to database
  // First, check if application already exists
  let application = await Application.findOne({
    userId,
    company: new RegExp(company, 'i'),
    role: new RegExp(jobTitle, 'i')
  });
  
  if (!application) {
    // Create new application
    application = await Application.create({
      userId,
      company: company.charAt(0).toUpperCase() + company.slice(1),
      role: jobTitle,
      status,
      appliedDate: new Date(date),
      source: 'email'
    });
  } else {
    // Update existing application
    application.status = status;
    await application.save();
  }
  
  // 7. Save email reference
  await Email.create({
    userId,
    applicationId: application._id,
    gmailMessageId: id,
    subject,
    from,
    body,
    receivedAt: new Date(date),
    isJobRelated: true
  });
  
  // 8. If interview detected, create interview entry
  if (status === 'interview' && interviewDate) {
    await Interview.create({
      applicationId: application._id,
      scheduledDate: interviewDate,
      type: 'phone', // default
      notes: `Extracted from email: ${subject}`
    });
  }
  
  return application;
}
```

**What's saved in database:**
```javascript
Application {
  _id: "app123",
  userId: "67890",
  company: "Google",
  role: "Software Engineer",
  status: "interview",
  appliedDate: "2024-11-20",
  source: "email"
}

Email {
  _id: "email456",
  userId: "67890",
  applicationId: "app123",
  gmailMessageId: "msg789",
  subject: "Google - Software Engineer Interview",
  from: "recruiter@google.com",
  body: "Hi John, Thank you for...",
  receivedAt: "2024-12-06",
  isJobRelated: true
}

Interview {
  _id: "int999",
  applicationId: "app123",
  scheduledDate: "2024-12-10T14:00:00Z",
  type: "phone",
  notes: "Extracted from email: Google - Software Engineer Interview"
}
```

---

### **STEP 8: Frontend Receives Parsed Data**

**Backend response:**
```json
{
  "success": true,
  "emailsProcessed": 87,
  "applicationsFound": 12
}
```

**Frontend updates Redux store:**
```javascript
// Redux slice
const applicationsSlice = createSlice({
  name: 'applications',
  initialState: { items: [], loading: false },
  reducers: {
    SYNC_SUCCESS: (state, action) => {
      state.loading = false;
      // Fetch applications list
    }
  }
});
```

**Frontend fetches applications:**
```javascript
// After sync, get all applications
const fetchApplications = () => async (dispatch) => {
  const response = await axios.get('/api/applications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  dispatch({ 
    type: 'SET_APPLICATIONS', 
    payload: response.data 
  });
};
```

---

### **STEP 9: Backend Returns Applications**

**Backend:**
```javascript
// Route: GET /api/applications
app.get('/api/applications', authenticateToken, async (req, res) => {
  const applications = await Application.find({ userId: req.userId })
    .sort({ appliedDate: -1 })
    .lean();
  
  // For each application, get related data
  const enriched = await Promise.all(
    applications.map(async (app) => {
      const emailCount = await Email.countDocuments({ applicationId: app._id });
      const interview = await Interview.findOne({ applicationId: app._id });
      const assignment = await Assignment.findOne({ applicationId: app._id });
      
      return {
        ...app,
        emailCount,
        interview,
        assignment
      };
    })
  );
  
  res.json(enriched);
});
```

**Response:**
```json
[
  {
    "_id": "app123",
    "company": "Google",
    "role": "Software Engineer",
    "status": "interview",
    "appliedDate": "2024-11-20",
    "emailCount": 3,
    "interview": {
      "scheduledDate": "2024-12-10T14:00:00Z",
      "type": "phone"
    },
    "assignment": null
  },
  {
    "_id": "app124",
    "company": "Meta",
    "role": "Frontend Developer",
    "status": "applied",
    "appliedDate": "2024-11-15",
    "emailCount": 1,
    "interview": null,
    "assignment": null
  }
]
```

---

### **STEP 10: Frontend Displays Dashboard**

**React Component:**
```jsx
// Dashboard.tsx
const Dashboard = () => {
  const applications = useSelector(state => state.applications.items);
  
  // Group by status
  const applied = applications.filter(a => a.status === 'applied');
  const interviews = applications.filter(a => a.status === 'interview');
  const offers = applications.filter(a => a.status === 'offer');
  const rejected = applications.filter(a => a.status === 'rejected');
  
  return (
    <div className="dashboard">
      {/* Stats */}
      <div className="stats">
        <StatCard label="Applied" count={applied.length} color="blue" />
        <StatCard label="Interviews" count={interviews.length} color="yellow" />
        <StatCard label="Offers" count={offers.length} color="green" />
        <StatCard label="Rejected" count={rejected.length} color="red" />
      </div>
      
      {/* Pipeline */}
      <div className="pipeline">
        <Column title="Applied" applications={applied} />
        <Column title="Interview" applications={interviews} />
        <Column title="Offer" applications={offers} />
      </div>
      
      {/* Upcoming Interviews */}
      <InterviewList applications={interviews} />
    </div>
  );
};

// Application Card Component
const ApplicationCard = ({ application }) => {
  const daysUntilInterview = application.interview 
    ? Math.ceil((new Date(application.interview.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  
  return (
    <div className="card">
      <h3>{application.company}</h3>
      <p>{application.role}</p>
      <div className="meta">
        <span>📧 {application.emailCount} emails</span>
        {daysUntilInterview && (
          <span className="countdown">
            ⏰ {daysUntilInterview} days until interview
          </span>
        )}
      </div>
    </div>
  );
};
```

---

### **STEP 11: User Sees Dashboard**

**What user sees:**
```
┌─────────────────────────────────────────────┐
│  TEJAS                        [Search] [⚙️]  │
├─────────────────────────────────────────────┤
│                                              │
│  📊 Overview                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ 23  │ │  5  │ │  1  │ │  8  │           │
│  │Applied Interview Offer Rejected          │
│  └─────┘ └─────┘ └─────┘ └─────┘           │
│                                              │
│  🎤 Upcoming Interviews                      │
│  ┌──────────────────────────────────┐       │
│  │ Google - Software Engineer        │       │
│  │ 📅 Dec 10, 2:00 PM  ⏰ 4 days     │       │
│  └──────────────────────────────────┘       │
│                                              │
│  📋 Application Pipeline                     │
│  ┌─────────┬─────────┬─────────┬─────┐     │
│  │ Applied │Interview│Assignment│Offer│     │
│  ├─────────┼─────────┼─────────┼─────┤     │
│  │[Card]   │[Card]   │[Card]   │[Card]│     │
│  │Meta     │Google   │Stripe   │Amazon│    │
│  │Frontend │SWE      │Coding   │PM    │     │
│  │         │         │Due:3days│      │     │
│  └─────────┴─────────┴─────────┴─────┘     │
└─────────────────────────────────────────────┘
```

---

## 🔄 ONGOING: Background Sync (Every 15 Minutes)

**Backend cron job:**
```javascript
const cron = require('node-cron');

// Run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('Running email sync for all users...');
  
  const users = await User.find({});
  
  for (const user of users) {
    try {
      await syncUserEmails(user._id);
    } catch (error) {
      console.error(`Sync failed for ${user.email}:`, error);
    }
  }
});

async function syncUserEmails(userId) {
  const user = await User.findById(userId);
  
  // Fetch new emails since lastSyncedAt
  const query = `after:${Math.floor(user.lastSyncedAt.getTime() / 1000)}`;
  
  // ... (same Gmail fetching logic as before)
  
  // Update lastSyncedAt
  user.lastSyncedAt = new Date();
  await user.save();
}
```

**Frontend polling (optional):**
```javascript
// Check for new applications every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    dispatch(fetchApplications());
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 📊 SUMMARY: Frontend vs Backend

### **Frontend Responsibilities:**
1. ✅ User authentication UI (login button)
2. ✅ Handle OAuth callback (receive JWT token)
3. ✅ Trigger email sync
4. ✅ Display applications in dashboard
5. ✅ Show loading states
6. ✅ Allow manual editing of applications
7. ✅ Search/filter applications
8. ✅ Show interview countdowns
9. ✅ Export to CSV

**Frontend DOES NOT:**
- ❌ Parse emails (backend does this)
- ❌ Store Gmail tokens (backend does this)
- ❌ Fetch from Gmail API (backend does this)

---

### **Backend Responsibilities:**
1. ✅ Gmail OAuth flow (generate auth URL, exchange tokens)
2. ✅ Store user + Gmail tokens in database
3. ✅ Fetch emails from Gmail API
4. ✅ Parse emails (extract company, role, status, dates)
5. ✅ Detect job-related emails
6. ✅ Create/update applications in database
7. ✅ Background sync (cron job every 15 min)
8. ✅ API endpoints for frontend (GET /applications, etc.)
9. ✅ Token refresh when expired

**Backend DOES NOT:**
- ❌ Render UI (frontend does this)
- ❌ Handle user clicks (frontend does this)

---

## 🎯 Key Takeaway

**The flow is:**
```
User clicks "Sign in with Gmail"
  ↓
Backend redirects to Google OAuth
  ↓
User allows access
  ↓
Backend receives tokens, saves to DB
  ↓
Backend fetches emails from Gmail
  ↓
Backend parses emails → creates applications
  ↓
Frontend fetches applications from backend
  ↓
Frontend displays dashboard
  ↓
Background sync runs every 15 min to get new emails
```

**Frontend = Display & Interaction**  
**Backend = Data fetching, parsing, storage**

---

