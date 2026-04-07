import Notification from "../models/Notification.js";

// 1. LIST NOTIFICATIONS (Fixed for Admin)
export async function listNotifications(req, res) {
  try {
    // Admin sees everything; Citizens see only their own
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };

    const items = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to list notifications" });
  }
}

// 2. MARK NOTIFICATION AS READ
export async function markRead(req, res) {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update notification" });
  }
}

// 3. DELETE NOTIFICATION
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete notification" });
  }
}

// 4. CREATE NOTIFICATION (Helper for other controllers)
// Use this inside your Household controller when verifying/rejecting
export async function createNotification({ user, type, title, msg, householdId }) {
  try {
    const note = new Notification({
      user,
      type,
      title,
      msg,
      householdId, // Critical: Ensure this is passed to fix the 'undefined' error
      read: false
    });
    await note.save();
  } catch (err) {
    console.error("Notification Creation Error:", err);
  }
}