const User = require("../models/User");
const Url = require("../models/Url");
const Visit = require("../models/Visit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AuditLog = require("../models/AuditLog");

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken
    });

    console.log(`[Email Service Simulation] Send verification email to ${email}`);
    console.log(`Verification URL: http://localhost:5173/verify-email?token=${verificationToken}`);

    await AuditLog.create({
      userId: user._id,
      action: "REGISTER",
      details: "Registered new account"
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: "EMAIL_VERIFICATION",
      details: "Verified email address successfully"
    });

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      await AuditLog.create({
        userId: user._id,
        action: "LOGIN",
        details: "Logged in successfully"
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: accessToken,
        refreshToken
      });
    } else {
      res.status(401).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account with that email address exists" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    console.log(`[Email Service Simulation] Send password reset to ${email}`);
    console.log(`Reset URL: http://localhost:5173/reset-password?token=${resetToken}`);

    res.json({ message: "Password reset link sent (simulated)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: "RESET_PASSWORD",
      details: "Password reset completed"
    });

    res.json({ message: "Password has been successfully updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateApiKey = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Please provide an API Key name" });
    }

    const key = `sk_live_${crypto.randomBytes(24).toString("hex")}`;
    const user = await User.findById(req.user._id);

    user.apiKeys.push({ key, name });
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: "GENERATE_API_KEY",
      details: `Generated API Key: ${name}`
    });

    res.status(201).json({ name, key, _id: user.apiKeys[user.apiKeys.length - 1]._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const keyIndex = user.apiKeys.findIndex(k => k._id.toString() === req.params.keyId);

    if (keyIndex === -1) {
      return res.status(404).json({ message: "API Key not found" });
    }

    const keyName = user.apiKeys[keyIndex].name;
    user.apiKeys.splice(keyIndex, 1);
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: "REVOKE_API_KEY",
      details: `Revoked API Key: ${keyName}`
    });

    res.json({ message: "API Key revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const logs = await AuditLog.find({ userId: req.user._id }).sort({ timestamp: -1 }).limit(30);
    res.json({ user, logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use by another account" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: "UPDATE_PROFILE",
      details: "Profile updated successfully"
    });

    const updatedUser = await User.findById(user._id).select("-password");
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: "CHANGE_PASSWORD",
      details: "Password changed successfully"
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const urls = await Url.find({ user: user._id });
    const urlIds = urls.map((u) => u._id);

    await Visit.deleteMany({ url: { $in: urlIds } });
    await Url.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    await AuditLog.create({
      userId: user._id,
      action: "DELETE_ACCOUNT",
      details: "Account and all associated data deleted"
    });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};