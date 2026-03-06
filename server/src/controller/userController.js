import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Household from "../models/Household.js";

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const household = await Household.findOne({ user: req.user._id })
      .select("householdId status createdAt updatedAt rejectionReason")
      .sort({ updatedAt: -1 });

    return res.json({ user, household: household || null });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Failed to load profile" });
  }
}

export async function updateMe(req, res) {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();

    await user.save();

    const safe = user.toObject();
    delete safe.password;

    return res.json({ message: "Profile updated", user: safe });
  } catch (e) {
    if (e?.code === 11000 && e.keyPattern?.phone) {
      return res.status(409).json({ message: "Phone number already in use" });
    }
    return res.status(500).json({ message: e.message || "Failed to update profile" });
  }
}

export async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Old password is wrong" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Failed to change password" });
  }
}

export async function uploadAvatar(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const url = `http://localhost:5000/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profileImageUrl: url } },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Avatar updated", profileImageUrl: user.profileImageUrl, user });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Failed to upload avatar" });
  }
}