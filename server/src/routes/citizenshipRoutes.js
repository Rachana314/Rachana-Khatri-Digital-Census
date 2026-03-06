import express from "express";
import authMiddleware from "../middleware/authMiddleWare.js";
import VerifiedCitizen from "../models/VerifiedCitizen.js";

const router = express.Router();

function normalize(v) {
  return String(v || "")
    .trim()
    .replace(/[‐-‒–—−]/g, "-")
    .replace(/\s+/g, "");
}

// same validation as model (keep consistent)
function isValidNepalCitizenship(v) {
  const s = normalize(v);
  if (!/^[0-9/-]+$/.test(s)) return false;

  const rA = /^\d{2}-\d{2}-\d{5}(\/\d{3})?$/;
  const rB = /^\d{2}-\d{2}-\d{2}-\d{5}(\/\d{3})?$/;
  const rA2 = /^\d{2}\/\d{2}\/\d{5}(\/\d{3})?$/;
  const rB2 = /^\d{2}\/\d{2}\/\d{2}\/\d{5}(\/\d{3})?$/;

  return rA.test(s) || rB.test(s) || rA2.test(s) || rB2.test(s);
}

router.get("/verify/:citizenshipNo", authMiddleware, async (req, res) => {
  try {
    const citizenshipNo = normalize(req.params.citizenshipNo);

    if (!isValidNepalCitizenship(citizenshipNo)) {
      return res.status(400).json({ verified: false, message: "Invalid format" });
    }

    const found = await VerifiedCitizen.findOne({ citizenshipNo }).lean();
    if (!found) {
      return res.status(404).json({
        verified: false,
        message: "Citizenship number not found in verified government records.",
      });
    }

    return res.json({ verified: true, citizen: { citizenshipNo, fullName: found.fullName } });
  } catch (err) {
    return res.status(500).json({ verified: false, message: err.message || "Server error" });
  }
});

export default router;