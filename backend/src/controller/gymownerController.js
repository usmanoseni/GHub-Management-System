const bcryptjs = require("bcryptjs");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("node:crypto");
const GymOwner = require("../models/gymOwner");
const s3 = require("../config/aws_s3");

const profileImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.updateGymOwnerProfileImg = async (req, res, next) => {
  let uploadedKey;
  try {
    if (req.user.role !== "Owner") {
      return res.status(403).json({ message: "Gym owner access required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a profile image" });
    }

    const gymOwner = await GymOwner.findById(req.user.id);
    if (!gymOwner) {
      return res.status(404).json({ message: "Gym owner not found" });
    }

    const { fileTypeFromBuffer } = await import("file-type");
    const detectedType = await fileTypeFromBuffer(req.file.buffer);
    if (!detectedType || !profileImageTypes.includes(detectedType.mime)) {
      return res.status(400).json({
        message: "Profile image must be a valid JPEG, PNG, or WebP image",
      });
    }

    if (!process.env.AWS_S3_BUCKET) {
      throw new Error("AWS_S3_BUCKET is not configured");
    }

    uploadedKey = `gym-owners/profile-images/${crypto.randomUUID()}.${detectedType.ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: uploadedKey,
        Body: req.file.buffer,
        ContentType: detectedType.mime,
      }),
    );

    const previousKey = gymOwner.profile;
    gymOwner.profile = uploadedKey;
    await gymOwner.save();
    const profileImgKey = uploadedKey;
    uploadedKey = undefined;

    if (previousKey?.startsWith("gym-owners/profile-images/")) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: previousKey,
          }),
        );
      } catch (error) {
        console.error("Failed to delete previous owner profile image:", error);
      }
    }

    return res.status(200).json({
      message: "Profile image updated successfully",
      profile: profileImgKey,
    });
  } catch (error) {
    if (uploadedKey && process.env.AWS_S3_BUCKET) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: uploadedKey,
          }),
        );
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded owner image:", cleanupError);
      }
    }
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
};

const sanitizeGymOwner = (gymOwner) => {
  const result = gymOwner.toObject();
  delete result.password;
  delete result.otpCode;
  delete result.otpExpiresAt;
  return result;
};

exports.getGymOwnerProfile = async (req, res, next) => {
  try {
    const gymOwner = await GymOwner.findById(req.user.id);
    if (!gymOwner) {
      return res.status(404).json({ message: "Gym owner not found" });
    }
    return res.status(200).json({ gymOwner: sanitizeGymOwner(gymOwner) });
  } catch (error) {
    return next(error);
  }
};

exports.updateGymOwnerProfile = async (req, res, next) => {
  try {
    const gymOwner = await GymOwner.findById(req.user.id);
    if (!gymOwner) {
      return res.status(404).json({ message: "Gym owner not found" });
    }

    const allowedFields = [
      "firstname",
      "middlename",
      "lastname",
      "email",
      "phone_no",
      "address",
      "state",
      "country",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] === undefined) continue;
      if (typeof req.body[field] !== "string") {
        return res.status(400).json({ message: `${field} must be a string` });
      }
      const value = req.body[field].trim();
      if (["firstname", "lastname", "email"].includes(field) && !value) {
        return res.status(400).json({ message: `${field} cannot be empty` });
      }
      updates[field] = field === "email" ? value.toLowerCase() : value;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one supported profile field to update",
      });
    }
    if (updates.email && !isValidEmail(updates.email)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    Object.assign(gymOwner, updates);
    await gymOwner.save();
    return res.status(200).json({
      success: true,
      message: "Gym owner profile updated successfully",
      gymOwner: sanitizeGymOwner(gymOwner),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    return next(error);
  }
};

exports.validateGymOwnerPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const gymOwner = await GymOwner.findById(req.user.id);
    if (!gymOwner) {
      return res.status(404).json({ message: "Gym owner not found" });
    }
    if (!(await bcryptjs.compare(password, gymOwner.password))) {
      return res.status(401).json({ message: "Invalid password" });
    }
    return res.status(200).json({
      success: true,
      message: "Password validated successfully",
    });
  } catch (error) {
    return next(error);
  }
};

exports.changeGymOwnerPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        message:
          "Current password, new password, and confirmation are required",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const gymOwner = await GymOwner.findById(req.user.id);
    if (!gymOwner) {
      return res.status(404).json({ message: "Gym owner not found" });
    }

    gymOwner.password = await bcryptjs.hash(newPassword, 12);
    await gymOwner.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
};
