const mongoose = require("mongoose");

const gymBranchSchema = new mongoose.Schema(
  {
    gymCenter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GymCenter",
      required: true,
    },

    branchName: {
      type: String,
      required: true,
      trim: true,
    },

    branchCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    email: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, default: "Nigeria", trim: true },
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

gymBranchSchema.index({ gymCenter_id: 1, branchCode: 1 }, { unique: true });

module.exports = mongoose.model("GymBranch", gymBranchSchema);
