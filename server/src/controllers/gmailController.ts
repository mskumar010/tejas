import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { google } from "googleapis";
import { getAuthUrl, getTokens } from "../services/gmailService";
import User from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

// Helper for generating token (same as authController)
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

export const connectGmail = (req: AuthRequest, res: Response) => {
  // We use state to pass the user ID and action
  const state = JSON.stringify({ action: "connect", userId: req.user.id });
  const url = getAuthUrl(undefined, state);
  res.json({ url });
};

export const callbackGmail = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code || typeof code !== "string") {
    res.status(400).json({ message: "Invalid code" });
    return;
  }

  try {
    // 1. Get Tokens
    const tokens = await getTokens(code);

    // 2. Determine Action from State
    let action = "login";
    let targetUserId = null;

    if (state && typeof state === "string") {
      try {
        const parsedState = JSON.parse(state);
        if (parsedState.action) action = parsedState.action;
        if (parsedState.userId) targetUserId = parsedState.userId;
      } catch (e) {
        // If state isn't JSON, assume basic login or legacy
        console.log("State parse failed, defaulting to login", e);
      }
    }

    if (action === "connect" && targetUserId) {
      // --- LINKING FLOW (Existing User) ---
      const user = await User.findById(targetUserId);
      if (!user) {
        res.status(404).json({ message: "User not found to link" });
        return;
      }
      user.gmailAccessToken = tokens.access_token || undefined;
      if (tokens.refresh_token) {
        user.gmailRefreshToken = tokens.refresh_token;
      }
      await user.save();

      // Redirect to settings or close window
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      res.redirect(`${clientUrl}/dashboard?message=GmailConnected`);
      return;
    }

    // --- LOGIN/HOLDER FLOW (New or Returning User via "Sign In") ---

    // Get User Profile from Google to identify them
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: "me" });
    const email = profile.data.emailAddress;

    if (!email) {
      res.status(400).json({ message: "Could not retrieve email from Google" });
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        email,
        password: hashedPassword,
        settings: {
          autoSync: true,
          notifications: { email: true, browser: true },
        },
        gmailAccessToken: tokens.access_token || undefined,
        gmailRefreshToken: tokens.refresh_token || undefined,
      });
    } else {
      // Update tokens even on login
      user.gmailAccessToken = tokens.access_token || undefined;
      if (tokens.refresh_token) {
        user.gmailRefreshToken = tokens.refresh_token;
      }
      await user.save();
    }

    // Generate App Token and Redirect
    const token = generateToken(user._id as unknown as string);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(
      `${clientUrl}/auth/success?token=${token}&email=${email}&id=${user._id}`
    );
  } catch (error) {
    console.error("Gmail Callback Error:", error);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/login?error=GoogleAuthFailed`);
  }
};

import {
  listEmails,
  getBatchEmailMetadata,
  getEmailDetails,
} from "../services/gmailService";
import Application from "../models/Application";
import { parseEmail } from "../utils/emailParser";

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pageToken = req.query.pageToken as string | undefined;
    const maxResults = req.query.maxResults
      ? parseInt(req.query.maxResults as string)
      : 50;

    // 1. Fetch List (IDs only) - Efficient
    const listRes = await listEmails(user, "", maxResults, pageToken);

    if (!listRes.messages || listRes.messages.length === 0) {
      return res.json({
        messages: [],
        nextPageToken: undefined,
        resultSizeEstimate: 0,
      });
    }

    const messageIds = listRes.messages.map((m) => m.id);

    // 2. Fetch Metadata (Subject, Date, Snippet) - Parallel
    const metadataList = await getBatchEmailMetadata(user, messageIds);

    // 3. TAG STATUS CHECK (The "Smart" Part)
    // Find all applications for this user that have one of these message IDs
    const taggedApps = await Application.find({
      userId,
      "relatedEmails.messageId": { $in: messageIds },
    }).select("_id relatedEmails.messageId");

    // Create a map of messageID -> AppID for O(1) lookup
    const tagMap = new Map<string, string>();
    taggedApps.forEach((app) => {
      app.relatedEmails?.forEach((email) => {
        if (messageIds.includes(email.messageId)) {
          tagMap.set(email.messageId, app._id.toString());
        }
      });
    });

    // 4. Merge Data
    const finalMessages = metadataList.map((msg) => ({
      ...msg,
      isTagged: msg && tagMap.has(msg.id!),
      relatedAppId: msg && tagMap.get(msg.id!),
    }));

    res.json({
      messages: finalMessages,
      nextPageToken: listRes.nextPageToken,
      resultSizeEstimate: listRes.resultSizeEstimate,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const getMessageDetails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { id } = req.params;
    const details = await getEmailDetails(user, id);

    res.json(details);
  } catch (error) {
    console.error("Get Message Details Error:", error);
    res.status(500).json({ message: "Failed to fetch email details" });
  }
};

export const importMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { id } = req.body; // Message ID from body
    if (!id) return res.status(400).json({ message: "Message ID required" });

    // 1. Fetch Full Details
    const details = await getEmailDetails(user, id);
    if (!details) return res.status(404).json({ message: "Email not found" });

    const { subject, from, snippet, date, body } = details;
    const parsed = await parseEmail(subject, from, body);

    // 2. Find or Create Application
    // Use company name if found, otherwise generic "Inbox Import" or similar?
    // User wants "Tagged and Moved", implying we create an app even if "Unknown" status?
    // Let's fallback to "Manual Import" company if parsing fails to find one.

    const companyName = parsed.company || "Unknown Company";

    let existingApp = await Application.findOne({
      userId,
      company: { $regex: new RegExp(`^${companyName}$`, "i") },
    } as any);

    const emailData = {
      messageId: id,
      subject,
      sender: from,
      date: new Date(date),
      snippet,
      body,
    };

    let appId;

    if (existingApp) {
      // Check for duplicate email
      const emailExists = existingApp.relatedEmails?.some(
        (e) => e.messageId === id
      );
      if (!emailExists) {
        existingApp.relatedEmails = existingApp.relatedEmails || [];
        existingApp.relatedEmails.push(emailData);
        existingApp.lastUpdatedAt = new Date();
        await existingApp.save();
      }
      appId = existingApp._id;
    } else {
      // Create New
      const newApp = await Application.create({
        userId,
        company: companyName,
        role: parsed.role || "Unknown Role",
        status: parsed.status !== "Unknown" ? parsed.status : "APPLIED", // Default to APPLIED if unknown
        appliedDate: new Date(date),
        source: "Manual Import",
        relatedEmails: [emailData],
      });
      appId = newApp._id;
    }

    res.json({ message: "Imported successfully", appId: appId.toString() });
  } catch (error) {
    console.error("Import Message Error:", error);
    res.status(500).json({ message: "Failed to import message" });
  }
};
