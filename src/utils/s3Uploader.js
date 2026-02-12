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
import chalk from "chalk";
import path from "path";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";


// same helper you already wrote
const createS3Client = () =>
  new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.NEW_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEW_AWS_SECRET_ACCESS_KEY,
    },
  });

/**
 * Uploads a file to AWS S4
 * @param {Express.Multer.File} file - File object from multer
 * @param {string} [key] - Optional S3 key (auto-generated if not provided)
 * @returns {Promise<string>} - Public URL of the uploaded file
*/
export const uploadToS3 = async (file, key) => {
  // ✅ Create a reusable S3 client
  console.log(chalk.blue('[DEBUG S3] Initializing S3Client...'));
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.NEW_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEW_AWS_SECRET_ACCESS_KEY
    }
  });
  console.log(chalk.green('[DEBUG S3] S3Client initialized. Region:', process.env.AWS_REGION));
  console.log(chalk.blue('[DEBUG S3] Entering uploadToS3 function.'));
  console.log(chalk.blue('[DEBUG S3] Received file for upload:', file ? file.originalname : 'No file object'));
  console.log(chalk.blue('[DEBUG S3] Provided key:', key || 'Not provided, will auto-generate'));

  if (!file || !file.buffer || !file.originalname) {
    console.error(chalk.red('[DEBUG S3] Invalid file input: file, buffer, or originalname is missing.'));
    throw new Error("Invalid file input for S3 upload");
  }

  const fileExtension = path.extname(file.originalname);
  const uniqueKey = key || `videos/originals/${uuidv4()}${fileExtension}`;
  console.log(chalk.blue('[DEBUG S3] Generated S3 unique key:', uniqueKey));

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME_HOSPITAL_SERVICE,
    Key: uniqueKey,
    Body: file.buffer,
    ContentType: file.mimetype
  };
  console.log(chalk.blue('[DEBUG S3] S3 PutObjectCommand parameters prepared for Bucket:', params.Bucket, 'and Key:', params.Key));
  console.log(chalk.blue('[DEBUG S3] ContentType:', params.ContentType));

  try {
    console.log(chalk.blue('[DEBUG S3] Sending PutObjectCommand to S3...'));
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log(chalk.green('[DEBUG S3] PutObjectCommand sent successfully.'));

    const url = `https://${process.env.AWS_S3_BUCKET_NAME_HOSPITAL_SERVICE}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

    console.log(chalk.green("[✅ S3 Upload Success] File uploaded to:"), chalk.gray(uniqueKey));
    console.log(chalk.green("[DEBUG S3] Public URL generated:"), url);
    return url;
  } catch (err) {
    console.error(chalk.red("[❌ S3 Upload Failed] Error message:"), chalk.yellow(err.message));
    console.error(chalk.red("[❌ S3 Upload Failed] Stack trace:"), err.stack);
    throw new Error("Failed to upload file to S3");
  } finally {
    console.log(chalk.blue('[DEBUG S3] Exiting uploadToS3 function.'));
  }
};


/**
 * Deletes a file from AWS S3 using its public URL.
 * @param {string} fileUrl - The public URL of the file to delete from S3.
 * @returns {Promise<void>}
*/
export const deleteFromS3 = async (fileUrl) => {
  console.log(chalk.blue('[DEBUG S3] Entering deleteFromS3 function.'));
  console.log(chalk.blue('[DEBUG S3] Received fileUrl for deletion:', fileUrl));

  if (!fileUrl) {
    console.warn(chalk.yellow('[DEBUG S3] No fileUrl provided for deletion. Skipping S3 delete operation.'));
    return; // Do nothing if no URL is provided
  }

  // Initialize S3 Client (can be reused or created per function call)
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.NEW_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEW_AWS_SECRET_ACCESS_KEY
    }
  });

  // Extract the S3 Key from the URL
  // Example URL: https://your-bucket-name.s3.your-region.amazonaws.com/path/to/your/file.jpg
  const bucketName = process.env.AWS_S3_BUCKET_NAME_HOSPITAL_SERVICE;
  const region = process.env.AWS_REGION;

  // Construct the base URL part that precedes the key
  const s3BaseUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;

  let s3Key;
  if (fileUrl.startsWith(s3BaseUrl)) {
    s3Key = fileUrl.substring(s3BaseUrl.length);
  } else {
    console.warn(chalk.yellow(`[DEBUG S3] Provided URL is not an S3 URL from this bucket/region: ${fileUrl}. Skipping S3 delete.`));
    return; // Not an S3 URL we manage, so don't try to delete
  }

  if (!s3Key) {
    console.error(chalk.red('[DEBUG S3] Could not extract S3 Key from URL:', fileUrl));
    throw new Error("Could not determine S3 key from provided URL.");
  }

  console.log(chalk.blue('[DEBUG S3] Extracted S3 Key for deletion:', s3Key));

  const params = {
    Bucket: bucketName,
    Key: s3Key,
  };

  try {
    console.log(chalk.blue('[DEBUG S3] Sending DeleteObjectCommand to S3 for Key:', s3Key));
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    console.log(chalk.green(`[✅ S3 Delete Success] File deleted from S3: ${s3Key}`));
  } catch (err) {
    // AWS S3 DeleteObjectCommand does not throw an error if the object does not exist.
    // It only throws for permission issues, bucket not found, etc.
    // So, we only log actual errors.
    console.error(chalk.red("[❌ S3 Delete Failed] Error message:"), chalk.yellow(err.message));
    console.error(chalk.red("[❌ S3 Delete Failed] Stack trace:"), err.stack);
    throw new Error(`Failed to delete file from S3: ${err.message}`);
  } finally {
    console.log(chalk.blue('[DEBUG S3] Exiting deleteFromS3 function.'));
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

    // optional: pre-sign the PUT so the client can upload directly
    const s3Client = createS3Client();
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME_HOSPITAL_SERVICE,
      Key: uniqueKey,
      ContentType: fileType,
    });

    // 30-minute window for the upload itself
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 1800 });

    // Public URL that will *never* expire (because the object is public)
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME_HOSPITAL_SERVICE}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(
      uniqueKey
    )}`;

    res.json({ uploadUrl, publicUrl, fileKey: uniqueKey });
  } catch (err) {
    console.error(chalk.red("[❌ generateUploadUrl] Error:"), err);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
};


export const generateDownloadUrl = (req, res) => {
  try {
    const { fileKey } = req.query;

    if (!fileKey) {
      return res.status(400).json({ error: "Missing fileKey query parameter" });
    }

    // Static public URL; it never expires because the object is public-read.
    const url = `https://${process.env.AWS_S3_BUCKET_NAME_HOSPITAL_SERVICE}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(
      fileKey
    )}`;

    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate download URL" });
  }
};