const mongoose = require("mongoose");

const gymBranchCounterSchema = new mongoose.Schema({
  gym_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "gymCenter",
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

gymBranchCounterSchema.index({ gym_id: 1 }, { unique: true });

module.exports = mongoose.model("GymBranchCounter", gymBranchCounterSchema);
