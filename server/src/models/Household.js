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
    type: {
      type: String,
      enum: ["Citizenship", "Birth Certificate", "License"],
      required: true,
    },
    url: { type: String, required: true },
  },
  { _id: false }
);

// ✅ normalize
function normalizeCitizenship(v) {
  return String(v || "").trim().toUpperCase().replace(/\s+/g, "");
}

// ✅ Nepal citizenship format checker (simple + strict)
function isValidNepalCitizenship(v) {
  const s = normalizeCitizenship(v);

  // only digits + '-' + '/'
  if (!/^[0-9/-]+$/.test(s)) return false;

  // Examples:
  // 12-01-12345
  // 12/01/12345
  // 12-01-12345/066
  // 12/01/12345/066
  const r1 = /^\d{1,3}[-/]\d{1,3}[-/]\d{1,8}$/;
  const r2 = /^\d{1,3}[-/]\d{1,3}[-/]\d{1,8}[-/]\d{1,4}$/;

  if (!(r1.test(s) || r2.test(s))) return false;

  // length safety
  if (s.length < 8 || s.length > 25) return false;

  return true;
}

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

    citizenshipNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
      validate: {
        validator: (v) => isValidNepalCitizenship(v),
        message:
          "Invalid citizenship number. Example: 12-01-12345 or 12-01-12345/066",
      },
    },

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

HouseholdSchema.pre("validate", function () {
  if (this.citizenshipNo) this.citizenshipNo = normalizeCitizenship(this.citizenshipNo);

  if (!this.householdId) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.householdId = `HH-${Date.now()}-${rand}`;
  }
});

export default mongoose.model("Household", HouseholdSchema);