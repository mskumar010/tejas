import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  googleLogin,
  googleAuthCallback,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

// Google Auth Routes
router.get("/google-signin", googleLogin);
router.get("/google/callback", googleAuthCallback);

export default router;
