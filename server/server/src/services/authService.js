import nodemailer from "nodemailer";
import User from "../models/User.js";
import config from "../config/config.js";

// ✅ Gmail transporter using App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.smtpEmail,
    pass: config.smtpPassword,
  },
});

// ✅ 6-digit OTP
function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ✅ send mail
async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: config.smtpEmail,
    to,
    subject: "Digital Census OTP",
    text: `Your OTP is: ${otp}\nThis OTP expires in ${config.otpExpiryMinutes} minutes.`,
  });
}

// ✅ REQUEST OTP
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

  // ✅ Try sending real email
  try {
    await sendOtpEmail(user.email, otp);
    return { message: "OTP sent to email" };
  } catch (e) {
    // ✅ Dev fallback (so register still works even if Gmail blocks)
    console.log("⚠️ Email send failed. DEV OTP:", otp);
    return { message: "Email failed, using devOtp", devOtp: otp };
  }
}

// ✅ VERIFY OTP
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
