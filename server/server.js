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

/* -------------------- CORS FIX (IMPORTANT) -------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "https://shrink-url-shortener.vercel.app"
];

// allow ANY Vercel preview domain for your project
const isVercelPreview = (origin) =>
  /^https:\/\/shrink-url-shortener[-.].*\.vercel\.app$/.test(origin);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow tools like Postman, curl
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        isVercelPreview(origin)
      ) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      return callback(null, false); // IMPORTANT: DO NOT throw error
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// handle preflight requests
app.options("*", cors());

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(useragent.express());

/* -------------------- RATE LIMITING -------------------- */
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

/* -------------------- REDIRECT ROUTE -------------------- */
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