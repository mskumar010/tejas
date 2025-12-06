import { Request, Response } from "express";
import Application from "../models/Application";
import ParsedEmail from "../models/ParsedEmail";
import {
  updatePatternStats,
  adjustKeywordWeight,
} from "../utils/PatternManager";

// ... existing imports if any

/**
 * Endpoint to Confirm or Correct Parsing Results
 * Body: { emailId, corrections: { company, role, status }, isCorrect: boolean }
 */
export const confirmParsing = async (req: Request, res: Response) => {
  try {
    const { emailId, corrections, isCorrect } = req.body;

    // Find the original parsed email record
    // Note: If you don't have an emailId from Gmail yet, you might need to look up by internal ID
    // For now assuming we passed the mongo ID of the ParsedEmail record
    const record = await ParsedEmail.findById(emailId);
    if (!record) {
      return res.status(404).json({ message: "Parsing record not found" });
    }

    // Update the record with feedback
    record.userCorrection = {
      isCorrect,
      correctedCompany: corrections?.company,
      correctedRole: corrections?.role,
      correctedStatus: corrections?.status,
    };
    await record.save();

    // ---------------------------------------------------------
    // LEARN FROM FEEDBACK
    // ---------------------------------------------------------
    const usedPatterns = record.parsedResult.patternsUsed || [];

    if (isCorrect) {
      // 1. Reinforce successful patterns
      for (const patternId of usedPatterns) {
        // Pattern ID format: "type_subtype_regex"
        // We need to parse this or pass raw regex.
        // In jobEmailParser we constructed strings like `company_pattern_${p.regex}`

        if (patternId.startsWith("company_pattern_")) {
          const regex = patternId.replace("company_pattern_", "");
          await updatePatternStats("company", regex, true);
        } else if (patternId.startsWith("role_subject_")) {
          const regex = patternId.replace("role_subject_", "");
          await updatePatternStats("role", regex, true);
        }
        // ... handle other types
      }

      // Reinforce status keywords
      const status = record.parsedResult.status;
      // We don't track exact keyword hit in 'patternsUsed' yet for status (just status_keywords_STATUS)
      // So we can arguably boost the whole status category or do nothing for simple MVP.
    } else {
      // 2. Penalize failed patterns
      for (const patternId of usedPatterns) {
        if (patternId.startsWith("company_pattern_")) {
          const regex = patternId.replace("company_pattern_", "");
          await updatePatternStats("company", regex, false);
        }
        // ... handle others
      }

      // 3. (Advanced) Extract NEW patterns from corrections (Future Scope)
      // If user provided "IBM" and we missed it, we could scan the body for "IBM"
      // and try to generate a new regex.
    }

    res.json({
      message: "Feedback received and patterns updated",
      success: true,
    });
  } catch (error) {
    console.error("Feedback error", error);
    res.status(500).json({ message: "Failed to process feedback" });
  }
};
