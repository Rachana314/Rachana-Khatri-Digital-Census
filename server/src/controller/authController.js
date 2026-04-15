import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";
import { USER, ADMIN } from "../constants/roles.js";
import { sendWelcomeEmail } from "../utils/sendEmailOtp.js";
import {
  generateEmailOtp as generateEmailOtpService,
  verifyEmailOtp as verifyEmailOtpService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from "../services/authService.js";

function buildUserResponse(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
    profileImageUrl: user.profileImageUrl,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function createToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      roles: user.roles,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export async function register(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Name, email, phone, and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const existingPhone = await User.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      return res.status(400).json({
        message: "Phone already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "digitalcensus4@gmail.com";

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      roles: normalizedEmail === ADMIN_EMAIL ? [ADMIN] : [USER], // ✅ Fixed
    });

    sendWelcomeEmail(user.email, user.name);

    return res.status(201).json({
      message: "Registration successful. Please verify your email with OTP.",
      user: buildUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "digitalcensus4@gmail.com";
    if (req.path.includes("admin") && normalizedEmail !== ADMIN_EMAIL) {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: buildUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function generateEmailOtp(req, res, next) {
  try {
    const result = await generateEmailOtpService(req.body.email);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailOtp(req, res, next) {
  try {
    const result = await verifyEmailOtpService(
      req.body.email,
      req.body.verificationCode
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const result = await forgotPasswordService(req.body.email);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const result = await resetPasswordService(
      req.body.email,
      req.body.otp,
      req.body.newPassword,
      req.body.confirmPassword
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}