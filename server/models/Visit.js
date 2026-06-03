const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Url",
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String,
    default: ""
  },
  country: {
    type: String,
    default: "Unknown"
  },
  city: {
    type: String,
    default: "Unknown"
  },
  browser: {
    type: String,
    default: "Unknown"
  },
  device: {
    type: String,
    default: "Desktop"
  },
  os: {
    type: String,
    default: "Unknown"
  },
  referrer: {
    type: String,
    default: "Direct"
  }
});

module.exports = mongoose.model("Visit", visitSchema);