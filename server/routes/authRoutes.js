const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/security");

const {
  registerUser,
  verifyEmail,
  loginUser,
  refreshToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  generateApiKey,
  deleteApiKey,
  getUserProfile,
  updateProfile,
  changePassword,
  deleteAccount
} = require("../controllers/authController");

router.post("/register", authLimiter, registerUser);
router.get("/verify/:token", verifyEmail);
router.post("/login", authLimiter, loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected User routes
router.post("/api-keys", protect, generateApiKey);
router.delete("/api-keys/:keyId", protect, deleteApiKey);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.delete("/account", protect, deleteAccount);

module.exports = router;