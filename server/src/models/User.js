import mongoose from "mongoose";
import { USER, ADMIN } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    phone: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    roles: { type: [String], default: [USER], enum: [USER, ADMIN] },
    profileImageUrl: { type: String, default: "" },

    citizenshipImageUrl: { type: String, default: "" },
    citizenshipImageHash: {
      type: String,
      unique: true,
      sparse: true,
    },

    isVerified: { type: Boolean, default: false },

    // OTP fields
    verificationCode: { type: String, default: null },
    verificationCodeExpiryTime: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);