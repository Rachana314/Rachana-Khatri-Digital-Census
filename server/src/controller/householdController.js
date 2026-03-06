import fs from "fs";
import crypto from "crypto";
import PDFDocument from "pdfkit";

import Household from "../models/Household.js";
import Notification from "../models/Notification.js";

function hashFileSha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function listHouseholds(req, res) {
  try {
    const items = await Household.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select("householdId status updatedAt rejectionReason locked qrCodeData");

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
    const { ward, address, members = [], documents = [] } = req.body;

    if (!ward || !address) {
      return res.status(400).json({ message: "Ward and address are required" });
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
    });

    return res.status(201).json(item);
  } catch (err) {
    if (err?.code === 11000 && err.keyPattern?.user) {
      return res.status(400).json({ message: "Only one household form is allowed per user." });
    }
    if (err?.code === 11000 && err.keyPattern?.["documents.hash"]) {
      return res.status(409).json({ message: "This document is already uploaded/used." });
    }
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

    // Locked after verification
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
    if (err?.code === 11000 && err.keyPattern?.["documents.hash"]) {
      return res.status(409).json({ message: "This document is already uploaded/used." });
    }
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

    // Same QR works forever because it opens a live status page
    item.status = "submitted";
    item.rejectionReason = "";
    item.qrCodeData = `http://localhost:5173/verify-household/${item.householdId}`;
    await item.save();

    await Notification.create({
      user: req.user._id,
      type: "form",
      title: "Form Submitted",
      msg: `Your household form ${item.householdId} was submitted for verification.`,
    });

    return res.json({ message: "Submitted", item });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to submit household" });
  }
}

export async function uploadDocument(req, res) {
  try {
    const { householdId } = req.params;
    const { type = "Photo" } = req.body;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const item = await Household.findOne({ householdId, user: req.user._id });
    if (!item) return res.status(404).json({ message: "Household not found" });

    if (item.locked || item.status === "verified") {
      return res.status(400).json({ message: "Cannot upload documents after verification." });
    }

    const url = `http://localhost:5000/uploads/${req.file.filename}`;
    const hash = hashFileSha256(req.file.path);

    item.documents.push({
      type,
      url,
      hash,
      originalName: req.file.originalname,
      mime: req.file.mimetype,
      size: req.file.size,
    });

    await item.save();

    return res.json({ message: "Uploaded", item });
  } catch (err) {
    if (err?.code === 11000 && err.keyPattern?.["documents.hash"]) {
      return res.status(409).json({ message: "This document is already uploaded/used." });
    }
    return res.status(500).json({ message: err.message || "Failed to upload document" });
  }
}

export async function deleteHousehold(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) return res.status(404).json({ message: "Not found" });

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

// Public page used by QR scanning
export async function getPublicHouseholdById(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
    }).select(
      "householdId ward address members status rejectionReason verifiedAt createdAt updatedAt qrCodeData"
    );

    if (!item) return res.status(404).json({ message: "Household not found" });

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch household" });
  }
}

// PDF export for user's own household report
export async function exportHouseholdPdf(req, res) {
  try {
    const item = await Household.findOne({
      householdId: req.params.householdId,
      user: req.user._id,
    });

    if (!item) return res.status(404).json({ message: "Household not found" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${item.householdId}-report.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text("Digital Census - Household Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Household ID: ${item.householdId}`);
    doc.text(`Status: ${String(item.status || "").toUpperCase()}`);
    doc.text(`Ward: ${item.ward || "-"}`);
    doc.text(`Address: ${item.address || "-"}`);
    doc.text(`Created At: ${item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}`);
    doc.text(`Updated At: ${item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}`);

    if (item.verifiedAt) {
      doc.text(`Verified At: ${new Date(item.verifiedAt).toLocaleString()}`);
    }

    if (item.status === "rejected") {
      doc.moveDown();
      doc.fontSize(13).text("Rejection Reason", { underline: true });
      doc.fontSize(12).text(item.rejectionReason || "-");
    }

    doc.moveDown();
    doc.fontSize(13).text("Members", { underline: true });
    doc.moveDown(0.5);

    if (!item.members?.length) {
      doc.fontSize(12).text("No members added.");
    } else {
      item.members.forEach((m, index) => {
        doc.fontSize(12).text(
          `${index + 1}. ${m.name || "-"} | Age: ${m.age ?? "-"} | Gender: ${m.gender || "-"}`
        );
      });
    }

    doc.moveDown();
    doc.fontSize(13).text("Documents", { underline: true });
    doc.moveDown(0.5);

    if (!item.documents?.length) {
      doc.fontSize(12).text("No documents uploaded.");
    } else {
      item.documents.forEach((d, index) => {
        doc.fontSize(12).text(`${index + 1}. ${d.originalName || d.type || "Document"}`);
      });
    }

    doc.end();
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to export report PDF" });
  }
}