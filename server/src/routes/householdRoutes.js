import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
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
router.use((req, res, next) => {
  console.log("✅ householdRoutes HIT:", req.method, req.originalUrl);
  next();
});


router.get("/", authMiddleware, listHouseholds);
router.post("/", authMiddleware, createHousehold);
router.get("/:householdId", authMiddleware, getHousehold);
router.put("/:householdId", authMiddleware, updateHousehold);
router.post("/:householdId/submit", authMiddleware, submitHousehold);


// IMPORTANT: frontend must send FormData with "file" + "type"
router.post(
  "/:householdId/documents",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);

export default router;
