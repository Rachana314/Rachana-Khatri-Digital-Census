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
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Invalid email address",
      },
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    roles: {
      type: [String],
      default: [USER],
      enum: [USER, ADMIN],
    },

    profileImageUrl: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
      default: null,
    },

    verificationCodeExpiryTime: {
      type: Number,
      default: null,
    },

    resetPasswordCode: {
      type: String,
      default: null,
    },

    resetPasswordCodeExpiryTime: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);