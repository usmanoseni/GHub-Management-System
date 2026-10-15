const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const Instructors = require("../models/Instructor");
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

exports.instructorLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const instructor = await Instructors.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!instructor || instructor.accountStatus !== "active") {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      instructor.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: signToken(instructor),
    });
  } catch (error) {
    return next(error);
  }
};

//instructor forgot password
exports.instructorforgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const instructor = await Instructors.findOne({
      email: email.trim().toLowerCase(),
    }).select("+OtpCode +OtpExpiresAt");

    if (!instructor) {
      return res.status(404).json({ message: "instructor not found" });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(otp);

    // Set OTP and expiration time (10 minutes)
    instructor.OtpCode = hashedOtp;
    instructor.OtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await instructor.save();

    // Send OTP email to the instructor
    await sendOtpEmail({
      email: instructor.email,
      otp,
      userName: `${instructor.firstName} ${instructor.lastname}`,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset code sent",
    });
  } catch (error) {
    return next(error);
  }
};

// validate OTP for instructor
exports.validateOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }
    const hashedOtp = hashOtp(otp);

    const instructor = await Instructors.findOne({
      OtpCode: hashedOtp,
      OtpExpiresAt: { $gt: new Date() },
    }).select("+OtpCode +OtpExpiresAt");

    if (!instructor) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    //check if otp has expired
    if (!instructor.OtpExpiresAt || instructor.OtpExpiresAt <= new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and expiration time after successful validation
    instructor.OtpCode = "";
    instructor.OtpExpiresAt = undefined;
    await instructor.save();

    return res.status(200).json({
      success: true,
      message: "OTP validated successfully",
      token: signPasswordResetToken(instructor),
    });
  } catch (error) {
    return next(error);
  }
};

exports.instructorResetPassword = async (req, res, next) => {
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
      req.user.role !== "instructor" ||
      req.user.purpose !== "password_reset"
    ) {
      return res.status(403).json({
        message: "A valid instructor password-reset token is required",
      });
    }
    const instructor = await Instructors.findById(req.user.id);

    if (!instructor || instructor.accountStatus !== "active") {
      return res.status(404).json({ message: "instructor not found" });
    }

    // Update the password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    instructor.password = hashedPassword;
    await instructor.save();

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
