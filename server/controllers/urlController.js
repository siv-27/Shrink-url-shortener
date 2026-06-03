const Url = require("../models/Url");
const generateCode = require("../utils/generateCode");
const Visit = require("../models/Visit");
const Workspace = require("../models/Workspace");
const AuditLog = require("../models/AuditLog");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const csv = require("csv-parser");
const { parseVisitDetails } = require("../utils/analyticsHelper");

const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, password, expiryDate, tags, category, workspaceId } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "URL is required" });
    }

    if (!validator.isURL(originalUrl)) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    let shortCode = customAlias ? customAlias.trim().toLowerCase() : "";

    if (shortCode) {
      if (!/^[a-zA-Z0-9-_]+$/.test(shortCode)) {
        return res.status(400).json({ message: "Custom alias can only contain letters, numbers, dashes, and underscores" });
      }
      
      const exists = await Url.findOne({ shortCode });
      if (exists) {
        return res.status(400).json({ message: "Custom alias is already in use" });
      }
    } else {
      let exists;
      do {
        shortCode = generateCode();
        exists = await Url.findOne({ shortCode });
      } while (exists);
    }

    let hashedPassword = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    if (workspaceId) {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      const isMember = workspace.ownerId.toString() === req.user._id.toString() || 
                       workspace.members.some(m => m.userId.toString() === req.user._id.toString());
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized in this workspace" });
      }
    }

    const url = await Url.create({
      userId: req.user._id,
      originalUrl,
      shortCode,
      password: hashedPassword,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      tags: tags || [],
      category: category || "",
      workspaceId: workspaceId || undefined,
      status: "active"
    });

    await AuditLog.create({
      userId: req.user._id,
      action: "CREATE_URL",
      details: `Created short URL for: ${originalUrl} with code: ${shortCode}`
    });

    res.status(201).json(url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkCreateUrls = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a CSV file" });
    }

    const results = [];
    const successList = [];
    const errorList = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", async () => {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error("Error removing temp file", e);
        }

        for (const row of results) {
          const originalUrl = row.originalUrl || row["Original URL"] || row.url || row.URL || Object.values(row)[0];
          const customAlias = row.alias || row.Alias || row.customAlias || Object.values(row)[1];

          if (!originalUrl || !validator.isURL(originalUrl.trim())) {
            errorList.push({ row, error: "Invalid or missing URL" });
            continue;
          }

          let shortCode = customAlias ? customAlias.trim().toLowerCase() : "";
          if (shortCode) {
            if (!/^[a-zA-Z0-9-_]+$/.test(shortCode)) {
              errorList.push({ row, error: "Invalid custom alias characters" });
              continue;
            }
            const exists = await Url.findOne({ shortCode });
            if (exists) {
              errorList.push({ row, error: `Alias '${shortCode}' already exists` });
              continue;
            }
          } else {
            let exists;
            do {
              shortCode = generateCode();
              exists = await Url.findOne({ shortCode });
            } while (exists);
          }

          try {
            const urlObj = await Url.create({
              userId: req.user._id,
              originalUrl: originalUrl.trim(),
              shortCode,
              status: "active"
            });
            successList.push(urlObj);
          } catch (err) {
            errorList.push({ row, error: err.message });
          }
        }

        await AuditLog.create({
          userId: req.user._id,
          action: "BULK_CREATE_URLS",
          details: `Bulk generated ${successList.length} short URLs. Failed: ${errorList.length}`
        });

        res.json({
          successCount: successList.length,
          failCount: errorList.length,
          successes: successList,
          failures: errorList
        });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).send(`
        <html>
          <head>
            <title>Link Not Found</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 50px; background: #fafafa; }
              .card { max-width: 500px; margin: auto; padding: 30px; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
              h1 { color: #f43f5e; }
              a { color: #0f766e; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Not Found</h1>
              <p>The short link you followed does not exist or has been deleted.</p>
              <a href="/">Go to Home</a>
            </div>
          </body>
        </html>
      `);
    }

    if (url.status === "disabled") {
      return res.status(403).send("This link has been disabled by the owner or administrator.");
    }

    if (url.expiryDate && new Date() > url.expiryDate) {
      if (url.status !== "expired") {
        url.status = "expired";
        await url.save();
      }
      return res.status(410).send("This link has expired.");
    }

    if (url.password) {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      return res.redirect(`${clientUrl}/unlock/${shortCode}`);
    }

    const details = parseVisitDetails(req);
    await Visit.create({
      urlId: url._id,
      ...details
    });

    url.clicks += 1;
    await url.save();

    res.redirect(302, url.originalUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unlockUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { password } = req.body;

    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ message: "URL Not Found" });
    }

    if (!url.password) {
      return res.json({ originalUrl: url.originalUrl });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const isMatch = await bcrypt.compare(password, url.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const details = parseVisitDetails(req);
    await Visit.create({
      urlId: url._id,
      ...details
    });

    url.clicks += 1;
    await url.save();

    res.json({ originalUrl: url.originalUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyUrls = async (req, res) => {
  try {
    const { search, category, tag, favorite, status, workspaceId, page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

    const query = {};

    if (workspaceId) {
      query.workspaceId = workspaceId;
    } else {
      query.userId = req.user._id;
      query.workspaceId = { $exists: false };
    }

    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: "i" } },
        { shortCode: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (favorite === "true") {
      query.isFavorite = true;
    }

    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === "asc" ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const urls = await Url.find(query)
      .sort(sortOptions)
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

const updateUrl = async (req, res) => {
  try {
    const { originalUrl, expiryDate, password, tags, category, isFavorite, status } = req.body;
    const url = await Url.findOne({ _id: req.params.id });

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
      return res.status(403).json({ message: "Not authorized to update this link" });
    }

    if (originalUrl) {
      if (!validator.isURL(originalUrl)) {
        return res.status(400).json({ message: "Invalid URL" });
      }
      url.originalUrl = originalUrl;
    }

    if (expiryDate !== undefined) {
      url.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    }

    if (password !== undefined) {
      if (password === "") {
        url.password = undefined;
      } else {
        const salt = await bcrypt.genSalt(10);
        url.password = await bcrypt.hash(password, salt);
      }
    }

    if (tags !== undefined) url.tags = tags;
    if (category !== undefined) url.category = category;
    if (isFavorite !== undefined) url.isFavorite = isFavorite;
    if (status !== undefined) url.status = status;

    await url.save();

    await AuditLog.create({
      userId: req.user._id,
      action: "UPDATE_URL",
      details: `Updated URL settings for short code: ${url.shortCode}`
    });

    res.json(url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id });

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
      return res.status(403).json({ message: "Not authorized to delete this link" });
    }

    await Visit.deleteMany({ urlId: url._id });
    await url.deleteOne();

    await AuditLog.create({
      userId: req.user._id,
      action: "DELETE_URL",
      details: `Deleted short URL code: ${url.shortCode}`
    });

    res.json({ message: "URL Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUrlById = async (req, res) => {
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

    res.json(url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createShortUrl,
  bulkCreateUrls,
  redirectUrl,
  unlockUrl,
  getMyUrls,
  updateUrl,
  deleteUrl,
  getUrlById
};