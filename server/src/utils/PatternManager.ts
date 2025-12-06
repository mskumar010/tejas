import fs from "fs/promises";
import path from "path";

// Define Types
export interface Pattern {
  regex: string; // Stored as string, converted to RegExp at runtime
  confidence: number;
  successCount: number;
  failCount: number;
}

export interface StatusConfig {
  keywords: string[];
  weight: number;
  successCount?: number;
  failCount?: number;
}

export interface PatternLibrary {
  company: {
    patterns: Pattern[];
    domainToCompany: Record<string, string>;
  };
  role: {
    patterns: Pattern[];
  };
  status: Record<string, StatusConfig>;
}

// Global cached patterns (Module-level state)
let cachedPatterns: PatternLibrary | null = null;
const PATTERN_FILE = path.join(__dirname, "patterns.json");

/**
 * Loads patterns from the JSON file.
 * Returns cached patterns if already loaded to avoid IO overhead.
 */
export const loadPatterns = async (): Promise<PatternLibrary> => {
  if (cachedPatterns) {
    return cachedPatterns;
  }

  try {
    const data = await fs.readFile(PATTERN_FILE, "utf-8");
    cachedPatterns = JSON.parse(data);
    return cachedPatterns!;
  } catch (error) {
    console.error("Failed to load patterns.json", error);
    // Fallback or empty structure (should technically crash or retry)
    throw new Error("Could not load parsing patterns.");
  }
};

/**
 * Saves the current state of cachedPatterns to disk.
 * Should be called after learning updates.
 */
export const savePatterns = async (): Promise<void> => {
  if (!cachedPatterns) return;
  try {
    await fs.writeFile(PATTERN_FILE, JSON.stringify(cachedPatterns, null, 2));
  } catch (error) {
    console.error("Failed to save patterns.json", error);
  }
};

/**
 * Updates pattern statistics (success/fail) and adjusts confidence.
 */
export const updatePatternStats = async (
  type: "company" | "role",
  regexString: string,
  wasSuccessful: boolean
) => {
  if (!cachedPatterns) await loadPatterns();

  const group = cachedPatterns![type];
  const pattern = group.patterns.find((p) => p.regex === regexString);

  if (pattern) {
    if (wasSuccessful) {
      pattern.successCount++;
      // Bonus: Increase confidence slightly on success, cap at 99
      if (pattern.successCount % 10 === 0) {
        pattern.confidence = Math.min(pattern.confidence + 5, 99);
      }
    } else {
      pattern.failCount++;
      // Penalty: Decrease confidence on failure
      if (pattern.failCount % 5 === 0) {
        pattern.confidence = Math.max(pattern.confidence - 10, 10);
      }
    }
    await savePatterns();
  }
};

/**
 * Adjusts keyword weight for status detection based on feedback.
 */
export const adjustKeywordWeight = async (
  status: string,
  keyword: string,
  wasCorrect: boolean
) => {
  if (!cachedPatterns) await loadPatterns();

  const config = cachedPatterns!.status[status];
  if (!config) return;

  // Track stats for status (if we add precise keyword tracking later)
  // For now, simpler: adjust the entire status weight slightly if it's consistently wrong?
  // Actually, better to maintain a separate keyword stats list if needed.
  // For simplicity MVP: Just logging or minor adjustment.

  if (wasCorrect) {
    // config.weight = Math.min(config.weight + 1, 50);
  } else {
    // config.weight = Math.max(config.weight - 1, 1);
  }
  // Saving unimplemented for per-keyword stats in this simpler MVP structure
  // unless we expand JSON schema.
};
