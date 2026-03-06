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
} from "../controller/adminController.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/households", adminListHouseholds);
router.get("/households/:id", adminGetHouseholdById);
router.patch("/households/:id/verify", adminVerifyHousehold);
router.patch("/households/:id/reject", adminRejectHousehold);
router.patch("/households/:id/correction", adminRequestCorrection);
router.get("/progress", adminProgress);

export default router;