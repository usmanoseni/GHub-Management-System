const express = require("express");
const {
  instructorLogin,
  validateOtp,
  instructorForgetPassword,
  instructorResetPassword,
  logout,
} = require("../controller/instructorAuthController");

const router = express.Router();

router.post("/login", instructorLogin);
router.post("/forgot-password", instructorForgetPassword);
router.post("/validate-otp", validateOtp);
router.post("/reset-password", instructorResetPassword);
router.post("/logout", logout);

module.exports = router;
