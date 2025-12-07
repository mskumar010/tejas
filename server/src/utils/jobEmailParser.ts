import { loadPatterns, PatternLibrary } from "./PatternManager";
import nlp from "compromise";
import datePlugin from "compromise-dates";
nlp.plugin(datePlugin);

export interface ParsedEmail {
  company?: string;
  role?: string;
  status: string;
  jobId?: string;
  confidence: number;
  dates: any[];
  cooldown?: { duration: number; unit: string };
  source: string;
  patternsUsed: string[]; // For learning loop
}

/**
 * Main Parsing Function
 */
export const parseEmail = async (
  subject: string,
  sender: string,
  body: string
): Promise<ParsedEmail> => {
  const patterns = await loadPatterns();
  const fullText = `${subject} ${body}`.toLowerCase();

  // OPTIMIZATION: Parse NLP once here to save CPU
  let nlpDoc: any = null;
  try {
    nlpDoc = nlp(body);
  } catch (e) {
    console.warn("NLP Init failed", e);
  }

  // Track which patterns matched for debugging/learning
  const usedpatterns: string[] = [];

  // 1. EXTRACT COMPANY
  const companyResult = extractCompany(
    sender,
    body,
    patterns,
    usedpatterns,
    nlpDoc
  );

  // 2. EXTRACT ROLE
  const roleResult = extractRole(subject, body, patterns, usedpatterns);

  // 3. DETECT STATUS
  const statusResult = detectStatus(fullText, patterns, usedpatterns);

  // 4. EXTRACT OTHER DETAILS (Dates, JobID, Cooldown) - Helper functions
  const dates = extractDates(body, usedpatterns, nlpDoc);
  const jobId = extractJobId(subject, body, usedpatterns);
  const cooldown = extractCooldown(body);
  const source = detectSource(sender, body);

  // 5. CALCULATE CONFIDENCE
  // Simple weighted average
  let confidenceScore = 0;
  let factors = 0;

  if (companyResult.confidence > 0) {
    confidenceScore += companyResult.confidence;
    factors++;
  }
  if (roleResult.confidence > 0) {
    confidenceScore += roleResult.confidence;
    factors++;
  }
  if (statusResult.confidence > 0) {
    confidenceScore += statusResult.confidence;
    factors++;
  }

  const overallConfidence =
    factors > 0 ? Math.round(confidenceScore / factors) : 0;

  return {
    company: companyResult.name,
    role: roleResult.title,
    status: statusResult.status,
    jobId,
    dates,
    cooldown: cooldown || undefined,
    source,
    confidence: overallConfidence,
    patternsUsed: usedpatterns,
  };
};

/**
 * Company Extraction Logic
 */
const extractCompany = (
  from: string,
  body: string,
  library: PatternLibrary,
  usedPatterns: string[],
  nlpDoc: any // Passed from main function
) => {
  // Strategy 1: Email Domain
  const emailDomainMatch = from.match(/@([a-zA-Z0-9\-]+\.[a-zA-Z]+)/);
  if (emailDomainMatch) {
    const domain = emailDomainMatch[1].toLowerCase();

    // Check known domains
    if (library.company.domainToCompany[domain]) {
      usedPatterns.push(`company_domain_${domain}`);
      return { name: library.company.domainToCompany[domain], confidence: 95 };
    }

    // Generic domain check
    const genericDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
    ];
    if (!genericDomains.includes(domain)) {
      const companyFromDomain = domain.split(".")[0];
      const capitalized =
        companyFromDomain.charAt(0).toUpperCase() + companyFromDomain.slice(1);
      usedPatterns.push("company_domain_generic");
      return { name: capitalized, confidence: 80 };
    }
  }

  // Strategy 2: Body Regex Patterns
  for (const p of library.company.patterns) {
    try {
      const regex = new RegExp(p.regex, "i");
      const match = body.match(regex);
      if (match && match[1]) {
        usedPatterns.push(`company_pattern_${p.regex}`);
        return { name: match[1].trim(), confidence: p.confidence };
      }
    } catch (e) {
      console.warn("Invalid regex in pattern library:", p.regex);
    }
  }

  // Strategy 3: NLP Fallback (compromise)
  if (nlpDoc) {
    try {
      const organizations = nlpDoc.organizations().out("array");
      if (organizations.length > 0) {
        // Filter out common false positives if necessary, for now take the first one
        // Avoid short strings or common words
        const validOrg = organizations.find(
          (o: string) => o.length > 3 && !["Team", "Recruiting"].includes(o)
        );
        if (validOrg) {
          usedPatterns.push("company_nlp_compromise");
          return { name: validOrg, confidence: 60 };
        }
      }
    } catch (e) {
      console.error("NLP extraction failed:", e);
    }
  }

  return { name: undefined, confidence: 0 };
};

