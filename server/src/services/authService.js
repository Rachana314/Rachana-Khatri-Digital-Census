import User from "../models/User.js";
import { sendEmailOtp } from "../utils/sendEmailOtp.js";
import config from "../config/config.js";

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const create4DigitOtp = () => String(Math.floor(1000 + Math.random() * 9000));

// 🔹 Generate OTP
export const generateEmailOtp = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) throw new AppError("Email is required", 400);

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw new AppError("User not found. Register first.", 404);

  if (user.isVerified) {
    return { message: "Email is already verified" };
  }

  const otp = create4DigitOtp();
  const expiryMs = Date.now() + config.otpExpiryMinutes * 60 * 1000;

  user.verificationCode = otp;
  user.verificationCodeExpiryTime = expiryMs;
  await user.save();

  await sendEmailOtp(user.email, otp);

  const isDev = config.env !== "production";
  return {
    message: "OTP sent to email",
    ...(isDev ? { devOtp: otp } : {}),
  };
};

// 🔹 Verify OTP
export const verifyEmailOtp = async (email, verificationCode) => {
  const normalizedEmail = normalizeEmail(email);
  const code = String(verificationCode || "").trim();

  if (!normalizedEmail) throw new AppError("Email is required", 400);
  if (!code) throw new AppError("OTP is required", 400);

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw new AppError("User not found", 404);

  if (user.isVerified) {
    return { message: "Email is already verified" };
  }

  if (!user.verificationCode || !user.verificationCodeExpiryTime) {
    throw new AppError("No OTP requested. Please request OTP first.", 400);
  }

  if (Date.now() > Number(user.verificationCodeExpiryTime)) {
    throw new AppError("OTP expired. Please request a new OTP.", 400);
  }

  if (String(user.verificationCode) !== code) {
    throw new AppError("Invalid OTP", 400);
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpiryTime = undefined;
  await user.save();

  return { message: "Email verified successfully" };
};
