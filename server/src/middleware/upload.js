import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

function fileFilter(req, file, cb) {
  const ok =
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf";

  if (!ok) return cb(new Error("Only images or PDF allowed"), false);
  cb(null, true);
}

export const upload = multer({ storage, fileFilter });
