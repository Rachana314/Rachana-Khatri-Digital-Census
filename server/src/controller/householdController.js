import QRCode from "qrcode";
import Household from "../models/Household.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import fs from "fs";
import crypto from "crypto";

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
    const { householdId } = req.params;
    const item = await Household.findOne({
      householdId: householdId,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Household Not Found" });
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
    return res.status(500).json({
      message: err.message || "Failed to create household",
    });
  }
}

// UPDATE HOUSEHOLD
export async function updateHousehold(req, res) {
  try {
    const { householdId } = req.params;
    const item = await Household.findOne({
      householdId: householdId,
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

    const { ward, address, members, documents, lat, lng } = req.body;
    if (ward !== undefined) item.ward = ward;
    if (address !== undefined) item.address = address;
    if (members !== undefined) item.members = members;
    if (documents !== undefined) item.documents = documents;
    if (lat !== undefined) item.lat = lat;
    if (lng !== undefined) item.lng = lng;

    await item.save();
    return res.json(item);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to update household",
    });
  }
}

// SUBMIT HOUSEHOLD + GENERATE QR
export async function submitHousehold(req, res) {
  try {
    const { householdId } = req.params;
    const item = await Household.findOne({
      householdId: householdId,
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
    return res.status(500).json({
      message: err.message || "Failed to submit household",
    });
  }
}

// UPLOAD DOCUMENT
export async function uploadDocument(req, res) {
  try {
    const { householdId } = req.params;
    const { type, memberName } = req.body; // ✅ also extract memberName

    if (!type)
      return res.status(400).json({ message: "Document type is required" });
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const fileBuffer = fs.readFileSync(req.file.path);
    const imageHash = crypto
      .createHash("md5")
      .update(fileBuffer)
      .digest("hex");

    const isDuplicate = await Household.findOne({
      "documents.fileHash": imageHash,
    });

    if (isDuplicate) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message:
          "This document photo has already been used in another household record.",
      });
    }

    const item = await Household.findOne({ householdId, user: req.user._id });

    if (!item)
      return res.status(404).json({ message: "Household not found" });
    if (item.locked || item.status === "verified") {
      return res
        .status(400)
        .json({ message: "Cannot upload documents after verification." });
    }

    const baseUrl = process.env.SERVER_BASE_URL || "http://localhost:8000";
    const url = `${baseUrl}/uploads/${req.file.filename}`;

    item.documents.push({
      type,
      url,
      originalName: req.file.originalname,
      fileHash: imageHash,
      memberName: memberName || "", // ✅ save memberName
    });

    await item.save();
    return res.json({ message: "Uploaded successfully", item });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Failed to upload document" });
  }
}

// REQUEST HOUSEHOLD CHANGE
export async function requestHouseholdChange(req, res) {
  try {
    const { householdId } = req.params;
    const { type, note } = req.body;

    const item = await Household.findOne({ householdId, user: req.user._id });
    if (!item)
      return res.status(404).json({ message: "Household not found" });

    const adminUser = await User.findOne({ role: "admin" });

    await Notification.create({
      user: adminUser ? adminUser._id : item.user,
      householdId: item._id,
      type: "change_request",
      title: `Change Request: ${type.replace("_", " ")}`,
      msg: `Household ${item.householdId} requested a ${type}. Note: ${
        note || "No note provided"
      }`,
    });

    return res.json({ message: "Request sent to admin successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// GET HOUSEHOLD MAP DATA
export const getHouseholdMapData = async (req, res) => {
  try {
    const households = await Household.find(
      {
        status: "verified",
        lat: { $exists: true, $ne: null },
        lng: { $exists: true, $ne: null },
      },
      "_id householdId address ward members status lat lng"
    );

    const mapData = households.map((h) => ({
      id: h._id,
      householdId: h.householdId,
      address: h.address,
      ward: h.ward,
      memberCount: h.members?.length || 0,
      status: h.status,
      lat: h.lat,
      lng: h.lng,
    }));

    res.json({ success: true, data: mapData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE HOUSEHOLD
export async function deleteHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) return res.status(404).json({ message: "Not found" });

    if (item.locked || item.status === "verified") {
      return res
        .status(400)
        .json({ message: "Verified household cannot be deleted." });
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
    return res
      .status(500)
      .json({ message: err.message || "Failed to delete household" });
  }
}