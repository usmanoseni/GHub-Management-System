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

exports.memberLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const member = await Members.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!member || member.accountStatus !== "active") {
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
    return next(error);
  }
};

exports.memberForgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const member = await Members.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!member) {
      return res.status(404).json({ message: "member not found" });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(otp);

    member.OtpCode = hashedOtp;
    member.OtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await member.save();
    await sendOtpEmail({
      email: member.email,
      otp,
      userName: `${member.firstName} ${member.lastname}`,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset code sent",
    });
  } catch (error) {
    return next(error);
  }
};

exports.validateOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }
    const hashedOtp = hashOtp(otp);

    const member = await Members.findOne({
      OtpCode: hashedOtp,
      OtpExpiresAt: { $gt: new Date() },
    });

    if (!member) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    //check if otp has expired
    if (!member.OtpExpiresAt || member.OtpExpiresAt <= new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    member.OtpCode = "";
    member.OtpExpiresAt = undefined;
    await member.save();

    return res.status(200).json({
      success: true,
      message: "OTP validated successfully",
      token: signToken(member),
    });
  } catch (error) {
    return next(error);
  }
};

exports.memberResetPassword = async (req, res, next) => {
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
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    if (req.user.role !== "member") {
      return res.status(403).json({ message: "Member account access required" });
    }

    const member = await Members.findById(req.user.id);

    if (!member || member.accountStatus !== "active") {
      return res.status(404).json({ message: "member not found" });
    }

    // Update the password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    member.password = hashedPassword;
    await member.save();

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
