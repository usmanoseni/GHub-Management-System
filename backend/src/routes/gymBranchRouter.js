const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createGymBranch,
  getBranchesByGymCenter,
  updateBranchById,
  updateBranchStatus,
} = require("../controller/gymBranchController");

const router = express.Router();

router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.user.role !== "Owner") {
    return res.status(403).json({
      message: "Only a gym owner can manage gym branches",
    });
  }
  return next();
});
router.post("/", createGymBranch);
router.get("/:gymCenterId", getBranchesByGymCenter);
router.patch("/:branchCode", updateBranchById);
router.patch("/:branchId/status", updateBranchStatus);

module.exports = router;
