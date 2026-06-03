const Url = require("../models/Url");
const Visit = require("../models/Visit");
const Workspace = require("../models/Workspace");

const getAnalytics = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ message: "URL Not Found" });
    }

    const isOwner = url.userId.toString() === req.user._id.toString();
    let isTeamMember = false;

    if (url.workspaceId) {
      const workspace = await Workspace.findById(url.workspaceId);
      if (workspace) {
        isTeamMember = workspace.ownerId.toString() === req.user._id.toString() ||
                       workspace.members.some(m => m.userId.toString() === req.user._id.toString());
      }
    }

    if (!isOwner && !isTeamMember && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not Authorized" });
    }

    const urlId = url._id;

    const stats = await Visit.aggregate([
      { $match: { urlId } },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          uniqueIps: { $addToSet: "$ip" },
          lastVisited: { $max: "$timestamp" }
        }
      }
    ]);

    const totalClicks = stats[0] ? stats[0].totalClicks : 0;
    const uniqueVisitors = stats[0] ? stats[0].uniqueIps.length : 0;
    const lastVisit = stats[0] ? stats[0].lastVisited : null;

    const activeDaysStats = await Visit.aggregate([
      { $match: { urlId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
        }
      },
      { $count: "activeDays" }
    ]);
    const activeDays = activeDaysStats[0] ? activeDaysStats[0].activeDays : 0;

    const dailyTrend = await Visit.aggregate([
      { $match: { urlId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    const devices = await Visit.aggregate([
      { $match: { urlId } },
      { $group: { _id: "$device", value: { $sum: 1 } } }
    ]);

    const browsers = await Visit.aggregate([
      { $match: { urlId } },
      { $group: { _id: "$browser", value: { $sum: 1 } } }
    ]);

    const os = await Visit.aggregate([
      { $match: { urlId } },
      { $group: { _id: "$os", value: { $sum: 1 } } }
    ]);

    const countries = await Visit.aggregate([
      { $match: { urlId } },
      { $group: { _id: "$country", value: { $sum: 1 } } },
      { $sort: { value: -1 } }
    ]);

    const referrers = await Visit.aggregate([
      { $match: { urlId } },
      { $group: { _id: "$referrer", value: { $sum: 1 } } },
      { $sort: { value: -1 } }
    ]);

    const recentVisits = await Visit.find({ urlId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      url,
      totalClicks,
      uniqueVisitors,
      lastVisit,
      activeDays,
      dailyTrend: dailyTrend.map(d => ({ date: d._id, clicks: d.clicks })),
      devices: devices.map(d => ({ name: d._id || "Unknown", value: d.value })),
      browsers: browsers.map(b => ({ name: b._id || "Unknown", value: b.value })),
      os: os.map(o => ({ name: o._id || "Unknown", value: o.value })),
      countries: countries.map(c => ({ name: c._id || "Unknown", value: c.value })),
      referrers: referrers.map(r => ({ name: r._id || "Direct", value: r.value })),
      recentVisits
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicStats = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: "URL Not Found" });
    }

    if (url.status === "disabled") {
      return res.status(403).json({ message: "Link disabled" });
    }

    const urlId = url._id;

    const stats = await Visit.aggregate([
      { $match: { urlId } },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          lastVisited: { $max: "$timestamp" }
        }
      }
    ]);

    const totalClicks = stats[0] ? stats[0].totalClicks : 0;
    const lastVisit = stats[0] ? stats[0].lastVisited : null;

    const dailyTrend = await Visit.aggregate([
      { $match: { urlId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 15 }
    ]);

    res.json({
      shortCode,
      totalClicks,
      lastVisit,
      dailyTrend: dailyTrend.map(d => ({ date: d._id, clicks: d.clicks }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalytics,
  getPublicStats
};