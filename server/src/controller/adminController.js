import Household from "../models/Household.js";
import Notification from "../models/Notification.js";
import Request from "../models/Request.js";

// FETCH ALL PENDING CENSUS REQUESTS FOR ADMIN
export const getAdminNotifications = async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" })
      .populate("user", "name email")
      .populate("householdId", "householdId address")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (status === "approved") {
      const household = await Household.findById(request.householdId);
      if (!household) return res.status(404).json({ message: "Household not found" });

      // --- AUTOMATIC DATA UPDATE LOGIC ---
      if (request.type === "add_newborn") {
        // Add the newbornData object to the members array
        household.members.push({
          ...request.newbornData,
          age: 0, // Ensure age is 0 for newborns
          isNewborn: true
        });
      } 
      else if (request.type === "delete_member") {
        // Remove the member at the specific index
        if (request.memberIndex !== undefined && household.members[request.memberIndex]) {
          household.members.splice(request.memberIndex, 1);
        }
      }

      await household.save();
    }

    // Update the request status itself
    request.status = status;
    await request.save();

    // Notify the user
    await Notification.create({
      user: request.user,
      type: "change_request",
      title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      msg: `Your ${request.type.replace("_", " ")} request for Household #${request.householdId} has been ${status}.`,
    });

    res.json({ success: true, message: `Request ${status} and household updated.` });
  } catch (error) {
    console.error("🔥 updateRequestStatus Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: LIST ALL HOUSEHOLDS
export async function adminListHouseholds(req, res) {
  try {
    const { status, ward, search } = req.query;
    const filter = {};

    if (status && status.trim()) filter.status = status.trim();
    if (ward && ward.trim()) filter.ward = ward.trim();

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
    return res.status(500).json({ message: err.message || "Failed to list households" });
  }
}

// ADMIN: GET SINGLE HOUSEHOLD
export async function adminGetHouseholdById(req, res) {
  try {
    const item = await Household.findOne({ householdId: req.params.id })
      .populate("user", "name email")
      .populate("verifiedBy", "name email");

    if (!item) return res.status(404).json({ message: "Household not found" });

    return res.json(item);
  } catch (err) {
    console.error("🔥 adminGetHouseholdById:", err.message);
    return res.status(500).json({ message: err.message || "Failed to fetch household" });
  }
}

// ADMIN: VERIFY HOUSEHOLD
export async function adminVerifyHousehold(req, res) {
  try {
    const item = await Household.findOne({ householdId: req.params.id });
    if (!item) return res.status(404).json({ message: "Household not found" });
    if (item.status === "verified") return res.status(400).json({ message: "Already verified" });

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

    return res.json({ message: "Household verified successfully", item });
  } catch (err) {
    console.error("🔥 adminVerifyHousehold:", err.message);
    return res.status(500).json({ message: err.message });
  }
}

// ADMIN: REJECT HOUSEHOLD
export async function adminRejectHousehold(req, res) {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ message: "Reason is required" });

    const item = await Household.findOne({ householdId: req.params.id });
    if (!item) return res.status(404).json({ message: "Household not found" });

    item.status = "rejected";
    item.locked = false;
    item.rejectionReason = reason.trim();

    await item.save();

    await Notification.create({
      user: item.user,
      type: "form",
      title: "Household Rejected",
      msg: `Your household form ${item.householdId} was rejected. Reason: ${reason.trim()}`,
    });

    return res.json({ message: "Household rejected successfully", item });
  } catch (err) {
    console.error("🔥 adminRejectHousehold:", err.message);
    return res.status(500).json({ message: err.message });
  }
}

