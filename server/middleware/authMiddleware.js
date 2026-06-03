const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  const apiKey = req.headers["x-api-key"];
  if (apiKey) {
    try {
      const user = await User.findOne({ "apiKeys.key": apiKey }).select("-password");
      if (user) {
        req.user = user;
        return next();
      }
      return res.status(401).json({ message: "Invalid API Key" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Not Authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not Authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not Authorized as Admin" });
  }
};

module.exports = { protect, admin };