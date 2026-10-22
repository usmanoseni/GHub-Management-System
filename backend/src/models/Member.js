const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    gym_id: {
      type: String,
      required: true,
      trim: true,
    },
    branchcode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
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
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
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

    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    role: {
      type: String,
      default: "member",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Member", memberSchema);
