import express from "express";
import authMiddleware from "../middleware/authMiddleWare.js";
import adminMiddleware from "../middleware/adminMiddleWare.js";

import {
  adminListHouseholds,
  adminGetHouseholdById,
  adminVerifyHousehold,
  adminRejectHousehold,
  adminRequestCorrection,
  adminProgress,
  adminAnalytics,
  getAdminNotifications,
  updateRequestStatus,
} from "../controller/adminController.js";

import { exportPDF } from "../controller/reportcontroller.js";

const router = express.Router();

// Protects ALL routes below with both Auth and Admin checks
router.use(authMiddleware, adminMiddleware);

// --- Household Management ---
router.get("/households", adminListHouseholds);
router.get("/households/:householdId", adminGetHouseholdById);
router.patch("/households/:householdId/verify", adminVerifyHousehold);
router.patch("/households/:householdId/reject", adminRejectHousehold);
router.patch("/households/:householdId/correction", adminRequestCorrection);

// --- Dashboard & Stats ---
router.get("/progress", adminProgress);
router.get("/analytics", adminAnalytics);

// --- Notifications & Change Requests ---
router.get("/notifications", getAdminNotifications);
router.patch("/requests/:id/status", updateRequestStatus);

// --- Reports ---
router.get("/reports/pdf", exportPDF);
router.post("/reports/pdf", exportPDF);

// add this import in adminController.js
export const getVerifiedCitizens = async (req, res) => {
  try {
    const citizens = await VerifiedCitizen.find().lean();
    res.json(citizens);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch verified citizens" });
  }
};

// in adminRoutes.js
router.get("/verified-citizens", getVerifiedCitizens);

export default router;