const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const gymCenterUpload = require("../middleware/gymCenterUpload");
const { createGymCenter } = require("../controller/gymCenterController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  gymCenterUpload,
  createGymCenter,
);

module.exports = router;
