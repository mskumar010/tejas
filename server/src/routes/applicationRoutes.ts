import express from "express";
// Update imports to include new controllers
import {
  getApplications,
  updateStatus,
  createManual,
} from "../controllers/applicationController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getApplications);
router.post("/manual", protect, createManual);
router.patch("/:id/status", protect, updateStatus);

export default router;
