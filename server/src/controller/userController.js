import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Household from "../models/Household.js";
import Request from "../models/Request.js";
import Notification from "../models/Notification.js";

// FIXED: Handles census change requests and creates the correct notification for the admin
export const submitDeleteRequest = async (req, res) => {
  try {
    const { id } = req.params; // Can be MongoDB _id OR the 'HH-...' id
    const { type, memberIndex, note, newborn } = req.body;

    // 1. FIND the actual household first to get its real Database _id
    const household = await Household.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, 
        { householdId: id }
      ]
    });

    if (!household) {
      return res.status(404).json({ success: false, message: "Household not found" });
    }

    // 2. Create the Request document using the REAL database _id
    const newRequest = new Request({
      user: req.user._id,
      householdId: household._id, 
      type: type,
      memberIndex: type === "delete_member" ? Number(memberIndex) : undefined,
      newbornData: type === "add_newborn" ? newborn : undefined,
      note: note,
      status: "pending",
    });

    await newRequest.save();

    // 3. Notify Admin - UPDATED: Added householdId and title to match your frontend
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      await Notification.create({
        user: adminUser._id,
        householdId: household._id, // Required for the "Go to Household" button
        type: "change_request",
        title: "New Census Change Request",
        msg: `User ${req.user.name} submitted a ${type.replace("_", " ")} request for Household #${household.householdId}.`,
      });
    }

    res.status(201).json({ 
      success: true, 
      message: "Request sent to admin successfully!" 
    });
  } catch (error) {
    console.error("Request Error:", error);
    const msg = error.name === 'CastError' ? "Invalid ID format" : error.message;
    res.status(500).json({ success: false, message: msg });
  }
};

// get my profile + my household form summary
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const household = await Household.findOne({ user: req.user._id })
      .select(
        "householdId status createdAt updatedAt rejectionReason qrCodeData ward address members documents"
      )
      .sort({ updatedAt: -1 });

    return res.json({
      user,
      household: household || null,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Failed to load profile",
    });
  }
}

// update basic profile info
export async function updateMe(req, res) {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();

    await user.save();

    const safeUser = await User.findById(req.user._id).select("-password");

    return res.json({
      message: "Profile updated",
      user: safeUser,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Failed to update profile",
    });
  }
}

// change password
export async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Old password is wrong" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Failed to change password",
    });
  }
}

/// upload profile photo
export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Use findByIdAndUpdate to bypass specific field requirements (like 'phone')
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        profileImageUrl: `${process.env.SERVER_BASE_URL || "http://localhost:8000"}/uploads/${req.file.filename}`
      },
      { 
        new: true,            // Returns the updated document
        runValidators: false  // Fixes the "phone is required" error
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Profile photo updated successfully",
      user: updatedUser,
    });
  } catch (e) {
    console.error("uploadAvatar error:", e);
    return res.status(500).json({
      message: e.message || "Failed to upload avatar",
    });
  }
}