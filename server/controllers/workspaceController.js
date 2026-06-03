const Workspace = require("../models/Workspace");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const workspace = await Workspace.create({
      name,
      ownerId: req.user._id,
      members: []
    });

    await AuditLog.create({
      userId: req.user._id,
      action: "CREATE_WORKSPACE",
      details: `Created workspace: ${name}`
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { ownerId: req.user._id },
        { "members.userId": req.user._id }
      ]
    }).populate("ownerId", "name email").populate("members.userId", "name email");

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const inviteMember = async (req, res) => {
  try {
    const { email, role = "member" } = req.body;
    const { id } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.ownerId.toString() === req.user._id.toString();
    const isAdminMember = workspace.members.some(m => m.userId.toString() === req.user._id.toString() && m.role === "admin");

    if (!isOwner && !isAdminMember) {
      return res.status(403).json({ message: "Not authorized to invite members to this workspace" });
    }

    const invitee = await User.findOne({ email });
    if (!invitee) {
      return res.status(404).json({ message: "User not found with that email address" });
    }

    const isAlreadyMember = workspace.ownerId.toString() === invitee._id.toString() ||
                            workspace.members.some(m => m.userId.toString() === invitee._id.toString());

    if (isAlreadyMember) {
      return res.status(400).json({ message: "User is already a member of this workspace" });
    }

    workspace.members.push({ userId: invitee._id, role });
    await workspace.save();

    await AuditLog.create({
      userId: req.user._id,
      action: "INVITE_WORKSPACE_MEMBER",
      details: `Invited user ${email} to workspace ${workspace.name}`
    });

    res.json({ message: "Member added successfully", workspace });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.ownerId.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: "Only the workspace owner can remove members" });
    }

    workspace.members = workspace.members.filter(m => m.userId.toString() !== userId);
    await workspace.save();

    await AuditLog.create({
      userId: req.user._id,
      action: "REMOVE_WORKSPACE_MEMBER",
      details: `Removed user ID ${userId} from workspace ${workspace.name}`
    });

    res.json({ message: "Member removed successfully", workspace });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.ownerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the owner can delete a workspace" });
    }

    await workspace.deleteOne();

    await AuditLog.create({
      userId: req.user._id,
      action: "DELETE_WORKSPACE",
      details: `Deleted workspace: ${workspace.name}`
    });

    res.json({ message: "Workspace deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  inviteMember,
  removeMember,
  deleteWorkspace
};
