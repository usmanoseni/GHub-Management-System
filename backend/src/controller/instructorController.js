const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
// const mongoose = require("mongoose");
const { DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const Instructors = require("../models/Instructor");
const GymCenter = require("../models/gymCenter");
const GymBranch = require("../models/gymbranch");
const GymEmployee = require("../models/gymEmployee");
const s3 = require("../config/aws_s3");
require("dotenv").config();

const profileImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const handleInstructorError = (res, next, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "An instructor with this email already exists",
    });
  }
  return next(error);
};

const findOwnedGym = async (gymId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(gymId)) {
    return { error: { status: 400, message: "Invalid gym ID" } };
  }

  const gym = await GymCenter.findOne({ _id: gymId, gymOwner_id: userId });
  return gym
    ? { gym }
    : { error: { status: 404, message: "Gym center not found" } };
};

const sanitizeInstructor = (instructor) => {
  const result = instructor.toObject();
  delete result.password;
  delete result.OtpCode;
  delete result.OtpExpiresAt;
  return result;
};

exports.createInstructor = async (req, res, next) => {
  try {
    const {
      gym_id,
      branchcode,
      firstname,
      firstName,
      middlename,
      lastname,
      email,
      password,
      phone_no,
      address,
      state,
      country,
    } = req.body;
    const instructorFirstName = firstName || firstname;

    if (
      !instructorFirstName ||
      !lastname ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Provide all required fields and a password of at least 8 characters",
      });
    }
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    let instructorGymId;
    let instructorBranchId;
    if (req.user.role === "Owner") {
      if (
        !mongoose.Types.ObjectId.isValid(gym_id) ||
        !mongoose.Types.ObjectId.isValid(branchcode)
      ) {
        return res.status(400).json({
          message: "A valid gym and branch ID are required",
        });
      }
      const gymResult = await findOwnedGym(gym_id, req.user.id);
      if (gymResult.error) {
        return res.status(gymResult.error.status).json({
          message: gymResult.error.message,
        });
      }
      instructorGymId = gym_id;
      instructorBranchId = branchcode;
    } else if (
      req.user.role === "manager" ||
      req.user.role === "receptionist"
    ) {
      const manager = await GymEmployee.findOne({
        _id: req.user.id,
        role: req.user.role,
        accountStatus: "active",
      });
      if (
        !manager ||
        (gym_id && manager.gym_id.toString() !== String(gym_id)) ||
        (branchcode && manager.branchcode.toString() !== String(branchcode))
      ) {
        return res.status(403).json({
          message:
            "Employees can only add instructors to their assigned branch",
        });
      }
      instructorGymId = manager.gym_id;
      instructorBranchId = manager.branchcode;
    } else {
      return res.status(403).json({
        message:
          "Only gym owners, managers, and receptionists can add instructors",
      });
    }

    const branch = await GymBranch.findOne({
      _id: instructorBranchId,
      gymCenter_id: instructorGymId,
      status: "active",
    });
    if (!branch) {
      return res.status(400).json({
        message: "The selected branch does not belong to this gym",
      });
    }

    const normalizedEmail = email.trim();
    const existingInstructor = await Instructors.findOne({
      email: normalizedEmail,
    });
    if (existingInstructor) {
      return res.status(409).json({
        message: "An instructor with this email already exists",
      });
    }

    const instructor = await Instructors.create({
      gym_id: instructorGymId,
      branchcode: instructorBranchId,
      firstName: instructorFirstName,
      middlename,
      lastname,
      email: normalizedEmail,
      password: await bcryptjs.hash(password, 12),
      phone_no,
      address,
      state,
      country,
    });

    return res.status(201).json({
      message: "Instructor created successfully",
      instructor: sanitizeInstructor(instructor),
    });
  } catch (error) {
    return handleInstructorError(res, next, error);
  }
};

exports.getInstructorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }

    const instructor = await Instructors.findById(id).select(
      "-password -OtpCode -OtpExpiresAt",
    );
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    if (req.user.role !== "Owner" && req.user.id !== instructor.id) {
      return res
        .status(403)
        .json({ message: "You cannot access this profile" });
    }

    if (req.user.role === "Owner") {
      const gym = await GymCenter.findOne({
        _id: instructor.gym_id,
        gymOwner_id: req.user.id,
      });
      if (!gym) {
        return res.status(404).json({ message: "Instructor not found" });
      }
    }

    return res.status(200).json({ instructor });
  } catch (error) {
    return next(error);
  }
};

exports.updateInstructorProfile = async (req, res, next) => {
  try {
    const instructor = await Instructors.findById(req.user.id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const allowedFields = [
      "firstName",
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
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string" || !req.body[field].trim()) {
          return res.status(400).json({
            message: `${field} must be a non-empty string`,
          });
        }
        updates[field] =
          field === "email" && typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one profile field to update",
      });
    }
    if (updates.email && !isValidEmail(updates.email)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    Object.assign(instructor, updates);
    await instructor.save();

    return res.status(200).json({
      message: "Instructor profile updated successfully",
      instructor: sanitizeInstructor(instructor),
    });
  } catch (error) {
    return handleInstructorError(res, next, error);
  }
};

exports.updateInstructorProfileImg = async (req, res, next) => {
  let uploadedKey;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a profile image" });
    }

    const instructor = await Instructors.findById(req.user.id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
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

    uploadedKey = `instructors/profile-images/${crypto.randomUUID()}.${detectedType.ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: uploadedKey,
        Body: req.file.buffer,
        ContentType: detectedType.mime,
      }),
    );

    const previousKey = instructor.profile;
    instructor.profile = uploadedKey;
    await instructor.save();

    if (previousKey?.startsWith("instructors/profile-images/")) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: previousKey,
          }),
        );
      } catch (error) {
        console.error(
          "Failed to delete previous instructor profile image:",
          error,
        );
      }
    }

    return res.status(200).json({
      message: "Profile image updated successfully",
      profile: uploadedKey,
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
        console.error(
          "Failed to clean up uploaded instructor image:",
          cleanupError,
        );
      }
    }
    return next(error);
  }
};

exports.validateInstructorPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const instructor = await Instructors.findById(req.user.id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const isValid = await bcryptjs.compare(password, instructor.password);
    if (!isValid) {
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

exports.changeInstructorPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
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

    const instructor = await Instructors.findById(req.user.id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    if (!(await bcryptjs.compare(currentPassword, instructor.password))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    instructor.password = await bcryptjs.hash(newPassword, 12);
    await instructor.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
};

exports.updateInstructorStatus = async (req, res, next) => {
  try {
    const { instructorId } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }
    if (!["active", "suspended", "blocked"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active, suspended, or blocked",
      });
    }

    const instructor = await Instructors.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    const gymResult = await findOwnedGym(instructor.gym_id, req.user.id);
    if (gymResult.error) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    instructor.accountStatus = status;
    await instructor.save();
    return res.status(200).json({
      message: `Instructor ${status === "active" ? "reactivated" : status} successfully`,
      instructor: sanitizeInstructor(instructor),
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteInstructor = async (req, res, next) => {
  try {
    const { instructorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }

    const instructor = await Instructors.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    const gymResult = await findOwnedGym(instructor.gym_id, req.user.id);
    if (gymResult.error) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    await instructor.deleteOne();
    return res.status(200).json({ message: "Instructor deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
