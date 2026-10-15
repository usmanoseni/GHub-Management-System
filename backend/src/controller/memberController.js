const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");
const { DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const Members = require("../models/Member");
const GymCenter = require("../models/gymCenter");
const GymBranch = require("../models/gymbranch");
const GymEmployee = require("../models/gymEmployee");
const s3 = require("../config/aws_s3");

const profileImageTypes = ["image/jpeg", "image/png", "image/webp"];
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sanitizeMember = (member) => {
  const result = member.toObject();
  delete result.password;
  delete result.OtpCode;
  delete result.OtpExpiresAt;
  return result;
};

exports.createMember = async (req, res, next) => {
  try {
    const {
      gym_id,
      branchcode,
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

    if (
      typeof firstName !== "string" ||
      !firstName.trim() ||
      typeof lastname !== "string" ||
      !lastname.trim() ||
      typeof email !== "string" ||
      !isValidEmail(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Provide first name, last name, a valid email, and a password of at least 8 characters",
      });
    }

    let memberGymId;
    let memberBranchId;
    if (req.user.role === "Owner") {
      if (
        !mongoose.Types.ObjectId.isValid(gym_id) ||
        !mongoose.Types.ObjectId.isValid(branchcode)
      ) {
        return res.status(400).json({ message: "Invalid gym or branch ID" });
      }

      const gym = await GymCenter.findOne({
        _id: gym_id,
        gymOwner_id: req.user.id,
      });
      if (!gym) {
        return res.status(404).json({ message: "Gym center not found" });
      }
      memberGymId = gym._id;
      memberBranchId = branchcode;
    } else if (
      req.user.role === "manager" ||
      req.user.role === "receptionist"
    ) {
      const employee = await GymEmployee.findOne({
        _id: req.user.id,
        role: req.user.role,
        accountStatus: "active",
      });
      if (
        !employee ||
        (gym_id && employee.gym_id.toString() !== String(gym_id)) ||
        (branchcode && employee.branchcode.toString() !== String(branchcode))
      ) {
        return res.status(403).json({
          message: "Employees can only add members to their assigned branch",
        });
      }
      memberGymId = employee.gym_id;
      memberBranchId = employee.branchcode;
    } else {
      return res.status(403).json({
        message: "Only gym owners and active branch employees can add members",
      });
    }

    const branch = await GymBranch.findOne({
      _id: memberBranchId,
      gymCenter_id: memberGymId,
      status: "active",
    });
    if (!branch) {
      return res.status(404).json({ message: "Active branch not found for this gym" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingMember = await Members.findOne({ email: normalizedEmail });
    if (existingMember) {
      return res.status(409).json({
        message: "A member with this email already exists",
      });
    }

    const member = await Members.create({
      gym_id: memberGymId,
      branchcode: memberBranchId,
      firstName: firstName.trim(),
      middlename,
      lastname: lastname.trim(),
      email: normalizedEmail,
      password: await bcryptjs.hash(password, 12),
      phone_no,
      address,
      state,
      country,
    });

    return res.status(201).json({
      message: "Member created successfully",
      member: sanitizeMember(member),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A member with this email already exists",
      });
    }
    return next(error);
  }
};

exports.getMemberProfile = async (req, res, next) => {
  try {
    const member = await Members.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    return res.status(200).json({ member: sanitizeMember(member) });
  } catch (error) {
    return next(error);
  }
};

exports.updateMemberProfile = async (req, res, next) => {
  try {
    const member = await Members.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
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
      if (req.body[field] === undefined) continue;
      if (typeof req.body[field] !== "string") {
        return res.status(400).json({ message: `${field} must be a string` });
      }
      const value = req.body[field].trim();
      if (["firstName", "lastname", "email"].includes(field) && !value) {
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

    Object.assign(member, updates);
    await member.save();
    return res.status(200).json({
      message: "Member profile updated successfully",
      member: sanitizeMember(member),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A member with this email already exists",
      });
    }
    return next(error);
  }
};

exports.updateMemberProfileImg = async (req, res, next) => {
  let uploadedKey;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a profile image" });
    }

    const member = await Members.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
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

    uploadedKey = `members/profile-images/${crypto.randomUUID()}.${detectedType.ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: uploadedKey,
        Body: req.file.buffer,
        ContentType: detectedType.mime,
      }),
    );

    const previousKey = member.profile;
    member.profile = uploadedKey;
    await member.save();

    if (previousKey?.startsWith("members/profile-images/")) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: previousKey,
          }),
        );
      } catch (error) {
        console.error("Failed to delete previous member profile image:", error);
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
        console.error("Failed to clean up uploaded member image:", cleanupError);
      }
    }
    return next(error);
  }
};

exports.validateMemberPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const member = await Members.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    if (!(await bcryptjs.compare(password, member.password))) {
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

exports.changeMemberPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Current password, new password, and confirmation are required",
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

    const member = await Members.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    if (!(await bcryptjs.compare(currentPassword, member.password))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    member.password = await bcryptjs.hash(newPassword, 12);
    await member.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
};
