import mongoose from "mongoose";
import { USER, ADMIN } from "../constants/roles.js";

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"], trim: true },

  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Invalid email address",
    },
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
  },

  roles: {
    type: [String],
    default: [USER],
    enum: [USER, ADMIN],
  },

  profileImageUrl: { type: String, default: "" },

  isVerified: { type: Boolean, default: false },

  verificationCode: { type: String },
  verificationCodeExpiryTime: { type: Number },

  createdAt: { type: Date, default: Date.now, immutable: true },
});

export default mongoose.model("User", userSchema);
