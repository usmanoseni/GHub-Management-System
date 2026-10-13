const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const gymOwner = require("../models/gymOwner");
const gymCenter = require("../models/gymCenter");

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
      profile,
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
    const existingGymOwner = await gymOwner.findOne({ email });
    if (existingGymOwner) {
      return res.status(400).json({ message: "Email already exists" });
    }

    //hash the password
    const hashedPassword = await bcryptjs.hash(password, 12);

    //create a new gym owner
    const newGymOwner = new gymOwner({ ...req.body, password: hashedPassword });

    //save gymowner
    await newGymOwner.save();

    return res.status(201).json({
      success: true,
      message: "Gym owner registered successfully",
      token: signToken(newGymOwner),
    });
  } catch (err) {
    next(err);
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
    const gymCenterEmail = await gymCenter.findOne({ businessEmail: email });
    const gymOwnerPassword = await gymOwner.findOne({ password: password });

    if (!gymCenterEmail) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      gymOwnerPassword.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: signToken(gymOwnerPassword),
    });
  } catch (err) {
    next(err);
  }
};
