import express from "express";
import authMiddleware from "../middleware/authMiddleWare.js";
import { listNotifications } from "../controller/notificationController.js";

const router = express.Router();

router.get("/", authMiddleware, listNotifications);

export default router;
