import { Request, Response } from "express";
import Application from "../models/Application";
import { parseEmail } from "../utils/emailParser";
import { updatePatternStats } from "../utils/PatternManager";
import ParsedEmail from "../models/ParsedEmail";
import fs from "fs";
import path from "path";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

interface EmailSummary {
  messageId: string;
  subject: string;
  sender: string;
  date: Date;
  snippet: string;
  body: string;
}

export const getApplications = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const applications = await Application.find({ userId }).sort({
      appliedDate: -1,
      createdAt: -1,
    });
    res.json(applications);
  } catch (error) {
    console.error("Get Applications Error:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as AuthenticatedRequest).user.id;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const application = await Application.findOne({ _id: id, userId });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    application.lastUpdatedAt = new Date();
    await application.save();

    res.json(application);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

export const createManual = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    let { company, role, status, appliedDate, notes, emailContent } = req.body;

    // Strict Validation for Manual Entries
    if (emailContent) {
      if (!emailContent.body || emailContent.body.length < 50) {
        return res.status(400).json({
          message:
            "Content too short. Please paste the full email (headers included).",
        });
      }

      const lowerBody = emailContent.body.toLowerCase();
      // Requirement: Must look like an email (Headers OR Greetings OR Closings)
      const emailSignals = [
        // Headers
        "subject:",
        "from:",
        "sent:",
        "date:",
        // Greetings
        "dear ",
        "hello ",
        "hi ",
        "hi,",
        "hiring manager",
        // Closings
        "best regards",
        "sincerely",
        "kind regards",
        "regards",
        "thanks",
        "thank you",
        "cheers",
        "best,",
      ];

      const hasSignal = emailSignals.some((signal) =>
        lowerBody.includes(signal)
      );

      if (!hasSignal) {
        return res.status(400).json({
          message:
            "Invalid format. Text should look like an email (include a greeting like 'Hi'/'Dear' or closing like 'Best regards').",
        });
      }
    }

    // Create a fake email entry if emailContent is provided
    let relatedEmails: EmailSummary[] = [];
    if (emailContent) {
      const messageId = `manual_${Date.now()}`;
      relatedEmails.push({
        messageId,
        subject: emailContent.subject || "Manual Entry",
        sender: emailContent.sender || "Manual",
        date: new Date(),
        snippet: emailContent.snippet || "",
        body: emailContent.body || "",
      });

      // Save to dummyEmails.json
      try {
        const dummyPath = path.join(__dirname, "../data/dummyEmails.json");
        const dummyData = JSON.parse(fs.readFileSync(dummyPath, "utf-8"));

        const newDummyEmail = {
          id: messageId,
          threadId: messageId,
          labelIds: ["INBOX"],
          snippet: emailContent.snippet || "",
          body: emailContent.body || "",
          payload: {
            headers: [
              {
                name: "Subject",
                value: emailContent.subject || "Manual Entry",
              },
              { name: "From", value: emailContent.sender || "Manual Input" },
              { name: "Date", value: new Date().toISOString() },
            ],
          },
        };

        dummyData.unshift(newDummyEmail); // Add to beginning
        fs.writeFileSync(dummyPath, JSON.stringify(dummyData, null, 2));
        console.log("Saved manual email to dummyEmails.json");
      } catch (err) {
        console.error("Failed to save to dummyEmails.json", err);
        // Continue without failing the request
      }

      // Auto-parse if relevant fields are missing or status is "Auto-detect"
      if (!company || !status || status === "Auto-detect") {
        const parsed = await parseEmail(
          emailContent.subject || "",
          emailContent.sender || "",
          emailContent.body || ""
        );

        if (!company && parsed.company) company = parsed.company;
        if (!role && parsed.role) role = parsed.role;
        // If status is missing OR 'Auto-detect', try to use parsed status
        if (
          (!status || status === "Auto-detect") &&
          parsed.status &&
          parsed.status !== "Unknown"
        ) {
          status = parsed.status;
        }

        // Ensure jobId is saved (we need to update the Application model to support this field if we want to save it)
        // For now, we can append it to notes if found
        if (parsed.jobId) {
          notes = notes
            ? `${notes}\nJob ID: ${parsed.jobId}`
            : `Job ID: ${parsed.jobId}`;
        }
      }
    }

    const newApp = await Application.create({
      userId,
      company: company || "Unknown Company",
      role: role || "Unknown Role",
      status: status || "Applied",
      appliedDate: appliedDate || new Date(),
      source: "Manual",
      notes,
      relatedEmails,
    });

    res.status(201).json(newApp);
  } catch (error) {
    console.error("Create Manual Application Error:", error);
    res.status(500).json({ message: "Failed to create application" });
  }
};

/**
 * Endpoint to Confirm or Correct Parsing Results
 */
export const confirmParsing = async (req: Request, res: Response) => {
  try {
    const { emailId, corrections, isCorrect } = req.body;

    // Check if emailId is for ParsedEmail or Application
    // Assuming ParsedEmail ID for this implementation
    const record = await ParsedEmail.findById(emailId);
    if (!record) {
      return res.status(404).json({ message: "Parsing record not found" });
    }

    record.userCorrection = {
      isCorrect,
      correctedCompany: corrections?.company,
      correctedRole: corrections?.role,
      correctedStatus: corrections?.status,
    };
    await record.save();

    // Trigger Learning
    const usedPatterns = record.parsedResult.patternsUsed || [];

    if (isCorrect) {
      for (const patternId of usedPatterns) {
        if (patternId.startsWith("company_pattern_")) {
          const regex = patternId.replace("company_pattern_", "");
          await updatePatternStats("company", regex, true);
        } else if (patternId.startsWith("role_subject_")) {
          const regex = patternId.replace("role_subject_", "");
          await updatePatternStats("role", regex, true);
        } else if (patternId.startsWith("role_body_")) {
          const regex = patternId.replace("role_body_", "");
          await updatePatternStats("role", regex, true);
        }
      }
    } else {
      // Penalize
      for (const patternId of usedPatterns) {
        if (patternId.startsWith("company_pattern_")) {
          await updatePatternStats(
            "company",
            patternId.replace("company_pattern_", ""),
            false
          );
        }
        // Add other penalties as needed
      }
    }

    res.json({ message: "Feedback process completed", success: true });
  } catch (error) {
    console.error("Feedback Error:", error);
    res.status(500).json({ message: "Failed to process feedback" });
  }
};
