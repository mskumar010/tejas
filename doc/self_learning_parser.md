# Self-Learning Email Parser Documentation

## Overview

The Self-Learning Email Parser is a core component of the Tejas application designed to extract structured data (Company, Role, Status, Dates, etc.) from job application emails. Unlike static parsers, this system evolves over time by learning from user corrections, adjusting the confidence scores of its regex patterns and keyword weights.

## Architecture

The system consists of three main modules:

1.  **`Data/Pattern Library`** (`server/src/utils/patterns.json`):

    - Stores the "brain" of the parser.
    - Contains regex patterns for Company and Role extraction.
    - Contains keyword lists and weights for Status detection.
    - Tracks `successCount` and `failCount` for every pattern.

2.  **`PatternManager`** (`server/src/utils/PatternManager.ts`):

    - **I/O Operations**: Loads and saves the JSON pattern library.
    - **Learning Logic**: Updates pattern statistics based on user feedback.
    - **Optimization**: Caches patterns in memory to reduce file reads.

3.  **`JobEmailParser`** (`server/src/utils/jobEmailParser.ts`):

    - **Functional Parser**: Pure functional approach (no class state).
    - **Weighted Scoring**: Determines "Status" by calculating scores based on keyword occurrences and their weights.
    - **Confidence Calculation**: Computes an overall confidence score (0-100%) based on how many fields were successfully identified and the confidence of the specific patterns used.

4.  **`Persistence`** (`server/src/models/ParsedEmail.ts`):
    - Stores the raw email content, the parsed result, and any user corrections.
    - Essential for future "retraining" or batch analysis.

## Key Features

### 1. Weighted Status Detection

The parser doesn't just look for "rejected". It assigns weights to keywords.

- "Offer Letter": Weight 20 (Strong indicator)
- "Interview": Weight 8 (Medium)
- "Applied": Weight 5 (Weak)

The status with the highest cumulative score wins.

### 2. Hierarchical Extraction

For **Company** and **Role**, the parser currently uses a tiered strategy:

1.  **Company**: Checks Email Domain (High Confidence) -> Body Regex (Medium Faith).
2.  **Role**: Checks Subject Line (High Confidence) -> Body Regex (Lower Confidence).

### 3. Feedback Loop (Self-Learning)

When a user confirms or corrects a parse:

- **Success**: If the parser was right, the specific regex patterns used gain `+5` confidence (capped at 99%).
- **Failure**: If the parser was wrong, the failed patterns lose `-10` confidence (floored at 10%).

## API Usage

### Parse an Email

Typically called internally by the `gmailController` or `applicationController`.

```typescript
import { parseEmail } from "../utils/emailParser";

const result = await parseEmail(subject, sender, body);
console.log(result);
/*
{
  company: "IBM",
  role: "Software Engineer",
  status: "Rejected",
  confidence: 85,
  jobId: "12345",
  cooldown: { duration: 6, unit: "months" }
}
*/
```

### Submit Feedback (Learning)

Call this endpoint when a user verifies or updates the data in the UI.

**Endpoint**: `POST /api/applications/confirm-parsing` (implemented in `applicationController`)

**Request Body**:

```json
{
  "emailId": "654321...", // ID of the ParsedEmail record
  "isCorrect": false,
  "corrections": {
    "company": "IBM India",
    "role": "Senior Developer",
    "status": "Applied"
  }
}
```

**Response**:

```json
{
  "message": "Feedback process completed",
  "success": true
}
```

## Adding New Patterns manually

You can manually add patterns to `server/src/utils/patterns.json`.

- **Regex**: Ensure to escape backslashes (e.g., `\\s+`).
- **Confidence**: Start new manual patterns around `80`.

## Future Improvements

- **Keyword Weight Learning**: Currently, we only adjust Regex confidence. Future versions could adjust Status Keyword weights based on feedback.
- **New Pattern Generation**: If a user provides a correct value that wasn't found, the system could analyze the text surrounding that value to _generate_ a new regex pattern automatically.
