const multer = require("multer");

const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const gymCenterUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes =
      file.fieldname === "gymLogo"
        ? imageTypes
        : file.fieldname === "registrationDocument"
          ? ["application/pdf"]
          : [];

    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error(
        file.fieldname === "gymLogo"
          ? "Gym logo must be a JPEG, PNG, or WebP image"
          : file.fieldname === "registrationDocument"
            ? "Registration document must be a PDF"
            : "Unexpected upload field",
      );
      error.statusCode = 400;
      return cb(error);
    }

    cb(null, true);
  },
}).fields([
  { name: "gymLogo", maxCount: 1 },
  { name: "registrationDocument", maxCount: 1 },
]);

module.exports = gymCenterUpload;
