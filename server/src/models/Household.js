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
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    ward: { type: String, required: true },
    address: { type: String, required: true },

    members: { type: [MemberSchema], default: [] },
    documents: { type: [DocumentSchema], default: [] },

    status: { type: String, enum: ["draft", "submitted", "rejected", "verified"], default: "draft" },
    rejectionReason: { type: String, default: "" },

    qrCodeData: { type: String, default: "" },
  },
  { timestamps: true }
);

HouseholdSchema.pre("save", function (next) {
  if (!this.householdId) {
    this.householdId = "HH-" + Math.floor(10000 + Math.random() * 90000);
  }
  next();
});

export default mongoose.model("Household", HouseholdSchema);
