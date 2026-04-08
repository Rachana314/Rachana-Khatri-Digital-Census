import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    age: { type: Number, default: null },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    maritalStatus: { type: String, default: "Single" },
    education: { type: String, default: "" },
    occupation: { type: String, default: "" },
    disability: { type: Boolean, default: false },
    disabilityDetail: { type: String, default: "" },
    // --- ADDED THIS ---
    photo: { type: String, default: "" }, 
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      // --- ADDED "MemberPhoto" TO ENUM ---
      enum: ["Citizenship", "Birth Certificate", "License", "Photo", "MemberPhoto"],
      required: true,
    },
    url: { type: String, required: true },
    originalName: { type: String, default: "" },
    fileHash: { 
      type: String, 
      required: true, 
      index: true,
      sparse: true 
    }, 
  },
  { _id: false }
);

// ... (Rest of HouseholdSchema and Pre-validate stay the same)

const HouseholdSchema = new mongoose.Schema(
  {
    householdId: {
      type: String,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    ward: { type: String, required: true },
    address: { type: String, required: true },

    members: { type: [MemberSchema], default: [] },
    documents: { type: [DocumentSchema], default: [] },

    status: {
      type: String,
      enum: ["draft", "submitted", "correction_required", "rejected", "verified"],
      default: "draft",
    },

    rejectionReason: { type: String, default: "" },
    locked: { type: Boolean, default: false },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: { type: Date, default: null },

    qrCodeData: { type: String, default: "" },
  },
  { timestamps: true }
);

HouseholdSchema.pre("validate", function () {
  if (!this.householdId) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.householdId = `HH-${Date.now()}-${rand}`;
  }
});

export default mongoose.model("Household", HouseholdSchema);