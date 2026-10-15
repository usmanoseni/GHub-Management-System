const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");
const { DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const GymEmployee = require("../models/gymEmployee");
const GymCenter = require("../models/gymCenter");
const GymBranch = require("../models/gymbranch");
const s3 = require("../config/aws_s3");

const profileImageTypes = ["image/jpeg", "image/png", "image/webp"];
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sanitizeEmployee = (employee) => {
  const result = employee.toObject();
  delete result.password;
  delete result.OtpCode;
  delete result.OtpExpiresAt;
  return result;
};

const findManagedEmployee = async (req, employeeId) => {
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return { error: { status: 400, message: "Invalid employee ID" } };
  }

  const employee = await GymEmployee.findById(employeeId);
  if (!employee) {
    return { error: { status: 404, message: "Gym employee not found" } };
  }

  if (req.user.role === "Owner") {
    const gym = await GymCenter.findOne({
      _id: employee.gym_id,
      gymOwner_id: req.user.id,
    });
    if (!gym) {
      return { error: { status: 404, message: "Gym employee not found" } };
    }
  } else if (req.user.role === "manager") {
    const manager = await GymEmployee.findOne({
      _id: req.user.id,
      role: "manager",
      accountStatus: "active",
    });
    if (
      !manager ||
      employee.role !== "receptionist" ||
      employee.gym_id.toString() !== manager.gym_id.toString() ||
      employee.branchcode.toString() !== manager.branchcode.toString()
    ) {
      return { error: { status: 403, message: "You cannot manage this employee" } };
    }
  } else {
    return { error: { status: 403, message: "You cannot manage employees" } };
  }

  return { employee };
};

exports.createGymEmployee = async (req, res, next) => {
  try {
    const {
      gym_id,
      branchcode,
      firstname,
      middlename,
      lastname,
      email,
      password,
      phone_no,
      address,
      state,
      country,
      role,
    } = req.body;

    if (
      typeof firstname !== "string" ||
      !firstname.trim() ||
      typeof lastname !== "string" ||
      !lastname.trim() ||
      typeof email !== "string" ||
      !isValidEmail(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8 ||
      !role
    ) {
      return res.status(400).json({
        message:
          "Provide all required fields and a valid email; password must be at least 8 characters",
      });
    }

    if (!["manager", "receptionist"].includes(role)) {
      return res.status(400).json({ message: "Invalid employee role" });
    }

    let employeeGymId;
    let employeeBranchId;
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
      employeeGymId = gym._id;
      employeeBranchId = branchcode;
    } else if (req.user.role === "manager") {
      const manager = await GymEmployee.findOne({
        _id: req.user.id,
        role: "manager",
        accountStatus: "active",
      });
      if (
        !manager ||
        role !== "receptionist" ||
        (gym_id && manager.gym_id.toString() !== String(gym_id)) ||
        (branchcode && manager.branchcode.toString() !== String(branchcode))
      ) {
        return res.status(403).json({
          message:
            "Managers can only add receptionists to their assigned branch",
        });
      }
      employeeGymId = manager.gym_id;
      employeeBranchId = manager.branchcode;
    } else {
      return res.status(403).json({
        message: "Only gym owners and branch managers can add gym employees",
      });
    }

    const branch = await GymBranch.findOne({
      _id: employeeBranchId,
      gymCenter_id: employeeGymId,
      status: "active",
    });
    if (!branch) {
      return res.status(404).json({ message: "Active branch not found for this gym" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const employee = await GymEmployee.create({
      gym_id: employeeGymId,
      branchcode: employeeBranchId,
      firstname: firstname.trim(),
      middlename,
      lastname: lastname.trim(),
      email: normalizedEmail,
      password: await bcryptjs.hash(password, 12),
      phone_no,
      address,
      state,
      country,
      role,
    });

    return res.status(201).json({
      message: "Employee created successfully",
      employee: sanitizeEmployee(employee),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An employee with this email already exists",
      });
    }
    return next(error);
  }
};

exports.getGymEmployeeProfile = async (req, res, next) => {
  try {
    const employee = await GymEmployee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: "Gym employee not found" });
    }
    return res.status(200).json({ employee: sanitizeEmployee(employee) });
  } catch (error) {
    return next(error);
  }
};

exports.updateGymEmployeeProfile = async (req, res, next) => {
  try {
    const employee = await GymEmployee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: "Gym employee not found" });
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
      updates[field] =
        field === "email" ? value.toLowerCase() : value;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one supported profile field to update",
      });
    }
    if (updates.email && !isValidEmail(updates.email)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    Object.assign(employee, updates);
    await employee.save();
    return res.status(200).json({
      message: "Employee profile updated successfully",
      employee: sanitizeEmployee(employee),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An employee with this email already exists",
      });
    }
    return next(error);
  }
};

exports.updateGymEmployeeProfileImg = async (req, res, next) => {
  let uploadedKey;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a profile image" });
    }

    const employee = await GymEmployee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: "Gym employee not found" });
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

    uploadedKey = `gym-employees/profile-images/${crypto.randomUUID()}.${detectedType.ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: uploadedKey,
        Body: req.file.buffer,
        ContentType: detectedType.mime,
      }),
    );

    const previousKey = employee.profile;
    employee.profile = uploadedKey;
    await employee.save();

    if (previousKey?.startsWith("gym-employees/profile-images/")) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: previousKey,
          }),
        );
      } catch (error) {
        console.error("Failed to delete previous employee profile image:", error);
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
        console.error("Failed to clean up uploaded employee image:", cleanupError);
      }
    }
    return next(error);
  }
};

exports.validateGymEmployeePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const employee = await GymEmployee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: "Gym employee not found" });
    }
    if (!(await bcryptjs.compare(password, employee.password))) {
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

exports.changeGymEmployeePassword = async (req, res, next) => {
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

    const employee = await GymEmployee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: "Gym employee not found" });
    }
    if (!(await bcryptjs.compare(currentPassword, employee.password))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    employee.password = await bcryptjs.hash(newPassword, 12);
    await employee.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
};

exports.updateEmployeeStatus = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or suspended",
      });
    }

    const result = await findManagedEmployee(req, employeeId);
    if (result.error) {
      return res.status(result.error.status).json({
        message: result.error.message,
      });
    }

    result.employee.accountStatus = status;
    await result.employee.save();
    return res.status(200).json({
      message:
        status === "suspended"
          ? "Gym employee suspended successfully"
          : "Gym employee reactivated successfully",
      employee: sanitizeEmployee(result.employee),
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteGymEmployee = async (req, res, next) => {
  try {
    const result = await findManagedEmployee(req, req.params.employeeId);
    if (result.error) {
      return res.status(result.error.status).json({
        message: result.error.message,
      });
    }

    await result.employee.deleteOne();
    return res.status(200).json({ message: "Gym employee deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
