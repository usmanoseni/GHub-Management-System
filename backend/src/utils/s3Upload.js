// const crypto = require("node:crypto");
// const path = require("node:path");
// const { PutObjectCommand } = require("@aws-sdk/client-s3");
// const s3 = require("../config/aws_s3");

// const uploadToS3 = async (file, folder, allowedTypes) => {
//   const { fileTypeFromBuffer } = await import("file-type");
//   const detectedType = await fileTypeFromBuffer(file.buffer);
//   const originalExtension = path.extname(file.originalname).toLowerCase();

//   const isLegacyWordDocument =
//     folder === "registration-documents" &&
//     detectedType?.mime === "application/x-cfb" &&
//     originalExtension === ".doc" &&
//     file.mimetype === "application/msword";
//   const contentType = isLegacyWordDocument
//     ? "application/msword"
//     : detectedType?.mime;
//   const extension = isLegacyWordDocument ? "doc" : detectedType?.ext;

//   if (!detectedType || !allowedTypes.includes(contentType)) {
//     const error = new Error("The uploaded file content has an unsupported type");
//     error.statusCode = 400;
//     throw error;
//   }

//   if (!process.env.AWS_S3_BUCKET) {
//     throw new Error("AWS_S3_BUCKET is not configured");
//   }

//   const key = `${folder}/${crypto.randomUUID()}.${extension}`;
//   await s3.send(
//     new PutObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET,
//       Key: key,
//       Body: file.buffer,
//       ContentType: contentType,
//     }),
//   );

//   return {
//     key,
//     region: process.env.AWS_REGION,
//     bucket: process.env.AWS_S3_BUCKET,
//   };
// };

// module.exports = uploadToS3;
