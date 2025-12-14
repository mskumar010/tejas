import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import gmailRoutes from "./routes/gmailRoutes";
import applicationRoutes from "./routes/applicationRoutes";

const app = express();

// Sanitize CLIENT_URL to prevent header errors (removes newlines & trailing slashes)
const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173")
  .trim()
  .replace(/\/$/, "");

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] Client Request: ${req.method} ${
      req.url
    } origin: ${req.headers.origin}`
  );
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/applications", applicationRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.get("/api/health-check-ping", (req, res) => {
  res.status(200).json({ status: "ok", message: "pong" });
});

export default app;
