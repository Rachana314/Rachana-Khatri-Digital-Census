import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      required: true,
    },
    type: {
      type: String,
      enum: ["delete_member", "add_newborn"],
      required: true,
    },
    memberIndex: {
      type: Number,
    },
    newbornData: {
      name: String,
      gender: String,
      dob: String,
    },
    note: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Note the matching name: requestSchema
export default mongoose.model("Request", requestSchema);