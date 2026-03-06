import nodemailer from "nodemailer";
import config from "../config/config.js";

export const sendEmailOtp = async (toEmail, otp) => {
  if (!config.smtpEmail || !config.smtpPassword) {
    throw new Error("SMTP_EMAIL or SMTP_PASSWORD missing in .env");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.smtpEmail,
      pass: config.smtpPassword, // App Password
    },
  });

  // verifies SMTP login (very useful)
  await transporter.verify();

  const info = await transporter.sendMail({
    from: config.smtpEmail,
    to: toEmail,
    subject: "Your verification OTP",
    text: `Your OTP is ${otp}. It will expire in ${config.otpExpiryMinutes} minutes.`,
  });

  console.log("✅ OTP email sent:", info.messageId);
  return info;
};
