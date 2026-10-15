const crypto = require("crypto");
const path = require("path");
require("dotenv").config();

const { PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = require("../config/aws_s3");

const uploadToS3 = async (file, folder, allowedTypes) => {
  const { fileTypeFromBuffer } = await import("file-type");
  const detectedType = await fileTypeFromBuffer(file.buffer);
  const originalExtension = path.extname(file.originalname).toLowerCase();

  const isLegacyWordDocument =
    folder === "registration-documents" &&
    detectedType?.mime === "application/x-cfb" &&
    originalExtension === ".doc" &&
    file.mimetype === "application/msword";
  const contentType = isLegacyWordDocument
    ? "application/msword"
    : detectedType?.mime;
  const extension = isLegacyWordDocument ? "doc" : detectedType?.ext;

  if (!detectedType || !allowedTypes.includes(contentType)) {
    const error = new Error("The uploaded file content has an unsupported type");
    error.statusCode = 400;
    throw error;
  }

  if (!process.env.AWS_S3_BUCKET) {
    throw new Error("AWS_S3_BUCKET is not configured");
  }

  const key = `${folder}/${crypto.randomUUID()}.${extension}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: contentType,
    }),
  );

  return {
    key,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET,
  };
};

const handleUploadError = (res, error, message) => {
  if (error.statusCode === 400) {
    return res.status(400).json({ message: error.message });
  }

  console.error("S3 upload failed:", error);
  return res.status(500).json({ message });
};

const uploadGymImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please select an image" });
  }

  try {
    const image = await uploadToS3(req.file, "gym-images", [
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);

    return res.status(201).json({
      message: "Image uploaded successfully",
      image,
    });
  } catch (error) {
    return handleUploadError(res, error, "Unable to upload image");
  }
};

const uploadRegistrationDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please select a document" });
  }

  try {
    const document = await uploadToS3(
      req.file,
      "registration-documents",
      [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ],
    );

    return res.status(201).json({
      message: "Registration document uploaded successfully",
      document,
    });
  } catch (error) {
    return handleUploadError(
      res,
      error,
      "Unable to upload registration document",
    );
  }
};

module.exports = { uploadGymImage, uploadRegistrationDocument };
