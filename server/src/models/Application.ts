import mongoose, { Schema, Document } from "mongoose";

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  status: string;
  source: string;
  appliedDate: Date;
  lastUpdatedAt: Date;
  jobUrl?: string;
  jobId?: string;
  location?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  notes?: string;
  tags?: string[];
  cooldownUntil?: Date;
  autoStatusLastChecked?: Date;
  createdAt: Date;
  relatedEmails?: {
    messageId: string;
    subject: string;
    sender: string;
    date: Date;
    snippet: string;
    body?: string;
  }[];
}

const ApplicationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, required: true, default: "applied" },
  source: { type: String, default: "email" },
  appliedDate: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now },
  jobUrl: { type: String },
  jobId: { type: String },
  location: { type: String },
  salary: {
    min: Number,
    max: Number,
    currency: String,
  },
  notes: { type: String },
  tags: [{ type: String }],
  cooldownUntil: { type: Date },
  autoStatusLastChecked: { type: Date },
  createdAt: { type: Date, default: Date.now },
  relatedEmails: [
    {
      messageId: String,
      subject: String,
      sender: String,
      date: Date,
      snippet: String,
      body: String,
    },
  ],
  confidenceScore: { type: Number }, // Parser confidence
  parsingDetails: { type: Schema.Types.Mixed }, // Store extra metadata like patterns used
});

// Index for efficient querying by user
ApplicationSchema.index({ userId: 1 });
ApplicationSchema.index({ company: 1 });

export default mongoose.model<IApplication>("Application", ApplicationSchema);
