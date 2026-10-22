const asyncHandler = require("express-async-handler");
const GymCenter = require("../models/gymCenter");
const { onboardMail } = require("../services/emailService");
const GymOwner = require("../models/gymOwner");
const GymCounter = require("../models/gymCount");
const crypto = require("node:crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/aws_s3");
require("dotenv").config();

const profileImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const registerDocTypes = ["application/pdf"];
// function that helps to generating  a unique gym Id
const generateGymId = async (country) => {
  const counter = await GymCounter.findOneAndUpdate(
    { country },
    { $inc: { seq: 1 } },
    {
      returnDocument: "after",
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
    gymAddress,
    state,
    localGovernmentArea,
    country,
    businessPhone,
    businessEmail,
    businessRegistrationType,
    cacRegistrationNumber,
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

  const files = req.files || {};
  const gymLogoFile = files.gymLogo?.[0];
  const registrationDocumentFile = files.registrationDocument?.[0];

  if (!gymLogoFile) {
    return res.status(400).json({ message: "Please upload a gym logo" });
  }

  const registrationNumber =
    typeof cacRegistrationNumber === "string"
      ? cacRegistrationNumber.trim()
      : "";

  if (
    businessRegistrationType === "registered" &&
    (!registrationNumber || !registrationDocumentFile)
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

  if (businessRegistrationType === "unregistered" && registrationDocumentFile) {
    return res.status(400).json({
      message:
        "Registration documents can only be uploaded for registered businesses",
    });
  }

  const { fileTypeFromBuffer } = await import("file-type");
  const logoDetectedType = await fileTypeFromBuffer(gymLogoFile.buffer);
  if (!logoDetectedType || !profileImageTypes.includes(logoDetectedType.mime)) {
    return res.status(400).json({
      message: "Gym logo must be a valid JPEG, PNG, or WebP image",
    });
  }

  let documentDetectedType;
  if (registrationDocumentFile) {
    documentDetectedType = await fileTypeFromBuffer(
      registrationDocumentFile.buffer,
    );
    if (
      !documentDetectedType ||
      !registerDocTypes.includes(documentDetectedType.mime)
    ) {
      return res.status(400).json({
        message: "Registration document must be a valid PDF",
      });
    }
  }

  if (!process.env.AWS_S3_BUCKET) {
    throw new Error("AWS_S3_BUCKET is not configured");
  }

  const gymLogoKey = `gym-center/logo-images/${crypto.randomUUID()}.${logoDetectedType.ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: gymLogoKey,
      Body: gymLogoFile.buffer,
      ContentType: logoDetectedType.mime,
    }),
  );

  let registrationDocumentKey;
  if (registrationDocumentFile && documentDetectedType) {
    registrationDocumentKey = `gym-center/CAC-doc/${crypto.randomUUID()}.${documentDetectedType.ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: registrationDocumentKey,
        Body: registrationDocumentFile.buffer,
        ContentType: documentDetectedType.mime,
      }),
    );
  }

  const countryCode = country.slice(0, 3).toUpperCase();
  const gymId = await generateGymId(country);

  const gymCenter = await GymCenter.create({
    gymOwner_id: req.user.id,
    gym_Id: `GHUB-${countryCode}-${gymId}`,
    gymName,
    gymLogo: gymLogoKey,
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

  let emailSent = true;
  try {
    await onboardMail({
      gymOwner,
      gymCenter,
    });
  } catch (error) {
    emailSent = false;
    console.error("Gym center created, but onboarding email failed:", error);
  }

  await GymOwner.findByIdAndUpdate(
    req.user.id,
    { onboardingStatus: "completed" },
    { returnDocument: "after", runValidators: true },
  );

  return res.status(201).json({
    success: true,
    message: emailSent
      ? "Gym center created successfully"
      : "Gym center created, but the onboarding email could not be sent",
    emailSent,
    data: gymCenter,
  });
});

//Get gym centers by owner ID
exports.getGymCentersByOwnerId = async (req, res, next) => {
  try {
    const { ownerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({
        message: "Invalid gym owner ID",
      });
    }

    const gymCenters = await GymCenter.find({
      gymOwner_id: ownerId,
    });

    if (!gymCenters.length) {
      return res.status(404).json({
        message: "No gym centers found for this owner",
      });
    }

    return res.status(200).json({
      message: "Gym centers retrieved successfully",
      count: gymCenters.length,
      gymCenters,
    });
  } catch (error) {
    next(error);
  }
};
