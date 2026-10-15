const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  getGymOwnerProfile,
  updateGymOwnerProfile,
  updateGymOwnerProfileImg,
  validateGymOwnerPassword,
  changeGymOwnerPassword,
} = require("../controller/gymownerController");

const router = express.Router();

router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.user.role !== "Owner") {
    return res.status(403).json({ message: "Gym owner access required" });
  }
  return next();
});

router.get("/me", getGymOwnerProfile);
router.patch("/me", updateGymOwnerProfile);
router.post("/me/profile-image", upload.single("image"), updateGymOwnerProfileImg);
router.post("/me/validate-password", validateGymOwnerPassword);
router.patch("/me/password", changeGymOwnerPassword);

module.exports = router;
