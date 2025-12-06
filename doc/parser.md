# Prompt for AI to Build Self-Learning Regex Parser

```
You are building an intelligent, self-learning email parser for a job application tracker called TEJAS. The parser must extract structured data from job-related emails with high accuracy and improve over time based on user feedback.

## REQUIREMENTS:

### 1. CORE PARSING FUNCTION
Create a mechanism that extracts:
- Company name (from email domain, signature, body)
- Job title/role
- Application status (applied, screening, interview, assessment, rejected, offer, no_longer_considering)//use ours also
- Interview date/time
- Assessment deadline
- Job ID/Reference number
- Cooldown period (6 months, 12 months)
- Source (LinkedIn, Indeed, Naukri, Direct, Referral)
- Confidence score (0-100%)

### 2. MULTI-LAYER PARSING STRATEGY
Use this hierarchy (best to worst):
1. Email headers (From domain → Company)
2. Subject line patterns
3. Body keyword matching with weights
4. Contextual sentence analysis
5. Fallback to "Unknown" with low confidence

### 3. STATUS DETECTION WITH WEIGHTED SCORING
Each status has keywords with weights:

**Rejected** (Weight: 10):
- "regret to inform", "not moving forward", "other candidates", "decided to pursue", "will not be considering", "identified candidates who more closely"

**Assessment** (Weight: 10):
- "complete the assessment", "coding assessment", "invited to complete", "timed assessment", "hackerrank", "test link"

**Interview** (Weight: 8):
- "interview", "schedule", "screening process", "phone screen", "video call"

**Offer** (Weight: 10):
- "pleased to offer", "offer letter", "congratulations", "accept the offer"

**Applied** (Weight: 5):
- "received your application", "thank you for applying", "reviewing your experience"

Use keyword frequency × weight to determine status. If multiple statuses score high, pick highest score.

### 4. PATTERN LIBRARY STRUCTURE
Store regex patterns in a JSON structure:

```json
{
  "company": {
    "patterns": [
      {"regex": "...", "confidence": 90, "successCount": 45, "failCount": 2},
      {"regex": "...", "confidence": 85, "successCount": 32, "failCount": 5}
    ]
  },
  "role": {
    "patterns": [...]
  },
  "status": {
    "rejected": {
      "keywords": ["regret to inform", ...],
      "weight": 10,
      "successCount": 120,
      "failCount": 3
    }
  },
  "dates": {
    "patterns": [...]
  }
}
```

### 5. SELF-LEARNING MECHANISM

**When user confirms correct parsing:**
```javascript
learnFromCorrection(emailId, field, userConfirmedValue, parserPredictedValue) {
  // 1. Increase confidence of patterns that worked
  // 2. Store new pattern if current ones failed
  // 3. Update keyword weights based on success
  // 4. Save to patterns.json
}
```

**When user corrects wrong parsing:**
```javascript
learnFromCorrection(emailId, field, correctValue, wrongValue) {
  // 1. Decrease confidence of failed patterns
  // 2. Extract new patterns from the email
  // 3. Add to pattern library
  // 4. If keyword missed, add it with initial weight
  // 5. Save to patterns.json
}
```

### 6. PATTERN EXTRACTION FROM USER CORRECTIONS

When user corrects "Company: IBM" but parser said "Unknown":
1. Analyze email text around "IBM"
2. Extract regex pattern (e.g., "Greetings from ([A-Z]+)")
3. Test pattern against historical emails
4. If success rate > 70%, add to pattern library
5. Assign confidence based on test results

### 7. KEYWORD WEIGHT ADJUSTMENT

Track success/failure per keyword:
```javascript
{
  "keyword": "regret to inform",
  "status": "rejected",
  "weight": 10,
  "successCount": 145,  // Times it correctly identified rejection
  "failCount": 2,       // Times it failed
  "lastUpdated": "2024-12-06"
}
```

Adjust weight formula:
```
newWeight = baseWeight × (successCount / (successCount + failCount × 2))
```

### 8. CONFIDENCE CALCULATION

Overall confidence formula:
```
confidence = (
  companyConfidence × 0.3 +
  roleConfidence × 0.25 +
  statusConfidence × 0.35 +
  dateConfidence × 0.1
) × (patternSuccessRate)
```

### 9. IMPLEMENTATION REQUIREMENTS

**Database Schema for Learning:**
```javascript
ParsedEmail {
  emailId: String,
  parsedData: Object,
  userCorrectedData: Object,
  wasCorrect: Boolean,
  patternsUsed: [String],  // Which patterns were applied
  timestamp: Date
}

