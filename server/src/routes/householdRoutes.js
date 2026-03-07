import express from "express";
import authMiddleware from "../middleware/authMiddleWare.js";
import { upload } from "../middleware/upload.js";

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

router.get("/", authMiddleware, listHouseholds);

router.post("/", authMiddleware, createHousehold);

router.get("/:householdId", authMiddleware, getHousehold);

router.put("/:householdId", authMiddleware, updateHousehold);

router.post("/:householdId/submit", authMiddleware, submitHousehold);

router.post(
  "/:householdId/documents",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);

router.delete("/:householdId", authMiddleware, deleteHousehold);

export default router;

