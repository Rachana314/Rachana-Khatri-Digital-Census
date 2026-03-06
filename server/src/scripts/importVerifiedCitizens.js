import "dotenv/config";
import mongoose from "mongoose";
import VerifiedCitizen from "../models/VerifiedCitizen.js";

const normalize = (v) =>
  String(v || "").trim().replace(/[‐-‒–—−]/g, "-").replace(/\s+/g, "");

const data = [
  { citizenshipNo: "05-02-79-01606", fullName: "Test Citizen" },
  // add many here or load from file/csv
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const row of data) {
    await VerifiedCitizen.updateOne(
      { citizenshipNo: normalize(row.citizenshipNo) },
      { $set: { ...row, citizenshipNo: normalize(row.citizenshipNo) } },
      { upsert: true }
    );
  }

  console.log("✅ Imported verified citizens:", data.length);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});