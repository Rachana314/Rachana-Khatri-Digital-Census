import express from "express";
import authMiddleware from "../middleware/authMiddleWare.js"; // This is your imported name
import { upload } from "../middleware/upload.js";
import {
  getMe,
  updateMe,
  changePassword,
  uploadAvatar,
  submitDeleteRequest,
} from "../controller/userController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.post("/change-password", authMiddleware, changePassword);
router.post("/avatar", authMiddleware, upload.single("file"), uploadAvatar);

// FIXED: Changed 'protect' to 'authMiddleware' to match your import at the top
router.post("/:id/change-requests", authMiddleware, submitDeleteRequest);

export default router;