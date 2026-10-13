const mongoose = require("mongoose");

const gymCenterSchema = new mongoose.Schema(
  {
    gymOwner_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "gymOwner",
    },
    gym_Id: {
      type: String,
      required: true,
    },
    gymName: {
      type: String,
      required: [true, "Gym name is required"],
      trim: true,
      minlength: [2, "Gym name must be at least 2 characters"],
      maxlength: [100, "Gym name cannot exceed 100 characters"],
    },

    gymLogo: {
      type: String,
      default: null,
      trim: true,
    },

    gymAddress: {
      type: String,
      required: [true, "Gym address is required"],
      trim: true,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    localGovernmentArea: {
      type: String,
      required: [true, "Local government area is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    businessPhone: {
      type: String,
      required: [true, "Business phone number is required"],
      trim: true,
    },

    businessEmail: {
      type: String,
      required: [true, "Business email address is required"],
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid business email address",
      ],
    },
    businessRegistrationType: {
      type: String,
      enum: {
        values: ["registered", "unregistered"],
        message: "Registration type must be registered or unregistered",
      },
      required: [true, "Business registration type is required"],
    },

    cacRegistrationNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    registrationDocument: {
      type: String,
      default: null,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Gym description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    socialMediaUrl: {
      facebook: {
        type: String,
        default: null,
        trim: true,
      },
      instagram: {
        type: String,
        default: null,
        trim: true,
      },
      tiktok: {
        type: String,
        default: null,
        trim: true,
      },
      x: {
        type: String,
        default: null,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

gymCenterSchema.index({ gymOwner_id: 1, gym_Id: 1 });

module.exports = mongoose.model("gymCenter", gymCenterSchema);
