import mongoose, { Schema, Document } from "mongoose";

export interface IInterview extends Document {
  applicationId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  type: string;
  duration?: number;
  interviewer?: string;
  interviewerTitle?: string;
  round?: number;
  totalRounds?: number;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: string;
  completedAt?: Date;
  reminderSentAt?: Date;
  createdAt: Date;
}

const InterviewSchema: Schema = new Schema({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: "Application",
    required: true,
  },
  scheduledDate: { type: Date, required: true },
  type: { type: String, default: "phone" }, // phone, video, onsite
  duration: { type: Number }, // minutes
  interviewer: { type: String },
  interviewerTitle: { type: String },
  round: { type: Number },
  totalRounds: { type: Number },
  location: { type: String },
  meetingLink: { type: String },
  notes: { type: String },
  status: { type: String, default: "scheduled" }, // scheduled, completed, cancelled, rescheduled
  completedAt: { type: Date },
  reminderSentAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

InterviewSchema.index({ applicationId: 1 });
InterviewSchema.index({ scheduledDate: 1 });

export default mongoose.model<IInterview>("Interview", InterviewSchema);
