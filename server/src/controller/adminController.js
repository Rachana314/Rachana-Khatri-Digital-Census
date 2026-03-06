import Household from "../models/Household.js";

// ✅ LIST + SEARCH + FILTER
export async function adminListHouseholds(req, res) {
  const { q = "", ward = "", status = "" } = req.query;

  const filter = {};
  if (ward) filter.ward = ward;
  if (status) filter.status = status;

  if (q) {
    filter.$or = [
      { householdId: { $regex: q, $options: "i" } },
      { "members.name": { $regex: q, $options: "i" } },
      { address: { $regex: q, $options: "i" } },
    ];
  }

  const items = await Household.find(filter)
    .populate("user", "name email")
    .sort({ updatedAt: -1 })
    .limit(500);

  res.json(items);
}

// ✅ VERIFY = lock
export async function adminVerifyHousehold(req, res) {
  const item = await Household.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });

  item.status = "verified";
  item.locked = true;
  item.verifiedBy = req.user._id;
  item.verifiedAt = new Date();
  item.rejectionReason = "";

  await item.save();
  res.json({ message: "Verified & locked", item });
}

// ✅ REJECT = unlock
export async function adminRejectHousehold(req, res) {
  const { reason = "" } = req.body;

  const item = await Household.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });

  item.status = "rejected";
  item.locked = false;
  item.rejectionReason = reason;

  await item.save();
  res.json({ message: "Rejected", item });
}

// ✅ PROGRESS
export async function adminProgress(req, res) {
  const [total, submitted, verified, rejected] = await Promise.all([
    Household.countDocuments({}),
    Household.countDocuments({ status: "submitted" }),
    Household.countDocuments({ status: "verified" }),
    Household.countDocuments({ status: "rejected" }),
  ]);

  res.json({ total, submitted, verified, rejected });
}
