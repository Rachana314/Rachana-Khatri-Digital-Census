import dotenv from "dotenv";
dotenv.config();

const config = {
  appUrl: process.env.APP_URL || "http://localhost:5000",
  port: process.env.PORT || 5000,

  mongoDBUrl: process.env.MONGO_URI || "",

  name: process.env.NAME || "Digital Census Platform",
  version: process.env.VERSION || "1.0.0",

  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",


  smtpEmail: process.env.SMTP_EMAIL || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",

  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 10,

  env: process.env.NODE_ENV || "development",
};

export default config;
