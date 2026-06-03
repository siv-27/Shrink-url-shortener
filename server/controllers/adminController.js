const User = require("../models/User");
const Url = require("../models/Url");
const Visit = require("../models/Visit");
const AuditLog = require("../models/AuditLog");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUrls = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: "i" } },
        { shortCode: { $regex: search, $options: "i" } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const urls = await Url.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Url.countDocuments(query);

    res.json({
      urls,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSystemMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalUrls = await Url.countDocuments({});
    const activeUrls = await Url.countDocuments({ status: "active" });
    const disabledUrls = await Url.countDocuments({ status: "disabled" });
    
    const clickStats = await Url.aggregate([
      { $group: { _id: null, totalClicks: { $sum: "$clicks" } } }
    ]);
    const totalClicks = clickStats[0] ? clickStats[0].totalClicks : 0;

    const dailyCreations = await Url.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 15 }
    ]);

    res.json({
      totalUsers,
      totalUrls,
      activeUrls,
      disabledUrls,
      totalClicks,
      dailyCreations: dailyCreations.reverse()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleAbusiveUrl = async (req, res) => {
  try {
    const { urlId } = req.params;
    const url = await Url.findById(urlId);

    if (!url) {
      return res.status(404).json({ message: "URL Not Found" });
    }

    url.status = url.status === "disabled" ? "active" : "disabled";
    await url.save();

    await AuditLog.create({
      userId: req.user._id,
      action: "ADMIN_TOGGLE_ABUSIVE_URL",
      details: `Admin toggled URL ${url.shortCode} status to ${url.status}`
    });

    res.json({ message: `URL status toggled to ${url.status}`, url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getAllUrls,
  getSystemMetrics,
  toggleAbusiveUrl
};
