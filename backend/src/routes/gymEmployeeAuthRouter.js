const express = require("express");
const passwordResetMiddleware = require("../middleware/passwordResetMiddleware");
const {
  gymEmployeeLogin,
  validateOtp,
  gymEmployeeforgotPassword,
  gymEmployeeResetPassword,
  logout,
} = require("../controller/gymEmployeeAuthController");

const router = express.Router();

router.post("/login", gymEmployeeLogin);
router.post("/forgot-password", gymEmployeeforgotPassword);
router.post("/validate-otp", validateOtp);
router.post(
  "/reset-password",
  passwordResetMiddleware,
  gymEmployeeResetPassword,
);
router.post("/logout", logout);

module.exports = router;
