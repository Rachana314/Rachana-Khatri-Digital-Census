import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";
import { USER, ADMIN } from "../constants/roles.js";
import * as authService from "../services/authService.js";

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, roles: user.roles },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn || "7d" }
  );
};

// 🟢 USER REGISTER (SECURE: cannot self-assign ADMIN)
export const register = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl } = req.body;

    if (!name?.trim()) return res.status(400).json({ msg: "Name is required" });
    if (!email?.trim()) return res.status(400).json({ msg: "Email is required" });
    if (!password || password.length < 8)
      return res.status(400).json({ msg: "Password must be at least 8 characters" });

    const normalizedEmail = email.trim().toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ msg: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    // ✅ Always USER role for normal register
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      roles: [USER],
      profileImageUrl: profileImageUrl?.trim() || "",
      isVerified: false,
    });

    // 🔹 Send OTP after register
    const otpResult = await authService.generateEmailOtp(user.email);

    return res.status(201).json({
      success: true,
      msg: "Registered successfully. OTP sent to email.",
      ...(otpResult.devOtp ? { devOtp: otpResult.devOtp } : {}),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ msg: err.message || "Server error" });
  }
};

// 🔵 USER LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) return res.status(400).json({ msg: "Email is required" });
    if (!password) return res.status(400).json({ msg: "Password is required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ msg: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({ msg: "Please verify your email first" });
    }

    const token = signToken(user);

    return res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        profileImageUrl: user.profileImageUrl,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ msg: err.message || "Server error" });
  }
};

// 🟡 REQUEST OTP AGAIN
export const generateEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.generateEmailOtp(email);

    return res.status(200).json({
      success: true,
      message: result.message,
      ...(result.devOtp ? { devOtp: result.devOtp } : {}),
    });
  } catch (error) {
    console.error("OTP error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// 🟣 VERIFY OTP
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    const result = await authService.verifyEmailOtp(email, verificationCode);

    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ✅ ADMIN REGISTER (simple + working)
export const adminRegister = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl } = req.body;

    if (!name?.trim()) return res.status(400).json({ msg: "Name is required" });
    if (!email?.trim()) return res.status(400).json({ msg: "Email is required" });
    if (!password || password.length < 8)
      return res.status(400).json({ msg: "Password must be at least 8 characters" });

    const normalizedEmail = email.trim().toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ msg: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    // ✅ Admin created as verified, and role is ADMIN
    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      roles: [ADMIN],
      profileImageUrl: profileImageUrl?.trim() || "",
      isVerified: true,
    });

    const token = signToken(admin);

    return res.status(201).json({
      msg: "Admin registered successfully",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        roles: admin.roles,
        isVerified: admin.isVerified,
      },
    });
  } catch (err) {
    console.error("Admin register error:", err);
    return res.status(500).json({ msg: err.message || "Server error" });
  }
};

// ✅ ADMIN LOGIN (only admin accounts allowed)
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) return res.status(400).json({ msg: "Email is required" });
    if (!password) return res.status(400).json({ msg: "Password is required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    const isAdmin = user.roles?.includes(ADMIN);
    if (!isAdmin) return res.status(403).json({ msg: "Not an admin account" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ msg: "Invalid credentials" });

    // Optional (admins are created verified anyway)
    if (!user.isVerified) {
      return res.status(403).json({ msg: "Admin email not verified" });
    }

    const token = signToken(user);

    return res.status(200).json({
      msg: "Admin login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        profileImageUrl: user.profileImageUrl,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ msg: err.message || "Server error" });
  }
};
