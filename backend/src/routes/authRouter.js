const express = require("express");

const {
  registerGymOwner,
  loginGymOwner,
  gymOwnerforgotPassword,
  validateOtp,
  gymOwnerResetPassword,
} = require("../controller/gymOwnerAuthController");

const router = express.Router();

router.post("/register", registerGymOwner);
router.post("/login", loginGymOwner);
router.post("/forgot-password", gymOwnerforgotPassword);
router.post("/validate-otp", validateOtp);
router.post("/reset-password", gymOwnerResetPassword);

module.exports = router;
