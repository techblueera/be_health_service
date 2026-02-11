import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Adjust path for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import necessary modules
import { Category } from "../models/medicalModels/index.js"; // Assuming Category model is exported from index.js
import { uploadToS3 } from "../../src/utils/s3Uploader.js";
import { loadSecrets } from "../../src/config/secrets.js";
import { connectDB } from "../../src/config/database.js";
import logger from "../../src/utils/appLogger.js";

const UPLOAD_DIR = path.resolve(__dirname, "../../public/medical/");

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
};

export const uploadCategoryImages = async () => {
  logger.info("Starting category image upload script...", "SCRIPT");

  try {
    // 1. Load secrets and connect to DB
    await loadSecrets();
    await connectDB();

    // 2. Find all image files
    const imageFiles = [];
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file)) {
          imageFiles.push(filePath);
        }
      }
    };

    walkDir(UPLOAD_DIR);
    logger.info(
      `Found ${imageFiles.length} image files in ${UPLOAD_DIR}`,
      "SCRIPT"
    );

    // 3. Process each image
    for (const filePath of imageFiles) {
      const filename = path.basename(filePath);
      const categoryKey = path.parse(filename).name.toUpperCase(); // Extract key, ensure uppercase
      const fileExtension = path.extname(filePath);

      logger.debug(
        `Processing image: ${filename} (Category Key: ${categoryKey})`,
        "SCRIPT"
      );

      try {
        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = getMimeType(filePath);

        // Mock a Multer file object
        const mockFile = {
          originalname: filename,
          buffer: fileBuffer,
          mimetype: mimeType,
        };

        // Upload to S3
        // Use a consistent key structure for S3
        const s3Key = `category-images/${categoryKey}${fileExtension.toLowerCase()}`;
        const imageUrl = await uploadToS3(mockFile, s3Key);

        // Update category in DB
        const updatedCategory = await Category.findOneAndUpdate(
          { key: categoryKey },
          { $set: { image: imageUrl } },
          { new: true, runValidators: true }
        );

        if (updatedCategory) {
          logger.info(
            `Successfully updated category '${categoryKey}' with image: ${imageUrl}`,
            "SCRIPT"
          );
        } else {
          logger.warn(
            `Category with key '${categoryKey}' not found in DB. Image uploaded to S3 but not linked.`,
            "SCRIPT"
          );
        }
      } catch (error) {
        logger.error(
          `Error processing image ${filename}: ${error.message}`,
          "SCRIPT",
          error
        );
      }
    }

    logger.info("Category image upload script finished.", "SCRIPT");
  } catch (error) {
    logger.error(`Script failed: ${error.message}`, "SCRIPT", error);
    process.exit(1);
  } finally {
    // Disconnect from DB
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      logger.info("Disconnected from MongoDB.", "SCRIPT");
    }
  }
};
