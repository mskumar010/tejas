import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  gmailAccessToken?: string;
  gmailRefreshToken?: string;
  lastSyncedAt?: Date;
  settings: {
    autoSync: boolean;
    syncFrequency: number;
    followUpSuggestionDays: number;
    noLongerConsideringDays: number;
    autoArchiveDays: number;
    postInterviewReminderDays: number;
    assessmentOverdueGraceDays: number;
    offerExpirationWarningDays: number;
    notifications: {
      email: boolean;
      browser: boolean;
      newEmails: boolean;
      interviewReminders: boolean;
      assessmentDeadlines: boolean;
      followUpSuggestions: boolean;
      noLongerConsidering: boolean;
      cooldownEnding: boolean;
    };
  };
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  gmailAccessToken: { type: String },
  gmailRefreshToken: { type: String },
  lastSyncedAt: { type: Date },
  settings: {
    autoSync: { type: Boolean, default: true },
    syncFrequency: { type: Number, default: 15 },
    followUpSuggestionDays: { type: Number, default: 30 },
    noLongerConsideringDays: { type: Number, default: 60 },
    autoArchiveDays: { type: Number, default: 90 },
    postInterviewReminderDays: { type: Number, default: 7 },
    assessmentOverdueGraceDays: { type: Number, default: 2 },
    offerExpirationWarningDays: { type: Number, default: 5 },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      newEmails: { type: Boolean, default: true },
      interviewReminders: { type: Boolean, default: true },
      assessmentDeadlines: { type: Boolean, default: true },
      followUpSuggestions: { type: Boolean, default: true },
      noLongerConsidering: { type: Boolean, default: true },
      cooldownEnding: { type: Boolean, default: true },
    },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
