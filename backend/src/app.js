const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const gymOwnerAuthRouter = require("./routes/gymOwnerAuthRouter");
const gymCenterRouter = require("./routes/gymCenterRouter");
const imageRouter = require("./routes/uploadRouter");
const instructorAuthRouter = require("./routes/instructorAuthRouter");
const memberAuthRouter = require("./routes/memberAuthRouter");
const gymEmployeeAuthRouter = require("./routes/gymEmployeeAuthRouter");

const app = express();

const router = express.Router();

app.use(cors()); // enable CORS for all routes
app.use(express.json()); // parse incoming JSON requests

// router for my project
app.use("/", router);
app.use("/api/v1/gymOwnerAuthRoute", gymOwnerAuthRoute);
app.use("/api/v1/gym-centers", gymCenterRouter);
app.use("/api/v1/images", imageRouter);
app.use("/api/v1/instructor", instructorAuthRouter);
app.use("/api/v1/member", memberAuthRouter);
app.use("/api/v1/gymEmployee", gymEmployeeAuthRouter);

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MailQueue API is working fine",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
