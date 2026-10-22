const mongoose = require("mongoose");
const GymCenter = require("../models/gymCenter");
const GymBranch = require("../models/gymbranch");

const identifierQuery = (identifier, publicField) => {
  if (typeof identifier !== "string" || !identifier.trim()) {
    return null;
  }

  const value = identifier.trim();
  if (mongoose.Types.ObjectId.isValid(value)) {
    return { _id: value };
  }

  return {
    [publicField]: publicField === "branchCode" ? value.toUpperCase() : value,
  };
};

const findGymCenter = async (identifier, ownerId) => {
  const query = identifierQuery(identifier, "gym_Id");
  if (!query) {
    return null;
  }

  if (ownerId) {
    query.gymOwner_id = ownerId;
  }
  return GymCenter.findOne(query);
};

const findGymBranch = async (identifier, gymCenterObjectId) => {
  const query = identifierQuery(identifier, "branchCode");
  if (!query) {
    return null;
  }

  query.gymCenter_id = gymCenterObjectId;
  return GymBranch.findOne(query);
};

const resolveGymBranch = async (gymIdentifier, branchIdentifier, ownerId) => {
  const gym = await findGymCenter(gymIdentifier, ownerId);
  if (!gym) {
    return { gym: null, branch: null };
  }

  const branch = await findGymBranch(branchIdentifier, gym._id);
  return { gym, branch };
};

module.exports = { findGymCenter, findGymBranch, resolveGymBranch };
