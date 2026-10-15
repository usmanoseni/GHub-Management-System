const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const gymOwnerAuthRouter = require("./routes/gymOwnerAuthRouter");
const gymOwnerRouter = require("./routes/gymOwnerRouter");
const gymCenterRouter = require("./routes/gymCenterRouter");
const imageRouter = require("./routes/uploadRouter");
const instructorAuthRouter = require("./routes/instructorAuthRouter");
const instructorRouter = require("./routes/instructorRouter");
const gymBranchRouter = require("./routes/gymBranchRouter");
const memberAuthRouter = require("./routes/memberAuthRouter");
const memberRouter = require("./routes/memberRouter");
const gymEmployeeAuthRouter = require("./routes/gymEmployeeAuthRouter");
const gymEmployeeRouter = require("./routes/gymEmployeeRouter");

const app = express();

const router = express.Router();

app.use(cors()); // enable CORS for all routes
app.use(express.json()); // parse incoming JSON requests

// router for my project
app.use("/", router);
app.use("/api/v1/auth", gymOwnerAuthRouter);
app.use("/api/v1/gym-owner", gymOwnerRouter);
app.use("/api/v1/gym-centers", gymCenterRouter);
app.use("/api/v1/gym-branches", gymBranchRouter);
app.use("/api/v1/images", imageRouter);
app.use("/api/v1/instructor", instructorAuthRouter);
app.use("/api/v1/instructors", instructorRouter);
app.use("/api/v1/member", memberAuthRouter);
app.use("/api/v1/members", memberRouter);
app.use("/api/v1/gymEmployee", gymEmployeeAuthRouter);
app.use("/api/v1/gym-employees", gymEmployeeRouter);

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GHub management system API is working fine",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
