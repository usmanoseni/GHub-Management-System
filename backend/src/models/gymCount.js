const mongoose = require("mongoose");

const gymCounterSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

gymCounterSchema.index({ country: 1 }, { unique: true });

module.exports = mongoose.model("GymCounter", gymCounterSchema);
