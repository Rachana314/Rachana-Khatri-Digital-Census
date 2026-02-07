import express from "express";
import { register, login, generateEmailOtp, verifyEmailOtp } from "../controller/authController.js";

const router = express.Router();

router.post("/user/register", register);
router.post("/user/login", login);

router.post("/user/request-otp", generateEmailOtp);
router.post("/user/verify-otp", verifyEmailOtp);

export default router;
