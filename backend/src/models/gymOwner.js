const mongoose = require("mongoose");

const gymOwnerSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },

    middlename: {
      type: String,
      trim: true,
    },

    lastname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
      maxlength: [128, "Password cannot exceed 128 characters"],
    },

    phone_no: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
    },
    profile: {
      type: String,
      trim: true,
    },
    OtpExpiresAt: {
      type: Date,
      select: false,
    },

    OtpCode: {
      type: String,
      default: "",
      select: false,
    },
    onboardingStatus: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    role: {
      type: String,
      default: "Owner",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("gymOwner", gymOwnerSchema);
