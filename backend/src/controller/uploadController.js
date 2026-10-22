// require("dotenv").config();

// const uploadToS3 = require("../utils/s3Upload");

// const handleUploadError = (res, error, message) => {
//   if (error.statusCode === 400) {
//     return res.status(400).json({ message: error.message });
//   }

//   console.error("S3 upload failed:", error);
//   return res.status(500).json({ message });
// };

// const uploadGymImage = async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "Please select an image" });
//   }

//   try {
//     const image = await uploadToS3(req.file, "gym-images", [
//       "image/jpeg",
//       "image/png",
//       "image/webp",
//     ]);

//     return res.status(201).json({
//       message: "Image uploaded successfully",
//       image,
//     });
//   } catch (error) {
//     return handleUploadError(res, error, "Unable to upload image");
//   }
// };

// const uploadRegistrationDocument = async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "Please select a document" });
//   }

//   try {
//     const document = await uploadToS3(req.file, "registration-documents", [
//       "application/pdf",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "application/msword",
//     ]);

//     return res.status(201).json({
//       message: "Registration document uploaded successfully",
//       document,
//     });
//   } catch (error) {
//     return handleUploadError(
//       res,
//       error,
//       "Unable to upload registration document",
//     );
//   }
// };

// module.exports = { uploadGymImage, uploadRegistrationDocument };
