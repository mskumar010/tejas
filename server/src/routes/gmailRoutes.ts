import express from "express";
import { connectGmail, callbackGmail } from "../controllers/gmailController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Get the auth URL (Front end will redirect here)
router.get("/connect", protect, connectGmail);

// Handle the callback from Google
router.get("/callback", protect, callbackGmail);

export default router;
