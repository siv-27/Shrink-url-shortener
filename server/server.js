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

const allowedOrigins = [
  "http://localhost:5173",
  "https://shrink-url-shortener-o6f6ekec9-siv-27s-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(null, false); // IMPORTANT: do NOT throw error
    }
  },
  credentials: true
}));

app.options("*", cors());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
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