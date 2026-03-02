import Household from "../models/Household.js";
import Notification from "../models/Notification.js";

// list (user can only have one, but we keep array for your UI tabs)
export async function listHouseholds(req, res) {
  try {
    const items = await Household.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select("householdId status updatedAt rejectionReason locked");

    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to list households" });
  }
}

export async function getHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) return res.status(404).json({ message: "Not found" });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to get household" });
  }
}

export async function createHousehold(req, res) {
  try {
    const { ward, address, members = [], documents = [], citizenshipNo } = req.body;

    if (!ward || !address || !citizenshipNo) {
      return res.status(400).json({ message: "Ward, address and citizenshipNo are required" });
    }

    // one user = one form
    const already = await Household.findOne({ user: req.user._id });
    if (already) {
      return res.status(400).json({
        message: `You already have a household form (${already.householdId}). Only one form is allowed.`,
      });
    }

    // no duplicate citizenship
    const dupCitizen = await Household.findOne({
      citizenshipNo: String(citizenshipNo).trim().toUpperCase().replace(/\s+/g, ""),
    });
    if (dupCitizen) {
      return res.status(400).json({ message: "This citizenship number is already used." });
    }

    const item = await Household.create({
      user: req.user._id,
      ward,
      address,
      citizenshipNo,
      members,
      documents,
      status: "draft",
      locked: false,
    });

    return res.status(201).json(item);
  } catch (err) {
    // friendly mongo duplicate errors
    if (err?.code === 11000) {
      if (err.keyPattern?.user) return res.status(400).json({ message: "Only one household form is allowed per user." });
      if (err.keyPattern?.citizenshipNo) return res.status(400).json({ message: "This citizenship number is already used." });
      if (err.keyPattern?.householdId) return res.status(400).json({ message: "Try again. ID collision happened." });
    }

    console.error("🔥 createHousehold:", err.message);
    return res.status(500).json({ message: err.message || "Failed to create household" });
  }
}

export async function updateHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) return res.status(404).json({ message: "Not found" });

    // user can edit until verified
    if (item.locked || item.status === "verified") {
      return res.status(400).json({ message: "This record is verified/locked. You cannot edit it." });
    }

    const { ward, address, members, documents } = req.body;

    if (ward !== undefined) item.ward = ward;
    if (address !== undefined) item.address = address;
    if (members !== undefined) item.members = members;
    if (documents !== undefined) item.documents = documents;

    await item.save();
    return res.json(item);
  } catch (err) {
    console.error("🔥 updateHousehold:", err.message);
    return res.status(500).json({ message: err.message || "Failed to update household" });
  }
}

export async function submitHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) return res.status(404).json({ message: "Not found" });

    if (item.status !== "draft" && item.status !== "rejected") {
      return res.status(400).json({ message: "Invalid status for submit" });
    }

    item.status = "submitted";
    item.rejectionReason = "";
    await item.save();

    await Notification.create({
      user: req.user._id,
      type: "form",
      title: "Form Submitted",
      msg: `Your household form ${item.householdId} was submitted for verification.`,
    });

    return res.json({ message: "Submitted", item });
  } catch (err) {
    console.error("🔥 submitHousehold:", err.message);
    return res.status(500).json({ message: err.message || "Failed to submit household" });
  }
}

export async function uploadDocument(req, res) {
  try {
    const { householdId } = req.params;
    const { type } = req.body;

    if (!type) return res.status(400).json({ message: "Document type is required" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const item = await Household.findOne({ householdId, user: req.user._id });
    if (!item) return res.status(404).json({ message: "Household not found" });

    // allow upload until verified
    if (item.locked || item.status === "verified") {
      return res.status(400).json({ message: "Cannot upload documents after verification." });
    }

    const url = `http://localhost:5000/uploads/${req.file.filename}`;

    item.documents.push({ type, url });
    await item.save();

    return res.json({ message: "Uploaded", item });
  } catch (err) {
    console.error("🔥 uploadDocument:", err.message);
    return res.status(500).json({ message: err.message || "Failed to upload document" });
  }
}

// ✅ DELETE HOUSEHOLD (allowed until verified)
export async function deleteHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) return res.status(404).json({ message: "Not found" });

    // user can delete until verified
    if (item.locked || item.status === "verified") {
      return res.status(400).json({ message: "Verified household cannot be deleted." });
    }

    await Household.deleteOne({ _id: item._id });

    await Notification.create({
      user: req.user._id,
      type: "form",
      title: "Household Deleted",
      msg: `Your household form ${item.householdId} was deleted.`,
    });

    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to delete household" });
  }
}