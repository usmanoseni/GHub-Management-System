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

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

exports.instructorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const instructor = await Instructors.findOne({ email: email });

    if (!instructor) {
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
    next(error);
  }
};

//instructor forgot password
exports.instructorforgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const instructor = await Instructors.findOne({ email });

    if (!instructor) {
      return res.status(404).json({ message: "instructor not found" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = hashOtp(otp);

    // Set OTP and expiration time (10 minutes)
    instructor.otpCode = hashedOtp;
    instructor.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Send OTP email to the instructor
    await sendOtpEmail({
      email: instructor.email,
      otp,
      userName: `${instructor.firstname} ${instructor.lastname}`,
    });

    //save the instructor with the OTP and expiration time
    await instructor.save();
  } catch (error) {
    next(error);
  }
};

// validate OTP for instructor
exports.validateOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }
    const hashedOtp = hashOtp(otp);

    const instructor = await Instructors.findOne({
      otpCode: hashedOtp,
      otpExpiresAt: { $gt: Date.now() },
    });

    if (!instructor) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    //check if otp has expired
    if (!instructor.otpExpiresAt || instructor.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and expiration time after successful validation
    instructor.otpCode = undefined;
    instructor.otpExpiresAt = undefined;
    await instructor.save();

    return res.status(200).json({
      success: true,
      message: "OTP validated successfully",
      token: signToken(instructor),
    });
  } catch (error) {
    next(error);
  }
};

exports.instructorResetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Both new password and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    const instructor = await Instructors.findById(req.user.id);

    if (!instructor) {
      return res.status(404).json({ message: "instructor not found" });
    }

    // Update the password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    instructor.password = hashedPassword;
    await instructor.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
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
