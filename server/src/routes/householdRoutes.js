import express from "express";
import authMiddleware from "../middleware/authMiddleWare.js";
import { upload } from "../middleware/upload.js";
import { submitDeleteRequest } from "../controller/userController.js";
import {
  listHouseholds,
  getHousehold,
  createHousehold,
  updateHousehold,
  submitHousehold,
  uploadDocument,
  deleteHousehold,
} from "../controller/householdController.js";

const router = express.Router();

// --- Standard Household Routes ---
router.get("/", authMiddleware, listHouseholds);
router.post("/", authMiddleware, createHousehold);
router.get("/:householdId", authMiddleware, getHousehold);
router.put("/:householdId", authMiddleware, updateHousehold);
router.post("/:householdId/submit", authMiddleware, submitHousehold);
router.delete("/:householdId", authMiddleware, deleteHousehold);

// --- Change Request (The fix for your 404/500 errors) ---
router.post("/:id/change-requests", authMiddleware, submitDeleteRequest);

// --- Documents ---
router.post(
  "/:householdId/documents",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);

export default router;