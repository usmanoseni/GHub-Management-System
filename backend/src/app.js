const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

const router = express.Router();

app.use(cors()); // enable CORS for all routes
app.use(express.json()); // parse incoming JSON requests

app.use("/", router);

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MailQueue API is working fine",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
