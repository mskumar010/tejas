import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  domain?: string;
  website?: string;
  glassdoorRating?: number;
  interviewProcess?: string;
  applicationIds: mongoose.Types.ObjectId[];
  cooldownUntil?: Date;
  notes?: string;
  createdAt: Date;
}

const CompanySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  domain: { type: String },
  website: { type: String },
  glassdoorRating: { type: Number },
  interviewProcess: { type: String },
  applicationIds: [{ type: Schema.Types.ObjectId, ref: "Application" }],
  cooldownUntil: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

CompanySchema.index({ userId: 1 });
CompanySchema.index({ name: 1 });

export default mongoose.model<ICompany>("Company", CompanySchema);
