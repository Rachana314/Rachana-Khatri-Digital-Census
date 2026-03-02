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
} from "../controller/householdController.js";

const router = express.Router();

// ✅ Debug check (if this prints "undefined" then your import is wrong)
console.log("✅ authMiddleware loaded:", typeof authMiddleware, authMiddleware?.name);



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

export default router;
