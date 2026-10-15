const express = require("express");
const passwordResetMiddleware = require("../middleware/passwordResetMiddleware");

const {
  registerGymOwner,
  loginGymOwner,
  gymOwnerforgotPassword,
  validateOtp,
  gymOwnerResetPassword,
  logout,
} = require("../controller/gymOwnerAuthController");

const router = express.Router();

router.post("/register", registerGymOwner);
router.post("/login", loginGymOwner);
router.post("/forgot-password", gymOwnerforgotPassword);
router.post("/validate-otp", validateOtp);
router.post(
  "/reset-password",
  passwordResetMiddleware,
  gymOwnerResetPassword,
);
router.post("/logout", logout);

module.exports = router;
