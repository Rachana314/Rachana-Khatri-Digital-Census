// server/src/models/User.js
import mongoose from "mongoose";
import { USER, ADMIN } from "../constants/roles.js";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Invalid email address",
    },
  },

  password: { type: String, required: true, minlength: 8 },

  // ✅ keep roles array (better than single role)
  roles: { type: [String], default: [USER], enum: [USER, ADMIN] },

  profileImageUrl: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },

  verificationCode: String,
  verificationCodeExpiryTime: Number,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
