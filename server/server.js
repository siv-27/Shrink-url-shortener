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

// 1. Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// 2. CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://shrink-url-shortener.vercel.app" // Your main production domain
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // This regex matches ANY vercel subdomain starting with "shrink-url-shortener"
    // It safely covers: shrink-url-shortener-oi0jae6lg... AND shrink-url-shortener-git-main...
    const isVercelDomain = /^https:\/\/shrink-url-shortener[-.].*\.vercel\.app$/.test(origin);

    if (allowedOrigins.includes(origin) || isVercelDomain) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight OPTIONS requests globally
app.options("*", cors());

// 3. Body Parsers & Parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(useragent.express());

// 4. Global Rate Limiter for API paths
app.use("/api", apiLimiter);

// 5. API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/url", require("./routes/urlRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/workspaces", require("./routes/workspaceRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Public API endpoints
app.get("/api/public-stats/:shortCode", getPublicStats);

app.get("/", (req, res) => {
  res.send("Shrink API Running");
});

app.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

// 6. Dynamic Redirect Route (Wildcard fallback for shortened links)
app.get("/:shortCode", redirectLimiter, redirectUrl);

// 7. Centralized Error Handling Middleware
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