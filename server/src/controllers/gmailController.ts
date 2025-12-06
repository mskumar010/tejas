import { Request, Response } from "express";
import { getAuthUrl, getTokens } from "../services/gmailService";
import User from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

export const connectGmail = (req: Request, res: Response) => {
  const url = getAuthUrl();
  res.json({ url });
};

export const callbackGmail = async (req: AuthRequest, res: Response) => {
  const { code } = req.query;
  const userId = req.user?.id;

  if (!code || typeof code !== "string") {
    res.status(400).json({ message: "Invalid code" });
    return;
  }

  try {
    const tokens = await getTokens(code);

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.gmailAccessToken = tokens.access_token || undefined;
    if (tokens.refresh_token) {
      user.gmailRefreshToken = tokens.refresh_token;
    }
    await user.save();

    res.json({ message: "Gmail connected successfully", tokens_saved: true });
  } catch (error) {
    console.error("Gmail Callback Error:", error);
    res.status(500).json({ message: "Error connecting Gmail", error });
  }
};
