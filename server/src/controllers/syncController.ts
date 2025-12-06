import { Request, Response } from "express";
import User from "../models/User";
import Application from "../models/Application";
import { listEmails, getEmailDetails } from "../services/gmailService";
import { parseEmail } from "../utils/emailParser";

export const syncEmails = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.gmailAccessToken) {
      return res.status(400).json({ message: "Gmail not connected" });
    }

    // 1. List recent emails (last 30 days)
    // Query: "subject:(application OR interview OR offer OR reject OR thank you)"
    const query =
      'category:primary subject:(application OR interview OR offer OR reject OR "thank you") newer_than:30d';
    const messages = await listEmails(user, query);

    let syncedCount = 0;

    // 2. Process each message
    for (const msg of messages) {
      // Check if we already processed this email ID (avoid duplicates)
      // Ideally we should store processed MessageIDs, but for MVP we'll rely on Application uniqueness or check existing

      const details = await getEmailDetails(user, msg.id!);

      if (!details) continue;

      const { subject, from, snippet, date } = details;
      const parsed = parseEmail(subject, from, snippet);

      if (parsed.status !== "Unknown" && parsed.company) {
        // Upsert Application
        // Logic: Find application by Company + User. If exists, update status if newer.
        // If not, create new.

        const existingApp = await Application.findOne({
          userId,
          company: { $regex: new RegExp(`^${parsed.company}$`, "i") },
        } as any);

        const emailData = {
          messageId: msg.id!,
          subject,
          sender: from,
          date: new Date(date),
          snippet,
        };

        if (existingApp) {
          // Check if email already linked to avoid duplicates in the array
          const emailExists = existingApp.relatedEmails?.some(
            (e) => e.messageId === msg.id
          );

          if (!emailExists) {
            existingApp.relatedEmails = existingApp.relatedEmails || [];
            existingApp.relatedEmails.push(emailData);

            // Only update status if it's different and meaningful update logic
            if (existingApp.status !== parsed.status) {
              existingApp.status = parsed.status;
            }

            existingApp.lastUpdatedAt = new Date();
            await existingApp.save();
            syncedCount++;
          }
        } else {
          await Application.create({
            userId,
            company: parsed.company,
            role: parsed.role || "Unknown Role",
            status: parsed.status,
            appliedDate: new Date(date),
            source: "Gmail Sync",
            relatedEmails: [emailData],
          });
          syncedCount++;
        }
      }
    }

    user.lastSyncedAt = new Date();
    await user.save();

    res.json({ message: "Sync complete", syncedCount });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ message: "Failed to sync emails" });
  }
};
