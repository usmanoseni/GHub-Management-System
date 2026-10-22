const mongoose = require("mongoose");
const GymBranch = require("../models/gymbranch");
const GymBranchCounter = require("../models/gymBranchCounter");
const GymCenter = require("../models/gymCenter");

const getOwnedGym = async (gymCenterId, ownerId) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(gymCenterId);
  if (
    (!isObjectId && typeof gymCenterId !== "string") ||
    (typeof gymCenterId === "string" && !gymCenterId.trim())
  ) {
    return { error: { status: 400, message: "Invalid gym center ID" } };
  }

  const gymCenter = await GymCenter.findOne({
    ...(isObjectId ? { _id: gymCenterId } : { gym_Id: gymCenterId }),
    gymOwner_id: ownerId,
  });
  return gymCenter
    ? { gymCenter }
    : { error: { status: 404, message: "Gym center not found" } };
};
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.generateGymBranchCode = async (gymId) => {
  try {
    const counter = await GymBranchCounter.findOneAndUpdate(
      { gym_id: gymId },
      { $inc: { seq: 1 } },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    return String(counter.seq).padStart(3, "0");
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }

    const counter = await GymBranchCounter.findOneAndUpdate(
      { gym_id: gymId },
      { $inc: { seq: 1 } },
      { returnDocument: "after" },
    );
    if (!counter) {
      throw error;
    }
    return String(counter.seq).padStart(3, "0");
  }
};

// create a gym branch
exports.createGymBranch = async (req, res, next) => {
  try {
    const { gymCenter_id, branchName, email, phone, address } = req.body;
    if (
      !gymCenter_id ||
      typeof branchName !== "string" ||
      !branchName.trim() ||
      typeof address?.street !== "string" ||
      !address.street.trim() ||
      typeof address?.city !== "string" ||
      !address.city.trim() ||
      typeof address?.state !== "string" ||
      !address.state.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all required branch details",
      });
    }
    if (
      email !== undefined &&
      (typeof email !== "string" || !isValidEmail(email))
    ) {
      return res
        .status(400)
        .json({ message: "Please provide a valid branch email" });
    }

    const gymResult = await getOwnedGym(gymCenter_id, req.user.id);
    if (gymResult.error) {
      return res.status(gymResult.error.status).json({
        message: gymResult.error.message,
      });
    }

    const gymCenterObjectId = gymResult.gymCenter._id;
    const branchCode = `BR-${await exports.generateGymBranchCode(gymCenterObjectId)}`;
    const gymBranch = await GymBranch.create({
      gymCenter_id: gymCenterObjectId,
      branchName,
      branchCode,
      email,
      phone,
      address,
    });

    return res.status(201).json({
      message: "Gym branch created successfully",
      gymBranch,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This branch code already exists for this gym",
      });
    }
    return next(error);
  }
};

// get gym branch by id
exports.getBranchesByGymCenter = async (req, res, next) => {
  try {
    const { gymCenterId } = req.params;
    const gymResult = await getOwnedGym(gymCenterId, req.user.id);
    if (gymResult.error) {
      return res.status(gymResult.error.status).json({
        message: gymResult.error.message,
      });
    }

    const branches = await GymBranch.find({
      gymCenter_id: gymResult.gymCenter._id,
    }).sort({ branchName: 1 });
    return res.status(200).json({
      message: "Branches retrieved successfully",
      count: branches.length,
      branches,
    });
  } catch (error) {
    return next(error);
  }
};

//update gym branch
exports.updateBranchById = async (req, res, next) => {
  try {
    const { branchCode } = req.params;
    let branch;
    if (mongoose.Types.ObjectId.isValid(branchCode)) {
      branch = await GymBranch.findById(branchCode);
    } else {
      const gymCenterIds = await GymCenter.distinct("_id", {
        gymOwner_id: req.user.id,
      });
      const matchingBranches = await GymBranch.find({
          branchCode: branchCode.toUpperCase(),
          gymCenter_id: { $in: gymCenterIds },
        });
      if (matchingBranches.length > 1) {
        return res.status(409).json({
          message: "Branch code is ambiguous; use the branch MongoDB ID",
        });
      }
      branch = matchingBranches[0];
    }

    if (!branch) {
      return res.status(404).json({ message: "Gym branch not found" });
    }

    const gymResult = await getOwnedGym(branch.gymCenter_id, req.user.id);
    if (gymResult.error) {
      return res.status(404).json({ message: "Gym branch not found" });
    }

    const { branchName, email, phone, address } = req.body;
    const updates = {};
    if (branchName !== undefined) {
      if (typeof branchName !== "string" || !branchName.trim()) {
        return res.status(400).json({ message: "Branch name cannot be empty" });
      }
      updates.branchName = branchName;
    }
    if (email !== undefined) {
      if (typeof email !== "string" || !isValidEmail(email)) {
        return res
          .status(400)
          .json({ message: "Please provide a valid branch email" });
      }
      updates.email = email;
    }
    if (phone !== undefined) {
      if (typeof phone !== "string" || !phone.trim()) {
        return res
          .status(400)
          .json({ message: "Branch phone cannot be empty" });
      }
      updates.phone = phone;
    }
    if (address !== undefined) {
      if (!address || typeof address !== "object" || Array.isArray(address)) {
        return res.status(400).json({ message: "Address must be an object" });
      }
      const allowedAddressFields = ["street", "city", "state", "country"];
      if (
        Object.keys(address).some(
          (field) => !allowedAddressFields.includes(field),
        )
      ) {
        return res
          .status(400)
          .json({ message: "Address contains an unsupported field" });
      }
      updates.address = { ...branch.address.toObject(), ...address };
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one valid field to update",
      });
    }

    Object.assign(branch, updates);
    await branch.save();
    return res.status(200).json({
      message: "Gym branch updated successfully",
      branch,
    });
  } catch (error) {
    return next(error);
  }
};

// update gym branch  status
exports.updateBranchStatus = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ message: "Invalid branch ID" });
    }
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or suspended",
      });
    }

    const branch = await GymBranch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: "Gym branch not found" });
    }
    const gymResult = await getOwnedGym(branch.gymCenter_id, req.user.id);
    if (gymResult.error) {
      return res.status(404).json({ message: "Gym branch not found" });
    }

    branch.status = status;
    await branch.save();
    return res.status(200).json({
      message:
        status === "suspended"
          ? "Gym branch suspended successfully"
          : "Gym branch reactivated successfully",
      branch,
    });
  } catch (error) {
    return next(error);
  }
};
