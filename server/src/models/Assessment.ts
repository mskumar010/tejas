import mongoose, { Schema, Document } from "mongoose";

export interface IAssessment extends Document {
  applicationId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type?: string;
  assignedDate: Date;
  deadline?: Date;
  estimatedHours?: number;
  url?: string;
  status: string;
  progress?: number;
  submittedAt?: Date;
  notes?: string;
  createdAt: Date;
}

const AssessmentSchema: Schema = new Schema({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: "Application",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, default: "take_home" }, // coding, system_design, take_home, case_study
  assignedDate: { type: Date, default: Date.now },
  deadline: { type: Date },
  estimatedHours: { type: Number },
  url: { type: String },
  status: { type: String, default: "pending" }, // pending, in_progress, completed, overdue
  progress: { type: Number, default: 0 }, // 0-100
  submittedAt: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

AssessmentSchema.index({ applicationId: 1 });
AssessmentSchema.index({ deadline: 1 });

export default mongoose.model<IAssessment>("Assessment", AssessmentSchema);
