import express from "express";
import {
  connectGmail,
  callbackGmail,
  getMessages,
  getMessageDetails,
  importMessage,
} from "../controllers/gmailController";
import { syncEmails } from "../controllers/syncController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Get the auth URL (Front end will redirect here)
router.get("/connect", protect, connectGmail);

// Handle the callback from Google
router.get("/callback", callbackGmail);

// Sync emails
router.post("/sync", protect, syncEmails);

// Paginated Messages
router.get("/messages", protect, getMessages);

// Message Details
// Message Details
router.get("/message/:id", protect, getMessageDetails);

// Manual Import
router.post("/import", protect, importMessage);

export default router;
