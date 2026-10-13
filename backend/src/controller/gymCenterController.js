const asyncHandler = require("express-async-handler");
const { randomUUID } = require("crypto");
const GymCenter = require("../models/gymCenter");
const { onboardMail } = require("../services/emailService");
const GymOwner = require("../models/gymOwner");
const { findById } = require("../models/gymEmployee");

// Create a gym center
exports.createGymCenter = asyncHandler(async (req, res) => {
  const {
    gymName,
    gymLogo,
    gymAddress,
    state,
    localGovernmentArea,
    country,
    businessPhone,
    businessEmail,
    businessRegistrationType,
    cacRegistrationNumber,
    registrationDocument,
    description,
    socialMediaUrl,
  } = req.body;

  if (
    !gymName ||
    !gymAddress ||
    !state ||
    !localGovernmentArea ||
    !country ||
    !businessPhone ||
    !businessEmail ||
    !businessRegistrationType ||
    !description
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required gym center fields" });
  }

  if (businessRegistrationType === "registered" && !cacRegistrationNumber) {
    return res.status(400).json({
      message: "CAC registration number is required for a registered business",
    });
  }

  const gymCenter = await GymCenter.create({
    gymOwner_id: req.user.id,
    gym_Id: `GYM-${randomUUID().slice(0, 8).toUpperCase()}`,
    gymName,
    gymLogo,
    gymAddress,
    state,
    localGovernmentArea,
    country,
    businessPhone,
    businessEmail,
    businessRegistrationType,
    cacRegistrationNumber,
    registrationDocument,
    description,
    socialMediaUrl,
  });

  const gymOwner = await GymOwner.findById({ _id: req.user.id });
  await onboardMail({
    gymOwner,
    gymCenter,
  });

  return res.status(201).json({
    success: true,
    message: "Gym center created successfully",
    data: gymCenter,
  });
});
