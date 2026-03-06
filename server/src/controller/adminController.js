import Household from "../models/Household.js";
import Notification from "../models/Notification.js";

// ADMIN: LIST ALL HOUSEHOLDS
export async function adminListHouseholds(req, res) {
  try {
    const { status, ward, search } = req.query;

    const filter = {};

    if (status && status.trim()) {
      filter.status = status.trim();
    }

    if (ward && ward.trim()) {
      filter.ward = ward.trim();
    }

    if (search && search.trim()) {
      const keyword = search.trim();

      filter.$or = [
        { householdId: { $regex: keyword, $options: "i" } },
        { address: { $regex: keyword, $options: "i" } },
        { ward: { $regex: keyword, $options: "i" } },
        { "members.name": { $regex: keyword, $options: "i" } },
      ];
    }

    const items = await Household.find(filter)
      .populate("user", "name email")
      .populate("verifiedBy", "name email")
      .sort({ updatedAt: -1 });

    return res.json(items);
  } catch (err) {
    console.error("🔥 adminListHouseholds:", err.message);
    return res.status(500).json({
      message: err.message || "Failed to list households",
    });
  }
}

// ADMIN: GET SINGLE HOUSEHOLD
export async function adminGetHouseholdById(req, res) {
  try {
    const item = await Household.findById(req.params.id)
      .populate("user", "name email")
      .populate("verifiedBy", "name email");

    if (!item) {
      return res.status(404).json({
        message: "Household not found",
      });
    }

    return res.json(item);
  } catch (err) {
    console.error("🔥 adminGetHouseholdById:", err.message);
    return res.status(500).json({
      message: err.message || "Failed to fetch household",
    });
  }
}

// ADMIN: VERIFY HOUSEHOLD
export async function adminVerifyHousehold(req, res) {
  try {
    const item = await Household.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Household not found",
      });
    }

    if (item.status === "verified") {
      return res.status(400).json({
        message: "Household is already verified",
      });
    }

    item.status = "verified";
    item.locked = true;
    item.rejectionReason = "";
    item.verifiedBy = req.user._id;
    item.verifiedAt = new Date();

    await item.save();

    await Notification.create({
      user: item.user,
      type: "form",
      title: "Household Verified",
      msg: `Your household form ${item.householdId} has been verified.`,
    });

    return res.json({
      message: "Household verified successfully",
      item,
    });
  } catch (err) {
    console.error("🔥 adminVerifyHousehold:", err.message);
    return res.status(500).json({
      message: err.message || "Failed to verify household",
    });
  }
}

// ADMIN: REJECT HOUSEHOLD
export async function adminRejectHousehold(req, res) {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const item = await Household.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Household not found",
      });
    }

    if (item.status === "verified") {
      return res.status(400).json({
        message: "Verified household cannot be rejected",
      });
    }

    item.status = "rejected";
    item.locked = false;
    item.rejectionReason = reason.trim();
    item.verifiedBy = null;
    item.verifiedAt = null;

    await item.save();

    await Notification.create({
      user: item.user,
      type: "form",
      title: "Household Rejected",
      msg: `Your household form ${item.householdId} was rejected. Reason: ${reason.trim()}`,
    });

    return res.json({
      message: "Household rejected successfully",
      item,
    });
  } catch (err) {
    console.error("🔥 adminRejectHousehold:", err.message);
    return res.status(500).json({
      message: err.message || "Failed to reject household",
    });
  }
}

// ADMIN: REQUEST CORRECTION
export async function adminRequestCorrection(req, res) {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Correction reason is required",
      });
    }

    const item = await Household.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Household not found",
      });
    }

    if (item.status === "verified") {
      return res.status(400).json({
        message: "Verified household cannot be sent for correction",
      });
    }

    item.status = "correction_required";
    item.locked = false;
    item.rejectionReason = reason.trim();
    item.verifiedBy = null;
    item.verifiedAt = null;

    await item.save();

    await Notification.create({
      user: item.user,
      type: "form",
      title: "Correction Required",
      msg: `Your household form ${item.householdId} needs correction. Reason: ${reason.trim()}`,
    });

    return res.json({
      message: "Correction requested successfully",
      item,
    });
  } catch (err) {
    console.error("🔥 adminRequestCorrection:", err.message);
    return res.status(500).json({
      message: err.message || "Failed to request correction",
    });
  }
}

// ADMIN: PROGRESS / STATS
export async function adminProgress(req, res) {
  try {
    const [total, draft, submitted, correction_required, rejected, verified] =
      await Promise.all([
        Household.countDocuments(),
        Household.countDocuments({ status: "draft" }),
        Household.countDocuments({ status: "submitted" }),
        Household.countDocuments({ status: "correction_required" }),
        Household.countDocuments({ status: "rejected" }),
        Household.countDocuments({ status: "verified" }),
      ]);

    return res.json({
      total,
      draft,
      submitted,
      correction_required,
      rejected,
      verified,
    });
  } catch (err) {
    console.error("🔥 adminProgress:", err.message);
    return res.status(500).json({
      message: err.message || "Failed to fetch progress",
    });
  }
}