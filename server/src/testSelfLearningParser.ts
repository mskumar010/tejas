import mongoose from "mongoose";
import { parseEmail } from "./utils/jobEmailParser";
import {
  updatePatternStats,
  loadPatterns,
  savePatterns,
} from "./utils/PatternManager";
import ParsedEmail from "./models/ParsedEmail";

// Mock Mongoose (Optional, or just run standalone if we don't save to DB)
// For this test, we might skip actual DB connection and just test the logic

const SAMPLE_EMAILS = [
  {
    desc: "IBM Rejection",
    sender: "no-reply@ibm.com",
    subject: "Update on your application for Application Developer",
    body: "Dear User, \n\nWe regret to inform you that after careful consideration we will not be moving forward with your candidacy. \n\nRegards,\nIBM Talent Acquisition",
  },
  {
    desc: "HackerRank Assessment",
    sender: "support@hackerrank.com",
    subject: "Invitation to Coding Assessment",
    body: "Hi, You have been invited to complete the IBM Coding Assessment. Please submit by Dec 12th, 2025. This allows us to understand your level.",
  },
  {
    desc: "Amazon Offer",
    sender: "recruiting@amazon.com",
    subject: "Offer Letter - Software Engineer",
    body: "We are pleased to offer you the position. Congratulations! Please accept the offer by clicking the link.",
  },
];

const runTests = async () => {
  console.log("Starting Self-Learning Parser Tests...\n");

  await loadPatterns();

  // 1. Test Parsing
  console.log("--- 1. Testing Core Parsing ---");
  for (const email of SAMPLE_EMAILS) {
    const result = await parseEmail(email.subject, email.sender, email.body);
    console.log(
      `[${email.desc}] Status: ${result.status} | Confidence: ${result.confidence}%`
    );
    console.log(`   Company: ${result.company} | Role: ${result.role}`);
    console.log(`   Patterns Used: ${result.patternsUsed.join(", ")}\n`);
  }

  // 2. Test Feedback Loop
  console.log("--- 2. Testing Feedback Loop (Simulated) ---");

  // Pick a pattern to train
  const testRegex =
    "(?:greetings from|sincerely,|regards,|thank you,|team at|here at|joining)\\s+([A-Z][a-zA-Z\\s]+?)(?:\\s+Talent|\\s+Recruiting|!|\\n|,|\\s+we)";

  // Get initial state
  const initialPatterns = await loadPatterns();
  const initialConf = initialPatterns.company.patterns.find(
    (p) => p.regex === testRegex
  )?.confidence;
  console.log(`Initial Confidence for pattern: ${initialConf}`);

  // Simulate 10 successes
  console.log("Simulating 10 user corrections (success)...");
  for (let i = 0; i < 10; i++) {
    await updatePatternStats("company", testRegex, true);
  }

  // Check new state
  const updatedPatterns = await loadPatterns();
  const newConf = updatedPatterns.company.patterns.find(
    (p) => p.regex === testRegex
  )?.confidence;
  console.log(`Updated Confidence for pattern: ${newConf}`);

  if (newConf && initialConf && newConf > initialConf) {
    console.log("✅ SUCCESS: Confidence increased after positive feedback.");
  } else {
    console.log("❌ FAIL: Confidence did not increase.");
  }
};

runTests().catch(console.error);
