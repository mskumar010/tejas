import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import User, { IUser } from "../models/User";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// Import dummy data
import dummyEmails from "../data/dummyEmails.json";

export const getOAuthClient = (): OAuth2Client => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

export const getAuthUrl = (): string => {
  const oAuth2Client = getOAuthClient();
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
};

export const getTokens = async (code: string) => {
  const oAuth2Client = getOAuthClient();
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
};

export const getUserOAuthClient = (user: IUser): OAuth2Client => {
  const oAuth2Client = getOAuthClient();
  oAuth2Client.setCredentials({
    access_token: user.gmailAccessToken,
    refresh_token: user.gmailRefreshToken,
  });
  return oAuth2Client;
};

export const listEmails = async (
  user: IUser,
  query: string = "",
  maxResults: number = 10,
  useDummy: boolean = false
) => {
  if (useDummy) {
    console.log("Using Dummy Data for listEmails");
    return dummyEmails.map((e) => ({
      id: e.id,
      threadId: e.threadId,
    }));
  }
  const auth = getUserOAuthClient(user);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  return res.data.messages || [];
};

// Helper to extract body from payload
const getBody = (payload: any): string => {
  let body = "";
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body && part.body.data) {
        body += Buffer.from(part.body.data, "base64").toString("utf-8");
      } else if (part.parts) {
        // Recursive check for nested parts (some emails are multipart/alternative inside multipart/related)
        body += getBody(part);
      }
    }
  } else if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  return body || payload.snippet || "";
};

export const getEmailDetails = async (
  user: IUser,
  messageId: string,
  useDummy: boolean = false
) => {
  if (useDummy) {
    const email = dummyEmails.find((e) => e.id === messageId);
    if (!email) throw new Error("Dummy email not found");

    const headers = email.payload?.headers || [];
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "No Subject";
    const from =
      headers.find((h) => h.name === "From")?.value || "Unknown Sender";
    const date =
      headers.find((h) => h.name === "Date")?.value || new Date().toISOString();
    const snippet = email.snippet || "";
    // For dummy data, if body exists use it, else snippet
    // @ts-ignore
    const body = email.body || snippet;

    return { id: email.id, subject, from, date, snippet, body };
  }
  const auth = getUserOAuthClient(user);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  const headers = res.data.payload?.headers || [];
  const subject =
    headers.find((h) => h.name === "Subject")?.value || "No Subject";
  const from =
    headers.find((h) => h.name === "From")?.value || "Unknown Sender";
  const date =
    headers.find((h) => h.name === "Date")?.value || new Date().toISOString();
  const snippet = res.data.snippet || "";
  const body = getBody(res.data.payload);

  return { id: res.data.id, subject, from, date, snippet, body };
};
