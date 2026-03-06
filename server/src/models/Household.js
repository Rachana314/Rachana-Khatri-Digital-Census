import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, default: null },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    maritalStatus: { type: String, default: "Single" },
    education: { type: String, default: "" },
    occupation: { type: String, default: "" },
    disability: { type: Boolean, default: false },
    disabilityDetail: { type: String, default: "" },
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    type: { type: String, default: "Photo" },
    url: { type: String, required: true },
    hash: { type: String, default: "" },
    originalName: { type: String, default: "" },
    mime: { type: String, default: "" },
    size: { type: Number, default: 0 },
  },
  { _id: false }
);

const HouseholdSchema = new mongoose.Schema(
  {
    householdId: { type: String, unique: true, index: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    ward: { type: String, required: true },
    address: { type: String, required: true },

    members: { type: [MemberSchema], default: [] },
    documents: { type: [DocumentSchema], default: [] },

    status: {
      type: String,
      enum: ["draft", "submitted", "rejected", "verified"],
      default: "draft",
    },

    rejectionReason: { type: String, default: "" },
    locked: { type: Boolean, default: false },

    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },

    qrCodeData: { type: String, default: "" },
  },
  { timestamps: true }
);

HouseholdSchema.index({ "documents.hash": 1 }, { unique: true, sparse: true });

HouseholdSchema.pre("validate", function () {
  if (!this.householdId) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.householdId = `HH-${rand}`;
  }
});

export default mongoose.model("Household", HouseholdSchema);