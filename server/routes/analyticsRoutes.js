const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getAnalytics,
  getPublicStats
} = require("../controllers/analyticsController");

router.get("/:id", protect, getAnalytics);
router.get("/public/:shortCode", getPublicStats);

module.exports = router;