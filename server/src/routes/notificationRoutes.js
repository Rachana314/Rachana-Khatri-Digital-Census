import express from "express";
import authMiddleware from "../middleware/authMiddleWare.js";
import {
  listNotifications,
  getNotificationCount,
  markRead,
  markUnread,
  markAllRead,
  deleteNotification,
  deleteAllRead,
} from "../controller/notificationController.js";

const router = express.Router();

router.get("/",          authMiddleware, listNotifications);       // GET all notifications
router.get("/count",     authMiddleware, getNotificationCount);    // GET total + unread count
router.patch("/:id/read",   authMiddleware, markRead);            // PATCH mark one read
router.patch("/:id/unread", authMiddleware, markUnread);          // PATCH mark one unread
router.patch("/read-all",   authMiddleware, markAllRead);         // PATCH mark all read
router.delete("/read",      authMiddleware, deleteAllRead);       // DELETE all read
router.delete("/:id",       authMiddleware, deleteNotification);  // DELETE one

export default router;