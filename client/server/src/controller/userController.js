import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Household from "../models/Household.js";

// get my profile + my household form summary
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // user can only have 1 household, so fetch one
    const household = await Household.findOne({ user: req.user._id })
      .select("householdId status createdAt updatedAt rejectionReason")
      .sort({ updatedAt: -1 });

    return res.json({
      user,
      household: household || null,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Failed to load profile" });
  }
}

// update basic profile info
export async function updateMe(req, res) {
  try {
    const { fullName, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();
    return res.json({ message: "Profile updated", user: user.toObject({ getters: true }) });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Failed to update profile" });
  }
}

// change password
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

// upload profile photo (avatar)
export async function uploadAvatar(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    await user.save();

    return res.json({ message: "Avatar updated", avatarUrl: user.avatarUrl });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Failed to upload avatar" });
  }
}