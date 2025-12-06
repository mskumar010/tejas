import mongoose, { Schema, Document } from "mongoose";

export interface IEmail extends Document {
  userId: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  gmailMessageId: string;
  threadId?: string;
  subject: string;
  from: string;
  to?: string;
  body?: string;
  bodyHtml?: string;
  receivedAt: Date;
  isJobRelated: boolean;
  isConfirmed: boolean;
  parsedData?: {
    company?: string;
    role?: string;
    status?: string;
    interviewDate?: Date;
    assessmentDeadline?: Date;
    confidence?: number;
  };
  createdAt: Date;
}

const EmailSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: "Application" },
  gmailMessageId: { type: String, required: true, unique: true },
  threadId: { type: String },
  subject: { type: String },
  from: { type: String },
  to: { type: String },
  body: { type: String },
  bodyHtml: { type: String },
  receivedAt: { type: Date, required: true },
  isJobRelated: { type: Boolean, default: false },
  isConfirmed: { type: Boolean, default: false },
  parsedData: {
    company: String,
    role: String,
    status: String,
    interviewDate: Date,
    assessmentDeadline: Date,
    confidence: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

EmailSchema.index({ userId: 1 });
EmailSchema.index({ applicationId: 1 });
EmailSchema.index({ gmailMessageId: 1 });

export default mongoose.model<IEmail>("Email", EmailSchema);
