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
  updateRequestStatus 
} from "../controller/adminController.js";

const router = express.Router();

// This protects ALL routes below with both Auth and Admin checks
router.use(authMiddleware, adminMiddleware);

/**
 * --- Household Management ---
 * These routes are explicitly mapped to fix the 404 errors in your console
 */

// Gets the list for the main table
router.get("/households", adminListHouseholds);

// Fixes the 404 for the "Review Details" page
// This captures the MongoDB ID from the URL
router.get("/households/:householdId", adminGetHouseholdById);
router.patch("/households/:householdId/verify", adminVerifyHousehold);
router.patch("/households/:householdId/reject", adminRejectHousehold);
router.patch("/households/:householdId/correction", adminRequestCorrection);
/**
 * --- Dashboard & Stats ---
 */
router.get("/progress", adminProgress);
router.get("/analytics", adminAnalytics);

/**
 * --- Notifications & Change Requests ---
 */
router.get("/notifications", getAdminNotifications);

// Handles Approve/Reject for specific citizen change requests
router.patch("/requests/:id/status", updateRequestStatus);

export default router;