import mongoose from "mongoose";

const VerifiedCitizenSchema = new mongoose.Schema(
  {
    citizenshipNo: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, default: "" },
    dob: { type: Date },
    district: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("VerifiedCitizen", VerifiedCitizenSchema);