const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
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
router.post("/reset-password", authMiddleware, memberResetPassword);
router.post("/logout", logout);

module.exports = router;
