import express from "express";
import authMiddleware from "../middleware/authMiddleWare.js";
import adminMiddleWare from "../middleware/adminMiddleWare.js";
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
  getHouseholdMapData,
} from "../controller/householdController.js";

const router = express.Router();

router.get("/admin/map-data", adminMiddleWare, getHouseholdMapData);

router.get("/", authMiddleware, listHouseholds);
router.post("/", authMiddleware, createHousehold);
router.get("/:householdId", authMiddleware, getHousehold);
router.put("/:householdId", authMiddleware, updateHousehold);
router.post("/:householdId/submit", authMiddleware, submitHousehold);
router.delete("/:householdId", authMiddleware, deleteHousehold);
router.post("/:id/change-requests", authMiddleware, submitDeleteRequest);
router.post("/:householdId/documents", authMiddleware, upload.single("file"), uploadDocument);

export default router;