const asyncHandler = require("express-async-handler");
const GymCenter = require("../models/gymCenter");
const { onboardMail } = require("../services/emailService");
const GymOwner = require("../models/gymOwner");
const GymCounter = require("../models/gymCount");

const generateGymId = async (country) => {
  const counter = await GymCounter.findOneAndUpdate(
    { country },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return `${String(counter.seq).padStart(6, "0")}`;
};

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

  const allowedRegistrationTypes = ["registered", "unregistered"];
  if (!allowedRegistrationTypes.includes(businessRegistrationType)) {
    return res.status(400).json({
      message: "Business registration type must be registered or unregistered",
    });
  }

  const registrationNumber =
    typeof cacRegistrationNumber === "string"
      ? cacRegistrationNumber.trim()
      : "";
  const registrationDocumentKey =
    typeof registrationDocument === "string"
      ? registrationDocument.trim()
      : "";

  if (
    businessRegistrationType === "registered" &&
    (!registrationNumber || !registrationDocumentKey)
  ) {
    return res.status(400).json({
      message:
        "CAC registration number and registration document are required for a registered business",
    });
  }

  if (
    businessRegistrationType === "registered" &&
    !/^(RC|BN)/i.test(registrationNumber)
  ) {
    return res.status(400).json({
      success: false,
      message: "CAC registration number must start with RC or BN",
    });
  }

  const countryCode = country.slice(0, 3).toUpperCase();
  const gymId = await generateGymId(country);

  const gymCenter = await GymCenter.create({
    gymOwner_id: req.user.id,
    gym_Id: `GHUB-${countryCode}-${gymId}`,
    gymName,
    gymLogo,
    gymAddress,
    state,
    localGovernmentArea,
    country,
    businessPhone,
    businessEmail,
    businessRegistrationType,
    cacRegistrationNumber: registrationNumber || undefined,
    registrationDocument: registrationDocumentKey || undefined,
    description,
    socialMediaUrl,
  });

  const gymOwner = await GymOwner.findById({ _id: req.user.id });

  await onboardMail({
    gymOwner,
    gymCenter,
  });

  await GymOwner.findByIdAndUpdate(
    req.user.id,
    { onboardingStatus: "completed" },
    { new: true, runValidators: true },
  );

  return res.status(201).json({
    success: true,
    message: "Gym center created successfully",
    data: gymCenter,
  });
});
