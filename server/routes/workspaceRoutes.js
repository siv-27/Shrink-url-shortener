const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createWorkspace,
  getWorkspaces,
  inviteMember,
  removeMember,
  deleteWorkspace
} = require("../controllers/workspaceController");

router.get("/", protect, getWorkspaces);
router.post("/", protect, createWorkspace);
router.post("/:id/invite", protect, inviteMember);
router.delete("/:id/members/:userId", protect, removeMember);
router.delete("/:id", protect, deleteWorkspace);

module.exports = router;
