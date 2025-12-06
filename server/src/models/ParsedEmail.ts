import mongoose, { Schema, Document } from "mongoose";

export interface IParsedEmail extends Document {
  emailId?: string; // Optional if we just want to track text without mapping to a specific message ID
  rawContent: {
    subject: string;
    sender: string;
    bodySnippet: string;
  };
  parsedResult: {
    company?: string;
    role?: string;
    status: string;
    confidence: number;
    patternsUsed: string[];
  };
  userCorrection?: {
    isCorrect: boolean;
    correctedCompany?: string;
    correctedRole?: string;
    correctedStatus?: string;
  };
  createdAt: Date;
}

const ParsedEmailSchema: Schema = new Schema({
  emailId: { type: String },
  rawContent: {
    subject: String,
    sender: String,
    bodySnippet: String,
  },
  parsedResult: {
    company: String,
    role: String,
    status: String,
    confidence: Number,
    patternsUsed: [String],
  },
  userCorrection: {
    isCorrect: Boolean,
    correctedCompany: String,
    correctedRole: String,
    correctedStatus: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IParsedEmail>("ParsedEmail", ParsedEmailSchema);
