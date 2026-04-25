import express from "express";
// Update imports to include new controllers
import {
  getApplications,
  updateStatus,
  updateDetails,
  deleteApplication,
  exportCSV,
  createManual,
} from "../controllers/applicationController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getApplications);
router.get("/export", protect, exportCSV);
router.post("/manual", protect, createManual);
router.patch("/:id/status", protect, updateStatus);
router.patch("/:id/details", protect, updateDetails);
router.delete("/:id", protect, deleteApplication);

export default router;
