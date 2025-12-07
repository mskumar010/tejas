// test-parser.ts
import { parseEmail } from "../utils/emailParser";

const testCases = [
  {
    subject: "Thank you for applying to Google",
    sender: "Google Careers <careers@google.com>",
    snippet: "We have received your application...",
    expected: { company: "Google", status: "Applied" },
  },
  {
    subject: "Interview at Amazon - SDE II",
    sender: "Amazon Recruiting <recruiting@amazon.com>",
    snippet: "We would like to schedule...",
    expected: { company: "Amazon", status: "Interview" },
  },
  {
    subject: "Update on your application to Meta",
    sender: "Facebook <no-reply@facebook.com>",
    snippet: "Unfortunately, we will not be moving forward...",
    expected: { company: "Meta", status: "Reject" },
  },
  {
    subject: "Unknown Subject Line",
    sender: "Random <person@gmail.com>",
    snippet: "Hello there",
    expected: { company: undefined, status: "Unknown" },
  },
];

console.log("Running Parser Tests...\n");

(async () => {
  for (const [i, test] of testCases.entries()) {
    const result = await parseEmail(test.subject, test.sender, test.snippet);
    console.log(`Test ${i + 1}: ${test.subject}`);
    console.log(`  Expected: ${JSON.stringify(test.expected)}`);
    console.log(
      `  Actual:   ${JSON.stringify({
        company: result.company,
        status: result.status,
      })}`
    );

    const statusMatch = result.status === test.expected.status;
    // Heuristic match for company (contains)
    const companyMatch =
      (!test.expected.company && !result.company) ||
      (result.company &&
        test.expected.company &&
        (result.company.includes(test.expected.company) ||
          test.expected.company.includes(result.company)));

    if (statusMatch && companyMatch) {
      console.log("  ✅ PASS\n");
    } else {
      console.log("  ❌ FAIL\n");
    }
  }
})();
