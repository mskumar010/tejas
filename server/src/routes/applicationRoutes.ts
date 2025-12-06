import express from "express";
import { getApplications } from "../controllers/applicationController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getApplications);

export default router;
