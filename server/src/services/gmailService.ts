import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import User, { IUser } from "../models/User";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// Import dummy data
import dummyEmails from "../data/dummyEmails.json";

export const getOAuthClient = (): OAuth2Client => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID?.trim(),
    process.env.GOOGLE_CLIENT_SECRET?.trim(),
    process.env.GOOGLE_REDIRECT_URI?.trim()
  );
};

export const getAuthUrl = (
  redirectUriOverride?: string,
  state?: string
): string => {
  const oAuth2Client = getOAuthClient();
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const redirectUri =
    redirectUriOverride || process.env.GOOGLE_REDIRECT_URI?.trim();

  console.log("DEBUG: CLIENT_ID:", clientId);
  console.log("DEBUG: REDIRECT_URI:", redirectUri);
  console.log("DEBUG: STATE:", state);

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    redirect_uri: redirectUri,
    state: state,
  });
  console.log("DEBUG: Generated Auth URL:", url);
  return url;
};

export const getTokens = async (code: string, redirectUriOverride?: string) => {
  const oAuth2Client = getOAuthClient();
  const redirectUri =
    redirectUriOverride || process.env.GOOGLE_REDIRECT_URI?.trim();

  const { tokens } = await oAuth2Client.getToken({
    code,
    redirect_uri: redirectUri,
  });
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

interface ListEmailsResponse {
  messages: { id: string; threadId: string }[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export const listEmails = async (
  user: IUser,
  query: string = "",
  maxResults: number = 10,
  pageToken?: string,
  useDummy: boolean = false
): Promise<ListEmailsResponse> => {
  if (useDummy) {
    console.log("Using Dummy Data for listEmails");
    // Simple pagination mock for dummy data
    const start = pageToken ? parseInt(pageToken) : 0;
    const end = start + maxResults;
    const sliced = dummyEmails.slice(start, end);
    const nextToken = end < dummyEmails.length ? end.toString() : undefined;

    return {
      messages: sliced.map((e) => ({
        id: e.id,
        threadId: e.threadId,
      })),
      nextPageToken: nextToken,
      resultSizeEstimate: dummyEmails.length,
    };
  }
  const auth = getUserOAuthClient(user);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
    pageToken,
  });

  const messages = (res.data.messages || [])
    .map((msg) => ({
      id: msg.id || "",
      threadId: msg.threadId || "",
    }))
    .filter((msg) => msg.id && msg.threadId);

  return {
    messages,
    nextPageToken: res.data.nextPageToken || undefined,
    resultSizeEstimate: res.data.resultSizeEstimate || 0,
  };
};

export const getBatchEmailMetadata = async (
  user: IUser,
  messageIds: string[],
  useDummy: boolean = false
) => {
  if (useDummy) {
    return messageIds
      .map((id) => {
        const email = dummyEmails.find((e) => e.id === id);
        if (!email) return null;
        // Mock constructing metadata from dummy
        const headers = email.payload?.headers || [];
        const subject =
          headers.find((h) => h.name === "Subject")?.value || "No Subject";
        const from =
          headers.find((h) => h.name === "From")?.value || "Unknown Sender";
        const date =
          headers.find((h) => h.name === "Date")?.value ||
          new Date().toISOString();
        return {
          id: email.id,
          threadId: email.threadId,
          snippet: email.snippet,
          subject,
          from,
          date,
        };
      })
      .filter(Boolean);
  }

  const auth = getUserOAuthClient(user);
  const gmail = google.gmail({ version: "v1", auth });

  // Parallel fetch (Google Nodes library doesn't support easy batching, so Promise.all is standard for <100 items)
  const promises = messageIds.map(async (id) => {
    try {
      const res = await gmail.users.messages.get({
        userId: "me",
        id: id,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });

      const headers = res.data.payload?.headers || [];
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
      const from = headers.find((h) => h.name === "From")?.value || "(Unknown)";
      const date = headers.find((h) => h.name === "Date")?.value || "";

      return {
        id: res.data.id,
        threadId: res.data.threadId,
        snippet: res.data.snippet,
        subject,
        from,
        date,
      };
    } catch (error) {
      console.error(`Failed to fetch metadata for msg ${id}`, error);
      return null; // Handle individual failures gracefully
    }
  });

  const results = await Promise.all(promises);
  return results.filter((r) => r !== null);
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
