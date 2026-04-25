import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  googleLogin,
  googleAuthCallback,
  completeOnboarding,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/complete-onboarding", protect, completeOnboarding);

// Google Auth Routes
router.get("/google-signin", googleLogin);
router.get("/google/callback", googleAuthCallback);

export default router;
