const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    originalUrl: {
      type: String,
      required: true
    },
    shortCode: {
      type: String,
      required: true,
      unique: true
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true
    },
    password: {
      type: String
    },
    expiryDate: {
      type: Date
    },
    clicks: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["active", "disabled", "expired"],
      default: "active"
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    tags: [
      {
        type: String
      }
    ],
    category: {
      type: String,
      default: ""
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Url", urlSchema);