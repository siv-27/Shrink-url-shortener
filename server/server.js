const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const useragent = require("express-useragent");

const connectDB = require("./config/db");
const { protect } = require("./middleware/authMiddleware");
const { apiLimiter, redirectLimiter } = require("./middleware/security");
const { redirectUrl } = require("./controllers/urlController");
const { getPublicStats } = require("./controllers/analyticsController");

dotenv.config();

connectDB();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(useragent.express());

app.use("/api", apiLimiter);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/url", require("./routes/urlRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/workspaces", require("./routes/workspaceRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.get("/api/public-stats/:shortCode", getPublicStats);

app.get("/", (req, res) => {
  res.send("Shrink API Running");
});

app.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

app.get("/:shortCode", redirectLimiter, redirectUrl);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});