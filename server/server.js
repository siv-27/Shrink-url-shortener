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

/* -------------------- SECURITY -------------------- */
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

/* -------------------- CORS -------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "https://shrink-url-shortener.vercel.app  "
];

// allow all vercel previews + localhost
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        origin.includes("localhost") ||
        origin.includes("vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(null, true); // allow (safe for dev + debugging)
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// IMPORTANT: DO NOT use app.options("*")

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(useragent.express());

/* -------------------- RATE LIMIT -------------------- */
app.use("/api", apiLimiter);

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/url", require("./routes/urlRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/workspaces", require("./routes/workspaceRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

/* -------------------- PUBLIC ROUTES -------------------- */
app.get("/api/public-stats/:shortCode", getPublicStats);

app.get("/", (req, res) => {
  res.send("Shrink API Running 🚀");
});

app.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

/* -------------------- REDIRECT -------------------- */
app.get("/:shortCode", redirectLimiter, redirectUrl);

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});