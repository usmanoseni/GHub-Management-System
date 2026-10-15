const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const GymEmployee = require("../models/gymEmployee");
const {
  createGymEmployee,
  getGymEmployeeProfile,
  updateGymEmployeeProfile,
  updateGymEmployeeProfileImg,
  validateGymEmployeePassword,
  changeGymEmployeePassword,
  updateEmployeeStatus,
  deleteGymEmployee,
} = require("../controller/gymEmployeeController");

const router = express.Router();

router.use(authMiddleware);
router.use(async (req, res, next) => {
  if (req.user.role === "Owner") {
    return next();
  }
  if (!["manager", "receptionist"].includes(req.user.role)) {
    return res.status(403).json({ message: "Gym employee access required" });
  }

  try {
    const employee = await GymEmployee.findOne({
      _id: req.user.id,
      role: req.user.role,
      accountStatus: "active",
    });
    if (!employee) {
      return res
        .status(403)
        .json({ message: "Active gym employee account required" });
    }
    return next();
  } catch (error) {
    return next(error);
  }
});
router.post("/", createGymEmployee);
router.get("/me", getGymEmployeeProfile);
router.patch("/me", updateGymEmployeeProfile);
router.post(
  "/me/profile-image",
  upload.single("image"),
  updateGymEmployeeProfileImg,
);
router.post("/me/validate-password", validateGymEmployeePassword);
router.patch("/me/password", changeGymEmployeePassword);
router.patch("/:employeeId/status", updateEmployeeStatus);
router.delete("/:employeeId", deleteGymEmployee);

module.exports = router;
