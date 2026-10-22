const bcryptjs = require("bcryptjs");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("node:crypto");
const Members = require("../models/Member");
const GymBranch = require("../models/gymbranch");
const GymEmployee = require("../models/gymEmployee");
const s3 = require("../config/aws_s3");
const {
  findGymCenter,
  findGymBranch,
  resolveGymBranch,
} = require("../utils/gymIdentifiers");

const profileImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.updateMemberProfileImg = async (req, res, next) => {
  let uploadedKey;
  try {
    if (req.user.role !== "member") {
      return res
        .status(403)
        .json({ message: "Member account access required" });
    }

    const profileImg = req.file;
    if (!profileImg) {
      return res.status(400).json({ message: "Please upload a profile image" });
    }

    const member = await Members.findOne({
      _id: req.user.id,
      role: "member",
      accountStatus: "active",
    });
    if (!member) {
      return res
        .status(404)
        .json({ message: "Active member account not found" });
    }

    const { fileTypeFromBuffer } = await import("file-type");
    const profileImgDetectedType = await fileTypeFromBuffer(profileImg.buffer);
    if (
      !profileImgDetectedType ||
      !profileImageTypes.includes(profileImgDetectedType.mime)
    ) {
      return res.status(400).json({
        message: "Profile image must be a valid JPEG, PNG, or WebP image",
      });
    }

    if (!process.env.AWS_S3_BUCKET) {
      throw new Error("AWS_S3_BUCKET is not configured");
    }

    const previousKey = member.profile;
    uploadedKey = `members/profile-images/${crypto.randomUUID()}.${profileImgDetectedType.ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: uploadedKey,
        Body: profileImg.buffer,
        ContentType: profileImgDetectedType.mime,
      }),
    );

    member.profile = uploadedKey;
    await member.save();
    const profileImgKey = uploadedKey;
    uploadedKey = undefined;

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
        console.error(
          "Failed to clean up uploaded member image:",
          cleanupError,
        );
      }
    }
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
};

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
    let memberGym;
    if (req.user.role === "Owner") {
      if (!gym_id || !branchcode) {
        return res.status(400).json({ message: "Invalid gym or branch ID" });
      }

      const { gym, branch } = await resolveGymBranch(
        gym_id,
        branchcode,
        req.user.id,
      );
      if (!gym) {
        return res.status(404).json({ message: "Gym center not found" });
      }
      if (!branch) {
        return res
          .status(404)
          .json({ message: "Branch not found for this gym" });
      }
      memberGym = gym;
      memberGymId = gym.gym_Id;
      memberBranchId = branch.branchCode;
    } else if (
      req.user.role === "manager" ||
      req.user.role === "receptionist"
    ) {
      const employee = await GymEmployee.findOne({
        _id: req.user.id,
        role: req.user.role,
        accountStatus: "active",
      });
      if (!employee) {
        return res.status(403).json({
          message: "Employees can only add members to their assigned branch",
        });
      }
      const assigned = await resolveGymBranch(
        employee.gym_id,
        employee.branchcode,
      );
      if (!assigned.gym || !assigned.branch) {
        return res.status(404).json({
          message: "The employee's assigned gym branch could not be found",
        });
      }

      const requestedGym = gym_id ? await findGymCenter(gym_id) : assigned.gym;
      const requestedBranch = branchcode
        ? await findGymBranch(branchcode, assigned.gym._id)
        : assigned.branch;
      if (
        !requestedGym ||
        !requestedBranch ||
        String(requestedGym._id) !== String(assigned.gym._id) ||
        String(requestedBranch._id) !== String(assigned.branch._id)
      ) {
        return res.status(403).json({
          message: "Employees can only add members to their assigned branch",
        });
      }
      memberGym = assigned.gym;
      memberGymId = assigned.gym.gym_Id;
      memberBranchId = assigned.branch.branchCode;
    } else {
      return res.status(403).json({
        message: "Only gym owners and active branch employees can add members",
      });
    }

    const branch = await GymBranch.findOne({
      branchCode: memberBranchId,
      gymCenter_id: memberGym._id,
      status: "active",
    });
    if (!branch) {
      return res
        .status(404)
        .json({ message: "Active branch not found for this gym" });
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

    const member = await Members.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    member.password = await bcryptjs.hash(newPassword, 12);
    await member.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
};
