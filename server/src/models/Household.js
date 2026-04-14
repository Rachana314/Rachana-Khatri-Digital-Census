import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    age: { type: Number, default: null },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    maritalStatus: { type: String, default: "Single" },
    education: { type: String, default: "" },
    occupation: { type: String, default: "" },
    disability: { type: Boolean, default: false },
    disabilityDetail: { type: String, default: "" },
    photo: { type: String, default: "" },
    citizenshipId: { type: String, default: "" },  // ✅ NEW
    docType: { type: String, default: "" },         // ✅ NEW
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      // ✅ Fixed: added BirthCertificate (no space) to match what frontend sends
      enum: [
        "Citizenship",
        "BirthCertificate",
        "Birth Certificate",
        "License",
        "Photo",
        "MemberPhoto",
      ],
      required: true,
    },
    url: { type: String, required: true },
    originalName: { type: String, default: "" },
    fileHash: { type: String, required: true, index: true, sparse: true },
    memberName: { type: String, default: "" }, // ✅ NEW — links doc to member
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
    },
    ward: { type: String, required: true },
    address: { type: String, required: true },
    members: { type: [MemberSchema], default: [] },
    documents: { type: [DocumentSchema], default: [] },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "correction_required",
        "rejected",
        "verified",
      ],
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
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

HouseholdSchema.pre("validate", function () {
  if (!this.householdId) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.householdId = `HH-${Date.now()}-${rand}`;
  }
});

HouseholdSchema.index({ location: "2dsphere" });

export default mongoose.model("Household", HouseholdSchema);