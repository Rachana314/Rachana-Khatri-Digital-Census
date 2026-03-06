import express from "express";
import {
  register,
  login,
  generateEmailOtp,
  verifyEmailOtp,
  forgotPassword,
  resetPassword,
} from "../controller/authController.js";

const router = express.Router();

// USER
router.post("/user/register", register);
router.post("/user/login", login);
router.post("/user/request-otp", generateEmailOtp);
router.post("/user/verify-otp", verifyEmailOtp);
router.post("/user/forgot-password", forgotPassword);
router.post("/user/reset-password", resetPassword);

// ADMIN
router.post("/admin/register", register);
router.post("/admin/login", login);
router.post("/admin/request-otp", generateEmailOtp);
router.post("/admin/verify-otp", verifyEmailOtp);
router.post("/admin/forgot-password", forgotPassword);
router.post("/admin/reset-password", resetPassword);

export default router;