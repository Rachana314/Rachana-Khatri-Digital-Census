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
  updateRequestStatus // Added this to handle Approve/Reject actions
} from "../controller/adminController.js";

const router = express.Router();

// This protects ALL routes below with both Auth and Admin checks
router.use(authMiddleware, adminMiddleware);

// --- Household Management ---
router.get("/households", adminListHouseholds);
router.get("/households/:id", adminGetHouseholdById);
router.patch("/households/:id/verify", adminVerifyHousehold);
router.patch("/households/:id/reject", adminRejectHousehold);
router.patch("/households/:id/correction", adminRequestCorrection);

// --- Dashboard & Stats ---
router.get("/progress", adminProgress);
router.get("/analytics", adminAnalytics);

// --- User Change Requests (Notifications) ---
router.get("/notifications", getAdminNotifications);

// NEW: Route to actually Approve/Reject the change request
// This matches the logic needed when you click the buttons in the Admin UI
router.patch("/requests/:id/status", updateRequestStatus);

export default router;