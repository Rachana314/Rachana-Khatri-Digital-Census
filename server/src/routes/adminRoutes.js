import express from "express";
import authMiddleware from "../middleware/authMiddleWare.js";
import adminMiddleware from "../middleware/adminMiddleWare.js";
import {
  adminListHouseholds,
  adminVerifyHousehold,
  adminRejectHousehold,
  adminProgress,
} from "../controller/adminController.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/households", adminListHouseholds);
router.patch("/households/:id/verify", adminVerifyHousehold);
router.patch("/households/:id/reject", adminRejectHousehold);
router.get("/progress", adminProgress);

export default router;
