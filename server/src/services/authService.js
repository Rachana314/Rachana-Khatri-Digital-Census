import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import config from "../config/config.js";

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.smtpEmail,
    pass: config.smtpPassword,
  },
});

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail(to, otp, subject = "Digital Census OTP") {
  await transporter.sendMail({
    from: config.smtpEmail,
    to,
    subject,
    text: `Your OTP is: ${otp}\nThis OTP expires in ${config.otpExpiryMinutes} minutes.`,
  });
}

// REQUEST EMAIL VERIFICATION OTP
export async function generateEmailOtp(email) {
  if (!email) {
    const err = new Error("Email is required");
    err.statusCode = 400;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const otp = makeOtp();
  const expiryTime = Date.now() + config.otpExpiryMinutes * 60 * 1000;

  user.verificationCode = otp;
  user.verificationCodeExpiryTime = expiryTime;
  await user.save();

  try {
    await sendOtpEmail(user.email, otp, "Digital Census Email Verification OTP");
    return { message: "OTP sent to email" };
  } catch (e) {
    console.log("⚠️ Email send failed. DEV OTP:", otp);
    return { message: "Email failed, using devOtp", devOtp: otp };
  }
}

// VERIFY EMAIL OTP
export async function verifyEmailOtp(email, verificationCode) {
  if (!email || !verificationCode) {
    const err = new Error("Email and OTP are required");
    err.statusCode = 400;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  if (!user.verificationCode || !user.verificationCodeExpiryTime) {
    const err = new Error("No OTP requested");
    err.statusCode = 400;
    throw err;
  }

  if (Date.now() > user.verificationCodeExpiryTime) {
    const err = new Error("OTP expired");
    err.statusCode = 400;
    throw err;
  }

  if (String(user.verificationCode) !== String(verificationCode)) {
    const err = new Error("Invalid OTP");
    err.statusCode = 400;
    throw err;
  }

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpiryTime = null;
  await user.save();

  return { message: "Email verified successfully" };
}

// FORGOT PASSWORD - SEND RESET OTP
export async function forgotPassword(email) {
  if (!email) {
    const err = new Error("Email is required");
    err.statusCode = 400;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const otp = makeOtp();
  const expiryTime = Date.now() + config.otpExpiryMinutes * 60 * 1000;

  user.resetPasswordCode = otp;
  user.resetPasswordCodeExpiryTime = expiryTime;
  await user.save();

  try {
    await sendOtpEmail(user.email, otp, "Digital Census Password Reset OTP");
    return { message: "Password reset OTP sent to email" };
  } catch (e) {
    console.log("⚠️ Password reset email failed. DEV OTP:", otp);
    return { message: "Email failed, using devOtp", devOtp: otp };
  }
}

// RESET PASSWORD WITH OTP
export async function resetPassword(email, otp, newPassword, confirmPassword) {
  if (!email || !otp || !newPassword || !confirmPassword) {
    const err = new Error("All fields are required");
    err.statusCode = 400;
    throw err;
  }

  if (newPassword !== confirmPassword) {
    const err = new Error("Passwords do not match");
    err.statusCode = 400;
    throw err;
  }

  if (newPassword.length < 8) {
    const err = new Error("Password must be at least 8 characters");
    err.statusCode = 400;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  if (!user.resetPasswordCode || !user.resetPasswordCodeExpiryTime) {
    const err = new Error("No reset OTP requested");
    err.statusCode = 400;
    throw err;
  }

  if (Date.now() > user.resetPasswordCodeExpiryTime) {
    const err = new Error("OTP expired");
    err.statusCode = 400;
    throw err;
  }

  if (String(user.resetPasswordCode) !== String(otp)) {
    const err = new Error("Invalid OTP");
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordCode = null;
  user.resetPasswordCodeExpiryTime = null;

  await user.save();

  return { message: "Password reset successful" };
}