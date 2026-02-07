import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";
import { USER, ADMIN } from "../constants/roles.js";
import * as authService from "../services/authService.js";

const allowedRoles = [USER, ADMIN];

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, roles: user.roles },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn || "7d" }
  );
};

// 🟢 REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, roles, profileImageUrl } = req.body;

    if (!name?.trim()) return res.status(400).json({ msg: "Name is required" });
    if (!email?.trim()) return res.status(400).json({ msg: "Email is required" });
    if (!password || password.length < 8)
      return res.status(400).json({ msg: "Password must be at least 8 characters" });

    const normalizedEmail = email.trim().toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ msg: "Email already registered" });

    let finalRoles = [USER];
    if (Array.isArray(roles) && roles.length) {
      const normalized = roles.map((r) => String(r).toUpperCase());
      const invalid = normalized.filter((r) => !allowedRoles.includes(r));
      if (invalid.length) return res.status(400).json({ msg: `Invalid role(s): ${invalid.join(", ")}` });
      finalRoles = normalized;
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      roles: finalRoles,
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

// 🔵 LOGIN
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
