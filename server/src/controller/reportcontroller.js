import PDFDocument from "pdfkit";
import Household from "../models/Household.js";
import VerifiedCitizen from "../models/VerifiedCitizen.js";

export const exportPDF = async (req, res) => {
  try {
    const { householdIds = [], citizenIds = [] } = req.body;

    if (householdIds.length === 0 && citizenIds.length === 0) {
      return res.status(400).json({ message: "No records selected" });
    }

    let households = [];
    let citizens = [];

    if (householdIds.length > 0) {
      households = await Household.find({ _id: { $in: householdIds } })
        .populate("user", "name email phone")
        .populate("verifiedBy", "name email")
        .lean();
    }

    if (citizenIds.length > 0) {
      citizens = await VerifiedCitizen.find({ _id: { $in: citizenIds } }).lean();
    }

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=census-report-${Date.now()}.pdf`);
    doc.pipe(res);

    // ── Title ──
    doc.rect(0, 0, doc.page.width, 100).fill("#1e3a5f");
    doc.fontSize(22).font("Helvetica-Bold").fillColor("white")
      .text("Digital Census Report", 50, 30, { align: "center" });
    doc.fontSize(10).font("Helvetica").fillColor("#cbd5e1")
      .text(`Generated: ${new Date().toLocaleString()}`, 50, 62, { align: "center" });
    doc.moveDown(4);

    // ── Summary ──
    doc.roundedRect(50, 115, doc.page.width - 100, 40, 6).fill("#f1f5f9");
    doc.fontSize(10).font("Helvetica").fillColor("#334155")
      .text(
        `Households: ${households.length}     |     Verified Citizens: ${citizens.length}     |     Total: ${households.length + citizens.length}`,
        50, 128, { align: "center" }
      );
    doc.moveDown(4.5);

    const SKIP = ["_id", "__v", "password", "documents"];

    const printFields = (record, skipExtra = []) => {
      Object.entries(record).forEach(([key, val]) => {
        if ([...SKIP, ...skipExtra].includes(key)) return;
        if (val === null || val === undefined || val === "") return;
        let display;
        if (typeof val === "boolean") display = val ? "Yes" : "No";
        else if (typeof val === "object" && (val.name || val.email))
          display = `${val.name || ""} (${val.email || ""})`;
        else if (typeof val === "object") display = JSON.stringify(val);
        else display = String(val);

        doc.font("Helvetica-Bold").fontSize(10).fillColor("#475569")
          .text(`${formatKey(key)}: `, { continued: true })
          .font("Helvetica").fillColor("#0f172a").text(display);
      });
    };

    // ── Household Section ──
    if (households.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e3a5f")
        .text(`HOUSEHOLD FORMS (${households.length})`);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
        .strokeColor("#1e3a5f").lineWidth(2).stroke();
      doc.moveDown(0.8);

      households.forEach((h, i) => {
        doc.rect(50, doc.y, doc.page.width - 100, 24).fill("#1e3a5f");
        doc.fontSize(11).font("Helvetica-Bold").fillColor("white")
          .text(`  #${i + 1}  ${h.householdId || ""}  —  ${h.address || ""}`, 55, doc.y - 20);
        doc.moveDown(1.2);

        printFields(h, ["members"]);

        if (h.members?.length > 0) {
          doc.moveDown(0.4);
          doc.fontSize(10).font("Helvetica-Bold").fillColor("#1e3a5f")
            .text(`Members (${h.members.length}):`);
          h.members.forEach((m, mi) => {
            doc.fontSize(9).font("Helvetica-Bold").fillColor("#64748b").text(`  Member ${mi + 1}:`);
            Object.entries(m).forEach(([mk, mv]) => {
              if (mk === "photo" || !mv) return;
              doc.fontSize(9).font("Helvetica").fillColor("#334155")
                .text(`    ${formatKey(mk)}: ${typeof mv === "boolean" ? (mv ? "Yes" : "No") : mv}`);
            });
          });
        }

        doc.moveDown(1);
        if (doc.y > 720 && i < households.length - 1) doc.addPage();
      });
    }

    // ── Verified Citizens Section ──
    if (citizens.length > 0) {
      if (households.length > 0) doc.addPage();

      doc.fontSize(14).font("Helvetica-Bold").fillColor("#065f46")
        .text(`VERIFIED CITIZEN FORMS (${citizens.length})`);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
        .strokeColor("#065f46").lineWidth(2).stroke();
      doc.moveDown(0.8);

      citizens.forEach((c, i) => {
        doc.rect(50, doc.y, doc.page.width - 100, 24).fill("#065f46");
        doc.fontSize(11).font("Helvetica-Bold").fillColor("white")
          .text(`  #${i + 1}  ${c.citizenshipNo}  —  ${c.fullName || ""}`, 55, doc.y - 20);
        doc.moveDown(1.2);

        printFields(c);

        doc.moveDown(1);
        if (doc.y > 720 && i < citizens.length - 1) doc.addPage();
      });
    }

    // ── Footer ──
    doc.fontSize(9).font("Helvetica").fillColor("#94a3b8")
      .text("Digital Census System  |  Confidential", 50, doc.page.height - 40, { align: "center" });

    doc.end();
  } catch (err) {
    console.error("PDF Export Error:", err);
    if (!res.headersSent)
      res.status(500).json({ message: "Failed to generate PDF", error: err.message });
  }
};

function formatKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}