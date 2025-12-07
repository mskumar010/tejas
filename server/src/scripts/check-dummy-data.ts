import { parseEmail } from "../utils/emailParser";
import fs from "fs";
import path from "path";

const dummyPath = path.join(__dirname, "../data/dummyEmails.json");
const dummyData = JSON.parse(fs.readFileSync(dummyPath, "utf-8"));

// Filter for our new fake emails and manual entries
const newEmails = dummyData.filter(
  (e: any) => e.id.startsWith("new_fake_") || e.id.startsWith("manual_")
);

console.log(`Checking ${newEmails.length} emails (Fake + Manual)...\n`);

(async () => {
  for (const email of newEmails) {
    const subject =
      email.payload.headers.find((h: any) => h.name === "Subject")?.value || "";
    const sender =
      email.payload.headers.find((h: any) => h.name === "From")?.value || "";
    const body = email.body || email.snippet;

    try {
      const result = await parseEmail(subject, sender, body);
      console.log(`Email ID: ${email.id}`);
      console.log(`Subject: ${subject}`);
      console.log(`Parsed Result:`);
      console.log(`  Company: ${result.company}`);
      console.log(`  Status:  ${result.status}`);
      console.log(`  Dates:   ${JSON.stringify(result.dates)}`); // Check NLP dates
      console.log("-----------------------------------");
    } catch (e) {
      console.error(`Error parsing email ${email.id}:`, e);
    }
  }
})();
