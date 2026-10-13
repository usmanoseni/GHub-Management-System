import mongoose from "mongoose";

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
      lowercase: true,
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
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

gymBranchSchema.index({ gymCenter_id: 1, branchCode: 1 }, { unique: true });

export default mongoose.model("GymBranch", gymBranchSchema);
