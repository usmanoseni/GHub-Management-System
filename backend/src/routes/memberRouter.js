const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const Members = require("../models/Member");
const {
  createMember,
  getMemberProfile,
  updateMemberProfile,
  updateMemberProfileImg,
  validateMemberPassword,
  changeMemberPassword,
} = require("../controller/memberController");

const router = express.Router();

router.post("/", authMiddleware, createMember);
router.use(authMiddleware);
router.use(async (req, res, next) => {
  if (req.user.role !== "member") {
    return res.status(403).json({ message: "Member account access required" });
  }

  try {
    const member = await Members.findOne({
      _id: req.user.id,
      role: "member",
      accountStatus: "active",
    });
    if (!member) {
      return res
        .status(403)
        .json({ message: "Active member account required" });
    }
    return next();
  } catch (error) {
    return next(error);
  }
});
router.get("/me", getMemberProfile);
router.patch("/me", updateMemberProfile);
router.post(
  "/me/profile-image",
  upload.single("image"),
  updateMemberProfileImg,
);
router.post("/me/validate-password", validateMemberPassword);
router.patch("/me/password", changeMemberPassword);

module.exports = router;
