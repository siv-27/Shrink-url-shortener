const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");

const {
  getUsers,
  getAllUrls,
  getSystemMetrics,
  toggleAbusiveUrl
} = require("../controllers/adminController");

router.get("/users", protect, admin, getUsers);
router.get("/urls", protect, admin, getAllUrls);
router.get("/metrics", protect, admin, getSystemMetrics);
router.put("/urls/:urlId/toggle", protect, admin, toggleAbusiveUrl);

module.exports = router;
