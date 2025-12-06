import { parseEmail as parseEmailV2 } from "./jobEmailParser";

export interface ParsedEmail {
  company?: string;
  role?: string;
  status: string;
  jobId?: string;
  confidence: number;
  originalData?: any;
}

// Wrapper to export a simplified parsing function compatible with existing controllers
export const parseEmail = async (
  subject: string,
  sender: string,
  body: string
): Promise<ParsedEmail> => {
  // Call the new self-learning parser
  const result = await parseEmailV2(subject, sender, body);

  return {
    company: result.company,
    role: result.role,
    status: result.status,
    jobId: result.jobId,
    confidence: result.confidence,
    originalData: result, // Full result for debugging if needed
  };
};

// Deprecated default export if any legacy code uses `import parser from ...`
// We can export a dummy object if absolutely necessary, but preferred to fix imports.
// For now, exporting the same function as default to be safe.
export default parseEmail;
