import Notification from "../models/Notification.js";

// 1. LIST NOTIFICATIONS
export async function listNotifications(req, res) {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const items = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to list notifications" });
  }
}

// 2. GET NOTIFICATION COUNT (total + unread)
export async function getNotificationCount(req, res) {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };

    const [total, unread] = await Promise.all([
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, read: false }),
    ]);

    return res.json({ total, unread, read: total - unread });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get notification count" });
  }
}

// 3. MARK ONE AS READ
export async function markRead(req, res) {
  try {
    const { id } = req.params;
    const filter = req.user.role === 'admin' ? { _id: id } : { _id: id, user: req.user._id };

    const updated = await Notification.findOneAndUpdate(filter, { read: true }, { new: true });
    if (!updated) return res.status(404).json({ message: "Notification not found" });

    return res.json({ success: true, notification: updated });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update notification" });
  }
}

// 4. MARK ONE AS UNREAD
export async function markUnread(req, res) {
  try {
    const { id } = req.params;
    const filter = req.user.role === 'admin' ? { _id: id } : { _id: id, user: req.user._id };

    const updated = await Notification.findOneAndUpdate(filter, { read: false }, { new: true });
    if (!updated) return res.status(404).json({ message: "Notification not found" });

    return res.json({ success: true, notification: updated });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update notification" });
  }
}

// 5. MARK ALL AS READ
export async function markAllRead(req, res) {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };

    const result = await Notification.updateMany(
      { ...filter, read: false },
      { read: true }
    );

    return res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    return res.status(500).json({ message: "Failed to mark all as read" });
  }
}

// 6. DELETE ONE NOTIFICATION
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const filter = req.user.role === 'admin' ? { _id: id } : { _id: id, user: req.user._id };

    const deleted = await Notification.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ message: "Notification not found" });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete notification" });
  }
}

// 7. DELETE ALL READ NOTIFICATIONS
export async function deleteAllRead(req, res) {
  try {
    const filter = req.user.role === 'admin' ? { read: true } : { user: req.user._id, read: true };

    const result = await Notification.deleteMany(filter);
    return res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete read notifications" });
  }
}

// 8. CREATE NOTIFICATION HELPER
export async function createNotification({ user, type, title, msg, householdId }) {
  try {
    const note = new Notification({ user, type, title, msg, read: false });
    await note.save();
  } catch (err) {
    console.error("Notification Creation Error:", err);
  }
}