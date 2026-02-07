import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { listNotifications, markRead } from "../controller/notificationController.js";

const router = express.Router();

router.get("/", authMiddleware, listNotifications);
router.patch("/:id/read", authMiddleware, markRead);

export default router;
