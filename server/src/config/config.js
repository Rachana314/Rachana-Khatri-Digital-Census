import dotenv from "dotenv";

dotenv.config();

const config = {
  appUrl: process.env.APP_URL || "http://localhost:5173",
  port: Number(process.env.PORT) || 8000,

  mongoDBUrl: process.env.MONGO_URI || "",

  name: process.env.NAME || "Digital Census Platform",
  version: process.env.VERSION || "1.0.0",

  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // smtpEmail: process.env.SMTP_EMAIL || "",
  // smtpPassword: process.env.SMTP_PASSWORD || "",

  sendGridApiKey: process.env.SEND_GRID || "",
  emailFrom: process.env.EMAIL_FROM || "",

  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 10,

  env: process.env.NODE_ENV || "development",
};

if (!config.mongoDBUrl) {
  throw new Error("MONGO_URI is missing in .env");
}

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET is missing in .env");
}

export default config;
