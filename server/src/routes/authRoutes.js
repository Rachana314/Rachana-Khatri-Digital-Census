import express from "express";
import {
  register,
  login,
  generateEmailOtp,
  verifyEmailOtp,
} from "../controller/authController.js";

const router = express.Router();

//  USER 
router.post("/user/register", register);
router.post("/user/login", login);
router.post("/user/request-otp", generateEmailOtp);
router.post("/user/verify-otp", verifyEmailOtp);

//  ADMIN 

router.post("/admin/register", register);
router.post("/admin/login", login);
router.post("/admin/request-otp", generateEmailOtp);
router.post("/admin/verify-otp", verifyEmailOtp);

export default router;
