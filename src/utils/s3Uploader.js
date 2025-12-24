// utils/s3Uploader.js
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import logger from "./appLogger.js";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";


// same helper you already wrote
const createS3Client = () =>
  new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

/**
 * Uploads a file to AWS S3
 * @param {Express.Multer.File} file - File object from multer
 * @param {string} [key] - Optional S3 key (auto-generated if not provided)
 * @returns {Promise<string>} - Public URL of the uploaded file
*/
export const uploadToS3 = async (file, key) => {
  logger.debug('Initializing S3Client...', 'S3');
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  logger.debug(`S3Client initialized. Region: ${process.env.AWS_REGION}`, 'S3');
  logger.debug('Entering uploadToS3 function.', 'S3');
  logger.debug(`Received file for upload: ${file ? file.originalname : 'No file object'}`, 'S3');
  logger.debug(`Provided key: ${key || 'Not provided, will auto-generate'}`, 'S3');

  if (!file || !file.buffer || !file.originalname) {
    logger.error('Invalid file input: file, buffer, or originalname is missing.', 'S3');
    throw new Error("Invalid file input for S3 upload");
  }

  const fileExtension = path.extname(file.originalname);
  const uniqueKey = key || `grocery-service-images/${uuidv4()}${fileExtension}`;
  logger.debug(`Generated S3 unique key: ${uniqueKey}`, 'S3');

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME_GROCERY_SERVICE,
    Key: uniqueKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read"
  };
  logger.debug(`S3 PutObjectCommand parameters prepared for Bucket: ${params.Bucket} and Key: ${params.Key}`, 'S3');
  logger.debug(`ContentType: ${params.ContentType}`, 'S3');

  try {
    logger.debug('Sending PutObjectCommand to S3...', 'S3');
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    logger.debug('PutObjectCommand sent successfully.', 'S3');

    const url = `https://${process.env.AWS_S3_BUCKET_NAME_GROCERY_SERVICE}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

    logger.info(`File uploaded to: ${uniqueKey}`, 'S3 Upload Success');
    logger.debug(`Public URL generated: ${url}`, 'S3');
    return url;
  } catch (err) {
    logger.error('S3 Upload Failed', 'S3', err);
    throw new Error("Failed to upload file to S3");
  } finally {
    logger.debug('Exiting uploadToS3 function.', 'S3');
  }
};


/**
 * Deletes a file from AWS S3 using its public URL.
 * @param {string} fileUrl - The public URL of the file to delete from S3.
 * @returns {Promise<void>}
*/
export const deleteFromS3 = async (fileUrl) => {
  logger.debug('Entering deleteFromS3 function.', 'S3');
  logger.debug(`Received fileUrl for deletion: ${fileUrl}`, 'S3');

  if (!fileUrl) {
    logger.warn('No fileUrl provided for deletion. Skipping S3 delete operation.', 'S3');
    return;
  }

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const bucketName = process.env.AWS_S3_BUCKET_NAME_GROCERY_SERVICE;
  const region = process.env.AWS_REGION;
  const s3BaseUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;

  let s3Key;
  if (fileUrl.startsWith(s3BaseUrl)) {
    s3Key = fileUrl.substring(s3BaseUrl.length);
  } else {
    logger.warn(`Provided URL is not an S3 URL from this bucket/region: ${fileUrl}. Skipping S3 delete.`, 'S3');
    return;
  }

  if (!s3Key) {
    logger.error('Could not extract S3 Key from URL', 'S3', fileUrl);
    throw new Error("Could not determine S3 key from provided URL.");
  }

  logger.debug(`Extracted S3 Key for deletion: ${s3Key}`, 'S3');

  const params = {
    Bucket: bucketName,
    Key: s3Key,
  };

  try {
    logger.debug(`Sending DeleteObjectCommand to S3 for Key: ${s3Key}`, 'S3');
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    logger.info(`File deleted from S3: ${s3Key}`, 'S3 Delete Success');
  } catch (err) {
    logger.error('S3 Delete Failed', 'S3', err);
    throw new Error(`Failed to delete file from S3: ${err.message}`);
  } finally {
    logger.debug('Exiting deleteFromS3 function.', 'S3');
  }
};

export const generateUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.query;
    if (!fileName || !fileType) {
      return res.status(400).json({ error: "fileName and fileType are required" });
    }

    const extension = fileName.split('.').pop();
    const uniqueKey = `uploads/${Date.now()}-${randomUUID()}.${extension}`;

    const s3Client = createS3Client();
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME_GROCERY_SERVICE,
      Key: uniqueKey,
      ContentType: fileType,
      ACL: "public-read",
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 1800 });
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME_GROCERY_SERVICE}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(
      uniqueKey
    )}`;

    res.json({ uploadUrl, publicUrl, fileKey: uniqueKey });
  } catch (err) {
    logger.error('Failed to generate upload URL', 'generateUploadUrl', err);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
};


export const generateDownloadUrl = (req, res) => {
  try {
    const { fileKey } = req.query;

    if (!fileKey) {
      return res.status(400).json({ error: "Missing fileKey query parameter" });
    }

    const url = `https://${process.env.AWS_S3_BUCKET_NAME_GROCERY_SERVICE}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(
      fileKey
    )}`;

    res.json({ url });
  } catch (err) {
    logger.error('Failed to generate download URL', 'generateDownloadUrl', err);
    res.status(500).json({ error: "Failed to generate download URL" });
  }
};