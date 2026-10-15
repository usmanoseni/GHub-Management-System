const express = require("express");
const {
  gymEmployeeLogin,
  validateOtp,
  gymEmployeeForgetPassword,
  gymEmployeeResetPassword,
  logout,
} = require("../controller/gymEmployeeAuthController");

const router = express.Router();

router.post("/login", gymEmployeeLogin);
router.post("/forgot-password", gymEmployeeForgetPassword);
router.post("/validate-otp", validateOtp);
router.post("/reset-password", gymEmployeeResetPassword);
router.post("/logout", logout);

module.exports = router;
