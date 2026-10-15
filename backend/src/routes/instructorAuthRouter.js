const express = require("express");
const passwordResetMiddleware = require("../middleware/passwordResetMiddleware");
const {
  instructorLogin,
  validateOtp,
  instructorforgotPassword,
  instructorResetPassword,
  logout,
} = require("../controller/instructorAuthController");

const router = express.Router();

router.post("/login", instructorLogin);
router.post("/forgot-password", instructorforgotPassword);
router.post("/validate-otp", validateOtp);
router.post(
  "/reset-password",
  passwordResetMiddleware,
  instructorResetPassword,
);
router.post("/logout", logout);

module.exports = router;