/**
 * Role Extraction Logic
 */
const extractRole = (
  subject: string,
  body: string,
  library: PatternLibrary,
  usedPatterns: string[]
) => {
  // Strategy 1: Subject Regex
  for (const p of library.role.patterns) {
    try {
      const regex = new RegExp(p.regex, "i");
      const match = subject.match(regex);
      if (match && match[1]) {
        usedPatterns.push(`role_subject_${p.regex}`);
        return { title: match[1].trim(), confidence: p.confidence };
      }
    } catch (e) {}
  }

  // Strategy 2: Body Regex
  for (const p of library.role.patterns) {
    try {
      const regex = new RegExp(p.regex, "i");
      const match = body.match(regex);
      if (match && match[1]) {
        usedPatterns.push(`role_body_${p.regex}`);
        return { title: match[1].trim(), confidence: p.confidence - 10 }; // Slightly lower confidence if found in body
      }
    } catch (e) {}
  }

  return { title: undefined, confidence: 0 };
};

/**
 * Status Detection Logic (Weighted)
 */
const detectStatus = (
  text: string,
  library: PatternLibrary,
  usedPatterns: string[]
) => {
  let bestStatus = "Applied";
  let maxScore = 0;

  for (const [status, config] of Object.entries(library.status)) {
    let score = 0;
    for (const keyword of config.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += config.weight;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestStatus = status;
    }
  }

  if (maxScore > 0) {
    usedPatterns.push(`status_keywords_${bestStatus}`);
  }

  // Normalize confidence (Max score ~50 -> 100%)
  const confidence = Math.min((maxScore / 15) * 100, 100);

  return { status: bestStatus, confidence };
};

/**
 * Helper: Extract Dates
 */
const extractDates = (body: string, usedPatterns: string[], nlpDoc: any) => {
  const dates = [];

  // Strategy 1: NLP (compromise) - Smarter detection
  if (nlpDoc) {
    try {
      const nlpDates = nlpDoc.dates().json();
      if (nlpDates && nlpDates.length > 0) {
        // Format: { start: '2025-12-10T00:00:00.000Z', end: null }
        // We'll map to readable strings or ISO strings
        dates.push(...nlpDates.map((d: any) => d.start || d.text));
        usedPatterns.push("date_nlp_compromise");
      }
    } catch (e) {
      console.error("NLP date extraction failed:", e);
    }
  }

  // Strategy 2: Regex Backup (if NLP missed everything)
  if (dates.length === 0) {
    const dateRegex =
      /\d{1,2}(?:st|nd|rd|th)?[\s\/\-\.]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\/\-\.,]*\d{2,4}/gi;
    const matches = body.match(dateRegex);
    if (matches) {
      dates.push(...matches);
    }
  }

  // Deduplicate
  return [...new Set(dates)];
};

/**
 * Helper: Extract Job ID
 */
const extractJobId = (
  subject: string,
  body: string,
  usedPatterns: string[]
) => {
  const patterns = [
    /(?:Ref|Reference|Job ID|Position ID|Req):\s*(\d+)/i,
    /(?:Ref|Reference)\s*[-:]\s*(\d+)/i,
  ];

  for (const p of patterns) {
    const match = (subject + body).match(p);
    if (match) {
      usedPatterns.push("job_id_match");
      return match[1];
    }
  }
  return undefined;
};

/**
 * Helper: Extract Cooldown
 */
const extractCooldown = (body: string) => {
  const match = body.match(
    /(?:cooling-off period|cooldown).*?(\d+)\s*(months?|days?)/i
  );
  if (match) {
    return { duration: parseInt(match[1]), unit: match[2].toLowerCase() };
  }
  return null;
};

/**
 * Helper: Detect Source
 */
const detectSource = (from: string, body: string) => {
  const text = (from + " " + body).toLowerCase();
  if (text.includes("linkedin")) return "linkedin";
  if (text.includes("indeed")) return "indeed";
  if (text.includes("naukri")) return "naukri";
  if (text.includes("referral")) return "referral";
  return "direct";
};
