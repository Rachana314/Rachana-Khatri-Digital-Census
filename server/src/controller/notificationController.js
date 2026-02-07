import Notification from "../models/Notification.js";

export async function listNotifications(req, res) {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
}

export async function markRead(req, res) {
  const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!n) return res.status(404).json({ message: "Not found" });
  n.read = true;
  await n.save();
  res.json(n);
}
