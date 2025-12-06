import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import User, { IUser } from "../models/User";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

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
  maxResults: number = 10
) => {
  const auth = getUserOAuthClient(user);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  return res.data.messages || [];
};

export const getEmailDetails = async (user: IUser, messageId: string) => {
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

  return { id: res.data.id, subject, from, date, snippet };
};
