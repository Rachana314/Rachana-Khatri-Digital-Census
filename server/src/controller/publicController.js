import Household from "../models/Household.js";

export async function verifyHouseholdPublic(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
    }).select(
      "householdId status ward address members rejectionReason updatedAt verifiedAt"
    );

    if (!item) {
      return res.status(404).json({
        message: "Household not found",
      });
    }

    return res.json(item);
  } catch (err) {
    console.error("🔥 verifyHouseholdPublic:", err.message);
    return res.status(500).json({
      message: err.message || "Failed to verify household",
    });
  }
}