import mongoose, { Document, Schema } from "mongoose";

export interface IIssue extends Document {
  userId?: mongoose.Types.ObjectId;
  description: string;
  url: string;
  createdAt: Date;
}

const issueSchema = new Schema<IIssue>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    description: { type: String, required: true },
    url: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IIssue>("Issue", issueSchema);
