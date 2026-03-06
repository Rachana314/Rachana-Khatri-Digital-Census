import Notification from "../models/Notification.js";

export async function listNotifications(req, res) {
  try {
    const items = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to list notifications" });
  }
}
