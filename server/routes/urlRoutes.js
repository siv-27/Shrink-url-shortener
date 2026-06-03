const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { protect } = require("../middleware/authMiddleware");
const {
  createShortUrl,
  bulkCreateUrls,
  unlockUrl,
  getMyUrls,
  updateUrl,
  deleteUrl,
  getUrlById
} = require("../controllers/urlController");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  }
});

router.post("/create", protect, createShortUrl);
router.post("/bulk", protect, upload.single("file"), bulkCreateUrls);
router.post("/unlock/:shortCode", unlockUrl);
router.get("/myurls", protect, getMyUrls);
router.get("/:id", protect, getUrlById);
router.put("/:id", protect, updateUrl);
router.delete("/:id", protect, deleteUrl);

module.exports = router;