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

    let useDummy = false;
    if (!user.gmailAccessToken) {
      console.log("No Gmail token found, using dummy data.");
      useDummy = true;
      // return res.status(400).json({ message: "Gmail not connected" });
    }

    // 1. List recent emails (Smart Sync)
    // Query: "subject:(application OR interview OR offer OR reject OR thank you)"
    let query =
      'category:primary subject:(application OR interview OR offer OR reject OR "thank you")';

    // Check if user has synced before to decide time range
    if (user.lastSyncedAt) {
      // Convert lastSyncedAt to seconds since epoch for Gmail API filter "after:"
      const afterSeconds = Math.floor(
        new Date(user.lastSyncedAt).getTime() / 1000
      );
      query += ` after:${afterSeconds}`;
      console.log(`Syncing emails after: ${user.lastSyncedAt}`);
    } else {
      // First time sync: Look back 30 days
      query += " newer_than:30d";
      console.log("First time sync: looking back 30 days");
    }

    console.log(`Executing Gmail query: ${query}`);

    // We might need to fetch more than 10 if there are many candidates,
    // but for MVP let's cap at 20 to avoid timeouts per sync request
    const response = await listEmails(user, query, 20, undefined, useDummy);
    const messages = response.messages || [];
    console.log(`Found ${messages.length} messages to process.`);

    let syncedCount = 0;

    // 2. Process each message
    for (const msg of messages) {
      try {
        // Check if we already processed this email ID (avoid duplicates)
        // Ideally we should store processed MessageIDs, but for MVP we'll rely on Application uniqueness or check existing

        const details = await getEmailDetails(user, msg.id!, useDummy);

        if (!details) continue;

        const { subject, from, snippet, date, body } = details;
        const parsed = await parseEmail(subject, from, body);

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
            body,
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
      } catch (innerError) {
        console.error(`Error processing message ${msg.id}:`, innerError);
        // Continue to next message
      }
    }

    user.lastSyncedAt = new Date();
    await user.save();

    res.json({ message: "Sync complete", syncedCount });
  } catch (error: any) {
    console.error("Sync error:", error);
    // Return explicit error if it's from Gmail API (e.g., 401, 403)
    if (error.response) {
      return res.status(error.response.status || 500).json({
        message: error.response.data?.error?.message || "Gmail API Error",
        details: error.response.data,
      });
    }
    res
      .status(500)
      .json({ message: "Failed to sync emails", error: error.message });
  }
};
