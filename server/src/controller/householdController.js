
import Household from "../models/Household.js";
import Notification from "../models/Notification.js";

export async function listHouseholds(req, res) {
  try {
    const items = await Household.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select("householdId status updatedAt rejectionReason");

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to list households" });
  }
}

export async function getHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to get household" });
  }
}

export async function createHousehold(req, res) {
  try {
    const { ward, address, members = [], documents = [] } = req.body;

    // validate required fields
    if (!ward || !address) {
      return res.status(400).json({ message: "Ward and address are required" });
    }

    const item = await Household.create({
      user: req.user._id,
      ward,
      address,
      members,
      documents,
      status: "draft",
    });

    res.status(201).json(item);
    } catch (err) {
  console.log("🔥 createHousehold ERROR:", err?.message);
  console.log(err?.stack);
  return res.status(500).json({ message: err?.message || "Failed to create household" });
}


}


export async function updateHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) return res.status(404).json({ message: "Not found" });

    if (item.status === "submitted" || item.status === "verified") {
      return res.status(400).json({ message: "Cannot edit after submit/verify" });
    }

    const { ward, address, members, documents } = req.body;

    if (ward !== undefined) item.ward = ward;
    if (address !== undefined) item.address = address;
    if (members !== undefined) item.members = members;
    if (documents !== undefined) item.documents = documents;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update household" });
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

    res.json({ message: "Submitted", item });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to submit household" });
  }
}

/**
 * ✅ THIS IS THE MISSING EXPORT THAT CAUSED:
 * "does not provide an export named uploadDocument"
 */
export async function uploadDocument(req, res) {
  try {
    const { householdId } = req.params;
    const { type } = req.body;

    if (!type) return res.status(400).json({ message: "Document type is required" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const item = await Household.findOne({ householdId, user: req.user._id });
    if (!item) return res.status(404).json({ message: "Household not found" });

    // file url
    const url = `http://localhost:5000/uploads/${req.file.filename}`;

    item.documents.push({ type, url });
    await item.save();

    res.json({ message: "Uploaded", item });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to upload document" });
  }
}
