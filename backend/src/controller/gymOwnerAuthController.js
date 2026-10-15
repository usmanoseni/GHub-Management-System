const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const GymOwner = require("../models/gymOwner");

const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// register gym Owner
exports.registerGymOwner = async (req, res) => {
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
    next(error);
  }
};

// login gym owner
exports.loginGymOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const gymOwner = await GymOwner.findOne({ email: email });

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
    next(error);
  }
};

//gymOwner forgot password
exports.gymOwnerforgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const gymOwner = await GymOwner.findOne({ email });

    if (!gymOwner) {
      return res.status(404).json({ message: "Gym owner not found" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = hashOtp(otp);

    // Set OTP and expiration time (10 minutes)
    gymOwner.otpCode = hashedOtp;
    gymOwner.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Send OTP email to the gym owner
    await sendOtpEmail({
      email: gymOwner.email,
      otp,
      userName: `${gymOwner.firstname} ${gymOwner.lastname}`,
    });

    //save the gym owner with the OTP and expiration time
    await gymOwner.save();
  } catch (error) {
    next(error);
  }
};

// validate OTP for gym owner
exports.validateOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }
    const hashedOtp = hashOtp(otp);

    const gymOwner = await GymOwner.findOne({
      otpCode: hashedOtp,
      otpExpiresAt: { $gt: Date.now() },
    });

    if (!gymOwner) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    //check if otp has expired
    if (!gymOwner.otpExpiresAt || gymOwner.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and expiration time after successful validation
    gymOwner.otpCode = undefined;
    gymOwner.otpExpiresAt = undefined;
    await gymOwner.save();

    return res.status(200).json({
      success: true,
      message: "OTP validated successfully",
      token: signToken(gymOwner),
    });
  } catch (error) {
    next(error);
  }
};

exports.gymOwnerResetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({
          message: "Both new password and confirm password are required",
        });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
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
    next(error);
  }
};
