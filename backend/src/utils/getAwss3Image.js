const { GetObjectCommand } = require("@aws-sdk/client-s3");
const aws_s3 = require("../config/aws_s3");

async function getS3Image(imageKey) {
  const response = await aws_s3.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: imageKey,
    }),
  );

  return Buffer.from(await response.Body.transformToByteArray());
}

module.exports = getS3Image;
