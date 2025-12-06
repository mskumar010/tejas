import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  applicationId?: mongoose.Types.ObjectId;
  read: boolean;
  sentAt: Date;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true }, // interview_reminder, assessment_deadline, etc.
  title: { type: String, required: true },
  message: { type: String, required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: "Application" },
  read: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ read: 1 });

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
