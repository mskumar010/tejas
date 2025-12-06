export interface ParsedEmail {
  company?: string;
  role?: string;
  status: "Applied" | "Interview" | "Reject" | "Offer" | "Unknown";
}

export const parseEmail = (
  subject: string,
  sender: string,
  snippet: string
): ParsedEmail => {
  const lowerSubject = subject.toLowerCase();
  const lowerSnippet = snippet.toLowerCase();
  const lowerSender = sender.toLowerCase();

  let status: ParsedEmail["status"] = "Unknown";
  let company: string | undefined;
  let role: string | undefined;

  // --- Status Detection ---

  if (
    lowerSubject.includes("thank you for applying") ||
    lowerSubject.includes("application received") ||
    lowerSubject.includes("application confirmation")
  ) {
    status = "Applied";
  } else if (
    lowerSubject.includes("interview") ||
    lowerSubject.includes("schedule a call") ||
    lowerSubject.includes("availability")
  ) {
    status = "Interview";
  } else if (
    lowerSubject.includes("unfortunately") ||
    lowerSubject.includes("not moving forward") ||
    lowerSubject.includes("thank you for your interest") ||
    lowerSnippet.includes("not be moving forward")
  ) {
    status = "Reject";
  } else if (
    lowerSubject.includes("offer") ||
    lowerSubject.includes("congratulations")
  ) {
    status = "Offer";
  }

  // --- Company Extraction (Heuristic) ---

  // Strategy 1: Extract from "at [Company]" in subject
  const atMatch = subject.match(/\sat\s([^.\-,]+)/i);
  if (atMatch && atMatch[1]) {
    company = atMatch[1].trim();
  }

  // Strategy 2: If sender name is clean (e.g. "Google Careers"), use that
  // This is hard to do perfectly without a known list, but we can try to parse the "From" header
  // format: "Name <email@domain.com>"
  if (!company && sender) {
    const nameMatch = sender.match(/^"?([^"<]+)"?\s?</);
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim();
      if (
        !name.toLowerCase().includes("no-reply") &&
        !name.toLowerCase().includes("team")
      ) {
        company = name;
      }
    }
  }

  return { company, role, status };
};
