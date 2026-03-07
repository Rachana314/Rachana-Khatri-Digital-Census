import QRCode from "qrcode";
import Household from "../models/Household.js";
import Notification from "../models/Notification.js";

// LIST HOUSEHOLDS
export async function listHouseholds(req, res) {
  try {
    const items = await Household.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select(
        "householdId status updatedAt rejectionReason locked ward address members documents qrCodeData"
      );

    return res.json(items);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to list households",
    });
  }
}

// GET SINGLE HOUSEHOLD
export async function getHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.json(item);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to get household",
    });
  }
}

// CREATE HOUSEHOLD
export async function createHousehold(req, res) {
  try {
    const { ward, address, members = [], documents = [] } = req.body;

    if (!ward || !address) {
      return res.status(400).json({
        message: "Ward and address are required",
      });
    }

    const already = await Household.findOne({ user: req.user._id });

    if (already) {
      return res.status(400).json({
        message: `You already have a household form (${already.householdId}). Only one form is allowed.`,
      });
    }

    const item = await Household.create({
      user: req.user._id,
      ward,
      address,
      members,
      documents,
      status: "draft",
      locked: false,
      qrCodeData: "",
    });

    return res.status(201).json(item);
  } catch (err) {
    if (err?.code === 11000) {
      if (err.keyPattern?.user) {
        return res.status(400).json({
          message: "Only one household form is allowed per user.",
        });
      }

      if (err.keyPattern?.householdId) {
        return res.status(400).json({
          message: "Try again. ID collision happened.",
        });
      }
    }

    console.error("🔥 createHousehold:", err.message);
    return res.status(500).json({
      message: err.message || "Failed to create household",
    });
  }
}

// UPDATE HOUSEHOLD
export async function updateHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    if (item.locked || item.status === "verified") {
      return res.status(400).json({
        message: "This record is verified/locked. You cannot edit it.",
      });
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
    return res.status(500).json({
      message: err.message || "Failed to update household",
    });
  }
}

// SUBMIT HOUSEHOLD + GENERATE QR IMMEDIATELY
export async function submitHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Household not found" });
    }

    if (item.status !== "draft" && item.status !== "rejected") {
      return res.status(400).json({
        message: "Form already submitted",
      });
    }

    item.status = "submitted";
    item.rejectionReason = "";

    const publicBaseUrl =
      process.env.PUBLIC_FRONTEND_URL || "http://localhost:5173";
    const publicQrUrl = `${publicBaseUrl}/verify/${item.householdId}`;

    const qrImage = await QRCode.toDataURL(publicQrUrl);
    item.qrCodeData = qrImage;

    await item.save();

    await Notification.create({
      user: req.user._id,
      type: "form",
      title: "Form Submitted",
      msg: `Your household form ${item.householdId} was submitted.`,
    });

    return res.json({
      message: "Household submitted successfully",
      item,
      qrTargetUrl: publicQrUrl,
    });
  } catch (err) {
    console.error("🔥 submitHousehold:", err.message);
    return res.status(500).json({
      message: err.message || "Failed to submit household",
    });
  }
}

// UPLOAD DOCUMENT
export async function uploadDocument(req, res) {
  try {
    const { householdId } = req.params;
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        message: "Document type is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const item = await Household.findOne({
      householdId,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        message: "Household not found",
      });
    }

    if (item.locked || item.status === "verified") {
      return res.status(400).json({
        message: "Cannot upload documents after verification.",
      });
    }

    const url = `http://localhost:8000/uploads/${req.file.filename}`;

    item.documents.push({
      type,
      url,
      originalName: req.file.originalname,
    });

    await item.save();

    return res.json({
      message: "Uploaded",
      item,
    });
  } catch (err) {
    console.error("🔥 uploadDocument:", err.message);
    return res.status(500).json({
      message: err.message || "Failed to upload document",
    });
  }
}

// DELETE HOUSEHOLD
export async function deleteHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    if (item.locked || item.status === "verified") {
      return res.status(400).json({
        message: "Verified household cannot be deleted.",
      });
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
    return res.status(500).json({
      message: err.message || "Failed to delete household",
    });
  }
}