// ADMIN: REQUEST CORRECTION
export async function adminRequestCorrection(req, res) {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ message: "Reason required" });

    const item = await Household.findOne({ householdId: req.params.id });
    if (!item) return res.status(404).json({ message: "Household not found" });

    item.status = "correction_required";
    item.locked = false;
    item.rejectionReason = reason.trim();

    await item.save();

    await Notification.create({
      user: item.user,
      type: "form",
      title: "Correction Required",
      msg: `Your household form ${item.householdId} needs correction. Reason: ${reason.trim()}`,
    });

    return res.json({ message: "Correction requested successfully", item });
  } catch (err) {
    console.error("🔥 adminRequestCorrection:", err.message);
    return res.status(500).json({ message: err.message });
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

    return res.json({ total, draft, submitted, correction_required, rejected, verified });
  } catch (err) {
    console.error("🔥 adminProgress:", err.message);
    return res.status(500).json({ message: err.message });
  }
}

// ADMIN: ANALYTICS
export async function adminAnalytics(req, res) {
  try {
    const households = await Household.find({}).lean();
    const analytics = {
      totalHouseholds: households.length,
      totalPopulation: 0,
      averageHouseholdSize: 0,
      statusBreakdown: { draft: 0, submitted: 0, correction_required: 0, rejected: 0, verified: 0 },
      genderBreakdown: { Male: 0, Female: 0, Other: 0 },
      ageBreakdown: { children: 0, adults: 0, seniors: 0 },
      disability: { householdsWithDisability: 0, totalDisabledMembers: 0 },
      wardStats: {},
      educationBreakdown: {},
      occupationBreakdown: {},
    };

    for (const household of households) {
      const members = Array.isArray(household.members) ? household.members : [];
      const ward = household.ward || "Unknown";
      const status = household.status || "draft";

      analytics.statusBreakdown[status] = (analytics.statusBreakdown[status] || 0) + 1;

      if (!analytics.wardStats[ward]) {
        analytics.wardStats[ward] = { households: 0, population: 0, male: 0, female: 0, other: 0, verified: 0, submitted: 0, rejected: 0, draft: 0, correction_required: 0 };
      }

      analytics.wardStats[ward].households += 1;
      analytics.wardStats[ward][status] = (analytics.wardStats[ward][status] || 0) + 1;

      let householdHasDisability = false;
      for (const member of members) {
        analytics.totalPopulation += 1;
        analytics.wardStats[ward].population += 1;
        const gender = member.gender || "Other";
        analytics.genderBreakdown[gender] = (analytics.genderBreakdown[gender] || 0) + 1;

        if (gender === "Male") analytics.wardStats[ward].male += 1;
        else if (gender === "Female") analytics.wardStats[ward].female += 1;
        else analytics.wardStats[ward].other += 1;

        const age = Number(member.age);
        if (!Number.isNaN(age) && age >= 0) {
          if (age <= 17) analytics.ageBreakdown.children += 1;
          else if (age <= 59) analytics.ageBreakdown.adults += 1;
          else analytics.ageBreakdown.seniors += 1;
        }
        if (member.disability) {
          analytics.disability.totalDisabledMembers += 1;
          householdHasDisability = true;
        }
        const edu = (member.education || "").trim();
        if (edu) analytics.educationBreakdown[edu] = (analytics.educationBreakdown[edu] || 0) + 1;
        const occ = (member.occupation || "").trim();
        if (occ) analytics.occupationBreakdown[occ] = (analytics.occupationBreakdown[occ] || 0) + 1;
      }
      if (householdHasDisability) analytics.disability.householdsWithDisability += 1;
    }

    analytics.averageHouseholdSize = analytics.totalHouseholds > 0 ? Number((analytics.totalPopulation / analytics.totalHouseholds).toFixed(2)) : 0;
    const wards = Object.entries(analytics.wardStats).map(([ward, val]) => ({ ward, ...val }));
    const educationBreakdown = Object.entries(analytics.educationBreakdown).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const occupationBreakdown = Object.entries(analytics.occupationBreakdown).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    return res.json({ ...analytics, wards, educationBreakdown, occupationBreakdown });
  } catch (err) {
    console.error("🔥 adminAnalytics:", err.message);
    return res.status(500).json({ message: err.message });
  }
}