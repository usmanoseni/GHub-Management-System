const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const GymEmployee = require("../models/gymEmployee");
const { sendOtpEmail } = require("../services/emailService");

const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
const signPasswordResetToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      purpose: "password_reset",
    },
    process.env.JWT_SECRET,
    { expiresIn: "10m" },
  );

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

exports.gymEmployeeLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const gymEmployee = await GymEmployee.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!gymEmployee || gymEmployee.accountStatus !== "active") {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      gymEmployee.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: signToken(gymEmployee),
    });
  } catch (error) {
    return next(error);
  }
};

//gymEmployee forgot password
exports.gymEmployeeforgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const gymEmployee = await GymEmployee.findOne({
      email: email.trim().toLowerCase(),
    }).select("+OtpCode +OtpExpiresAt");

    if (!gymEmployee) {
      return res.status(404).json({ message: "gym employee not found" });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(otp);

    // Set OTP and expiration time (10 minutes)
    gymEmployee.OtpCode = hashedOtp;
    gymEmployee.OtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await gymEmployee.save();

    // Send OTP email to the gym gymEmployee
    await sendOtpEmail({
      email: gymEmployee.email,
      otp,
      userName: `${gymEmployee.firstname} ${gymEmployee.lastname}`,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset code sent",
    });
  } catch (error) {
    return next(error);
  }
};

// validate OTP for gymEmployee
exports.validateOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }
    const hashedOtp = hashOtp(otp);

    const gymEmployee = await GymEmployee.findOne({
      OtpCode: hashedOtp,
      OtpExpiresAt: { $gt: new Date() },
    }).select("+OtpCode +OtpExpiresAt");

    if (!gymEmployee) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    //check if otp has expired
    if (!gymEmployee.OtpExpiresAt || gymEmployee.OtpExpiresAt <= new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and expiration time after successful validation
    gymEmployee.OtpCode = "";
    gymEmployee.OtpExpiresAt = undefined;
    await gymEmployee.save();

    return res.status(200).json({
      success: true,
      message: "OTP validated successfully",
      token: signPasswordResetToken(gymEmployee),
    });
  } catch (error) {
    return next(error);
  }
};

exports.gymEmployeeResetPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Both new password and confirm password are required",
      });
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    if (
      !["manager", "receptionist"].includes(req.user.role) ||
      req.user.purpose !== "password_reset"
    ) {
      return res.status(403).json({
        message: "A valid gym employee password-reset token is required",
      });
    }
    const gymEmployee = await GymEmployee.findOne({
      _id: req.user.id,
      role: req.user.role,
      accountStatus: "active",
    });

    if (!gymEmployee) {
      return res.status(404).json({ message: "Gym employee not found" });
    }

    // Update the password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    gymEmployee.password = hashedPassword;
    await gymEmployee.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
