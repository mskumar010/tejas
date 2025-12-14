import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import gmailRoutes from "./routes/gmailRoutes";
import applicationRoutes from "./routes/applicationRoutes";

const app = express();

// Sanitize CLIENT_URL to prevent header errors
const rawClientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// Create an array of allowed origins including localhost and the env variable
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  rawClientUrl,
].map((url) =>
  url
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\/$/, "")
);

// Remove duplicates
const uniqueOrigins = [...new Set(allowedOrigins)];

console.log(`[Startup] Allowed CORS Origins:`, uniqueOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in the allowed list or is a localhost URL
      if (
        uniqueOrigins.includes(origin) ||
        origin.startsWith("http://localhost:")
      ) {
        return callback(null, true);
      } else {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
    },
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
