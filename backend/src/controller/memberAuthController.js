const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const Members = require("../models/Member");
const { sendOtpEmail } = require("../services/emailService");

const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

exports.memberLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const member = await Members.findOne({ email: email });

    if (!member) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcryptjs.compare(password, member.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: signToken(member),
    });
  } catch (error) {
    next(error);
  }
};

//member forgot password
exports.memberForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const member = await Members.findOne({ email });

    if (!member) {
      return res.status(404).json({ message: "member not found" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = hashOtp(otp);

    // Set OTP and expiration time (10 minutes)
    member.otpCode = hashedOtp;
    member.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Send OTP email to the member
    await sendOtpEmail({
      email: member.email,
      otp,
      userName: `${member.firstname} ${member.lastname}`,
    });

    //save the member with the OTP and expiration time
    await member.save();
  } catch (error) {
    next(error);
  }
};

// validate OTP for member
exports.validateOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }
    const hashedOtp = hashOtp(otp);

    const member = await Members.findOne({
      otpCode: hashedOtp,
      otpExpiresAt: { $gt: Date.now() },
    });

    if (!member) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    //check if otp has expired
    if (!member.otpExpiresAt || member.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and expiration time after successful validation
    member.otpCode = undefined;
    member.otpExpiresAt = undefined;
    await member.save();

    return res.status(200).json({
      success: true,
      message: "OTP validated successfully",
      token: signToken(member),
    });
  } catch (error) {
    next(error);
  }
};

exports.memberResetPassword = async (req, res) => {
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

    const member = await Members.findById(req.user.id);

    if (!member) {
      return res.status(404).json({ message: "member not found" });
    }

    // Update the password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    member.password = hashedPassword;
    await member.save();

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
