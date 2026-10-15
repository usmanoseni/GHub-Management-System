const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  createInstructor,
  getInstructorProfile,
  updateInstructorProfile,
  updateInstructorProfileImg,
  validateInstructorPassword,
  changeInstructorPassword,
  updateInstructorStatus,
  deleteInstructor,
} = require("../controller/instructorController");

const router = express.Router();

router.use(authMiddleware);
router.post("/", createInstructor);
router.get("/:id", getInstructorProfile);
router.patch("/me", updateInstructorProfile);
router.post("/me/profile-image", upload.single("image"), updateInstructorProfileImg);
router.post("/me/validate-password", validateInstructorPassword);
router.patch("/me/password", changeInstructorPassword);
router.patch("/:instructorId/status", updateInstructorStatus);
router.delete("/:instructorId", deleteInstructor);

module.exports = router;
