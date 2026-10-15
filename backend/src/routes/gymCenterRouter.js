const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createGymCenter } = require("../controller/gymCenterController");

const router = express.Router();

router.post("/", authMiddleware, createGymCenter);

module.exports = router;
