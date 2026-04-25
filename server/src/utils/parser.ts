import { loadPatterns, PatternLibrary } from "./patternManager";

export interface ParsedEmail {
  company?: string;
  role?: string;
  status: string;
  confidence: number;
  dates: any[];
  source: string;
  patternsUsed: string[]; // For learning loop
  tags: string[];
}

const ATS_DOMAINS = [
  "greenhouse.io", "lever.co", "workday.com", "taleo.net",
  "icims.com", "smartrecruiters.com", "myworkdayjobs.com",
  "successfactors.com", "brassring.com", "jobvite.com",
  "kenexa.com", "silkroad.com", "recruitee.com"
];

/**
 * Main Parsing Function (MVP Version 1 - 5 Layers)
 */
export const parseEmail = async (
  subject: string,
  sender: string,
  body: string
): Promise<ParsedEmail> => {
  const patterns = await loadPatterns();
  const fullText = `${subject} ${body}`.toLowerCase();
  
  // Track which patterns matched for debugging/learning
  const usedPatterns: string[] = [];
  const tags: string[] = [];

  // LAYER 1: EXTRACT COMPANY (Domain or Body)
  const companyResult = extractCompany(sender, body, patterns, usedPatterns);

  // LAYER 2: EXTRACT ROLE (Subject Regex)
  const roleResult = extractRole(subject, body, patterns, usedPatterns);

  // LAYER 3: DETECT STATUS (Weighted Keywords)
  const statusResult = detectStatus(fullText, patterns, usedPatterns);

  // EXTRACT DATES & SOURCE (Regex based, no NLP)
  const dates = extractDates(body, usedPatterns);
  const source = detectSource(sender, body);

  // CALCULATE CONFIDENCE
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

  // LAYER 4: TAG ASSIGNMENT
  if (statusResult.status === "assessment" || statusResult.status === "interview") {
    tags.push("action_required");
  }
  if (dates.length > 0) {
    tags.push("has_deadline");
  }
  if (overallConfidence < 60) {
    tags.push("low_confidence");
    tags.push("needs_review");
  }

  return {
    company: companyResult.name,
    role: roleResult.title,
    status: statusResult.status,
    dates,
    source,
    confidence: overallConfidence,
    patternsUsed: usedPatterns,
    tags
  };
};

/**
 * Company Extraction Logic
 */
const extractCompany = (
  from: string,
  body: string,
  library: PatternLibrary,
  usedPatterns: string[]
) => {
  // Strategy 1: Email Domain
  const emailDomainMatch = from.match(/@([a-zA-Z0-9\-]+\.[a-zA-Z]+)/);
  if (emailDomainMatch) {
    const domain = emailDomainMatch[1].toLowerCase();

    // Check if it's a known ATS domain
    const isAts = ATS_DOMAINS.some(ats => domain.includes(ats));

    if (!isAts) {
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
  }

  // Strategy 2: Body Regex Patterns (Used primarily when domain is ATS)
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
        return { title: match[1].trim(), confidence: p.confidence - 10 }; // Slightly lower confidence
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
  let bestStatus = "applied"; // default
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

  // Normalize confidence (Max score ~15 -> 100%)
  const confidence = Math.min((maxScore / 15) * 100, 100);

  return { status: bestStatus, confidence };
};

/**
 * Helper: Extract Dates (Regex Backup since NLP is removed)
 */
const extractDates = (body: string, usedPatterns: string[]) => {
  const dates: string[] = [];
  const dateRegex =
    /\d{1,2}(?:st|nd|rd|th)?[\s\/\-\.]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\/\-\.,]*\d{2,4}/gi;
  const matches = body.match(dateRegex);
  if (matches) {
    dates.push(...matches);
    usedPatterns.push("date_regex");
  }
  return [...new Set(dates)];
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
