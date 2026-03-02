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
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Citizenship", "Birth Certificate", "License"], required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const HouseholdSchema = new mongoose.Schema(
  {
    householdId: { type: String, unique: true, index: true },

    // ✅ one user = one form
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

    ward: { type: String, required: true },
    address: { type: String, required: true },

    // ✅ no duplicate citizenship
    citizenshipNo: { type: String, required: true, unique: true, index: true },

    members: { type: [MemberSchema], default: [] },
    documents: { type: [DocumentSchema], default: [] },

    status: { type: String, enum: ["draft", "submitted", "rejected", "verified"], default: "draft" },
    rejectionReason: { type: String, default: "" },

    // locked will be used when admin verifies
    locked: { type: Boolean, default: false },

    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },

    qrCodeData: { type: String, default: "" },
  },
  { timestamps: true }
);

// small helper (clean citizenship format)
function normalizeCitizenship(v) {
  return String(v || "").trim().toUpperCase().replace(/\s+/g, "");
}

HouseholdSchema.pre("validate", function () {
  // ✅ normalize citizenship before saving (same value looks same)
  if (this.citizenshipNo) this.citizenshipNo = normalizeCitizenship(this.citizenshipNo);

  // ✅ generate id if missing
  if (!this.householdId) {
    // less chance of collision than only 5 digits
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.householdId = `HH-${Date.now()}-${rand}`;
  }
});

export default mongoose.model("Household", HouseholdSchema);