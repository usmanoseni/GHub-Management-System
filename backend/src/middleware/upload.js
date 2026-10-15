const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg","image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error(
        "Only JPEG, JPG, PNG, and WebP images are allowed",
      );
      error.statusCode = 400;
      return cb(error);
    }

    cb(null, true);
  },
});

module.exports = upload;
