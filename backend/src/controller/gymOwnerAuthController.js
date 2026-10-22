const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const GymOwner = require("../models/gymOwner");
const { sendOtpEmail } = require("../services/emailService");

//genetate a token to use for authentication
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

// hashing my otp code
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// register gym Owner
exports.registerGymOwner = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      middlename,
      email,
      password,
      phone_no,
      address,
      state,
      country,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !phone_no ||
      !address ||
      !state ||
      !country
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //check if the email already exists
    const existingGymOwner = await GymOwner.findOne({ email });
    if (existingGymOwner) {
      return res.status(400).json({ message: "Email already exists" });
    }

    //hash the password
    const hashedPassword = await bcryptjs.hash(password, 12);

    //create a new gym owner
    const newGymOwner = new GymOwner({ ...req.body, password: hashedPassword });

    //save gymowner
    await newGymOwner.save();

    return res.status(201).json({
      success: true,
      message: "Gym owner registered successfully",
      token: signToken(newGymOwner),
    });
  } catch (error) {
    return next(error);
  }
};

// login gym owner
exports.loginGymOwner = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const gymOwner = await GymOwner.findOne({
      email: email.trim(),
    });

    if (!gymOwner) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcryptjs.compare(password, gymOwner.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: signToken(gymOwner),
    });
  } catch (error) {
    return next(error);
  }
};

//gymOwner forgot password
exports.gymOwnerforgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const gymOwner = await GymOwner.findOne({
      email: email.trim(),
    }).select("+otpCode +otpExpiresAt");

    if (!gymOwner) {
      return res.status(404).json({ message: "Gym owner not found" });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(otp);

    // Set OTP and expiration time (10 minutes)
    gymOwner.otpCode = hashedOtp;
    gymOwner.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await gymOwner.save();

    // Send OTP email to the gym owner
    await sendOtpEmail({
      email: gymOwner.email,
      otp,
      userName: `${gymOwner.firstname} ${gymOwner.lastname}`,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset code sent",
    });
  } catch (error) {
    return next(error);
  }
};

// validate OTP for gym owner
exports.validateOtp = async (req, res, next) => {
  try {
    const { otpCode } = req.body;

    if (!otpCode) {
      return res.status(400).json({ message: "OTP is required" });
    }
    const hashedOtp = hashOtp(otpCode);

    const gymOwner = await GymOwner.findOne({
      otpCode: hashedOtp,
      otpExpiresAt: { $gt: new Date() },
    }).select("+otpCode +otpExpiresAt");

    if (!gymOwner) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    //check if otp has expired
    if (!gymOwner.otpExpiresAt || gymOwner.otpExpiresAt <= new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and expiration time after successful validation
    gymOwner.otpCode = "";
    gymOwner.otpExpiresAt = undefined;
    await gymOwner.save();

    return res.status(200).json({
      success: true,
      message: "OTP validated successfully",
      token: signPasswordResetToken(gymOwner),
    });
  } catch (error) {
    return next(error);
  }
};

exports.gymOwnerResetPassword = async (req, res, next) => {
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

    if (req.user.role !== "Owner" || req.user.purpose !== "password_reset") {
      return res.status(403).json({
        message: "A valid gym owner password-reset token is required",
      });
    }
    const gymOwner = await GymOwner.findById(req.user.id);

    if (!gymOwner) {
      return res.status(404).json({ message: "Gym owner not found" });
    }

    // Update the password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    gymOwner.password = hashedPassword;
    await gymOwner.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return next(error);
  }
};

//gym owner logout
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
