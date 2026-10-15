const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRouter = require("./routes/authRouter");
const gymCenterRouter = require("./routes/gymCenterRouter");
const imageRouter = require("./routes/uploadRouter");

const app = express();

const router = express.Router();

app.use(cors()); // enable CORS for all routes
app.use(express.json()); // parse incoming JSON requests

// router for my project
app.use("/", router);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/gym-centers", gymCenterRouter);
app.use("/api/v1/images", imageRouter);

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MailQueue API is working fine",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
