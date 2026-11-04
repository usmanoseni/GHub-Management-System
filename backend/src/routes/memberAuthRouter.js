const express = require("express");
const passwordResetMiddleware = require("../middleware/passwordResetMiddleware");
const {
  memberLogin,
  validateOtp,
  memberForgetPassword,
  memberResetPassword,
  logout,
} = require("../controller/memberAuthController");

const router = express.Router();

router.post("/login", memberLogin);
router.post("/forgot-password", memberForgetPassword);
router.post("/validate-otp", validateOtp);
router.post("/reset-password", passwordResetMiddleware, memberResetPassword);
router.post("/logout", logout);

module.exports = router;
