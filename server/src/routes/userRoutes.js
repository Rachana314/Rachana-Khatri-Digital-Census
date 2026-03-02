import express from "express";
import authMiddleware from "../middleware/authMiddleWare.js";
import { upload } from "../middleware/upload.js";

import { getMe, updateMe, changePassword, uploadAvatar } from "../controller/userController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);

router.post("/change-password", authMiddleware, changePassword);

router.post("/avatar", authMiddleware, upload.single("file"), uploadAvatar);

export default router;