PatternLibrary {
  field: String,  // "company", "role", "status"
  pattern: String,
  confidence: Number,
  successCount: Number,
  failCount: Number,
  lastUsed: Date
}
```

**API Endpoints:**
```javascript
POST /api/parser/confirm
{
  emailId: "123",
  corrections: {
    company: "IBM",  // User confirmed or corrected
    status: "rejected"
  }
}
// Updates pattern library based on feedback
```

### 10. PATTERN EVOLUTION RULES

- If pattern fails 5 times consecutively → Decrease confidence by 20%
- If pattern succeeds 10 times → Increase confidence by 10%
- If confidence < 40% → Mark for review/removal
- If new pattern success rate > existing pattern → Promote to primary
- Auto-prune patterns with <30% confidence after 100 uses

### 11. SAMPLE EMAIL PATTERNS TO HANDLE

You must handle these real-world patterns:

**Rejection:**
- "regret to inform you that after careful consideration"
- "identified candidates who more closely match"
- "will not be considering you for our open position"

**Assessment:**
- "invited to complete IBM's recorded Spoken Language Assessment"
- "Coding Assessment - helps us to understand your level"
- "Submit by Dec 10th, 2025 (11:59 PM)"

**Applied:**
- "We received your application for Software Engineer"
- "thank you for applying for the position of"
- "successfully registered for the campaign"

**Interview:**
- "move forward with the hiring process"
- "participate in our screening process"

### 12. EDGE CASES TO HANDLE

- Multiple dates in email (pick most relevant based on context)
- Multiple job titles mentioned (extract primary one)
- Company name variations (IBM vs IBM India vs IBM Corporation)
- Status ambiguity (email says "reviewing" but also "if shortlisted" → status = applied, not screening)
- Indian company names (Wipro, TCS, Infosys, etc.)

### 13. OUTPUT FORMAT

```javascript
{
  company: { name: "IBM", confidence: 95, source: "domain" },
  role: { title: "Application Developer", confidence: 85, source: "subject" },
  status: { 
    status: "rejected", 
    confidence: 98, 
    matchedKeywords: ["regret to inform", "other candidates"],
    scores: { rejected: 20, applied: 5 }
  },
  dates: [
    { date: "2025-12-10", context: "assessment deadline", confidence: 90 }
  ],
  assessment: {
    type: "coding",
    deadline: "2025-12-10",
    platform: "HackerRank"
  },
  jobId: "71863",
  cooldown: { duration: 12, unit: "months" },
  source: "direct",
  overallConfidence: 92,
  patternsUsed: ["company_domain", "role_subject", "status_keywords"]
}
```

### 14. LEARNING LOOP WORKFLOW

```
1. Parse email → Generate predictions
2. User reviews → Confirms or corrects
3. System receives feedback → Updates patterns
4. Next email → Uses improved patterns
5. Repeat → Parser gets smarter over time
```

### 15. SPECIAL INSTRUCTIONS

- Use only vanilla JavaScript (no external NLP libraries)
- All patterns must be stored in a JSON file (patterns.json)
- Patterns must be loadable/saveable for persistence
- Include detailed comments explaining each regex
- Provide test suite with 10+ sample emails
- Include function to export/import pattern library
- Add logging for debugging pattern matching

### 16. DELIVERABLES

Provide:
1. JobEmailParser class (complete implementation)
2. PatternLibrary manager (load/save/update patterns)
3. Learning system (feedback processing)
4. patterns.json (initial pattern library)
5. Test suite with sample emails
6. API integration example

Build this system to be production-ready, self-improving, and maintainable.
```

---

