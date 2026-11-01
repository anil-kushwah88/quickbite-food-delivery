import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import ApiError from "../utils/ApiError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, "../uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    const base = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()
      .slice(0, 40);
    cb(null, `${Date.now()}-${base || "food"}${ext}`);
  },
});

const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(new ApiError(400, "Only PNG, JPG or WEBP images are allowed"));
  },
});

export default upload;
