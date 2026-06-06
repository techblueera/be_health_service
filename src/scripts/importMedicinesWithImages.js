import fs from "fs";
import path from "path";
import axios from "axios";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

import { loadSecrets } from "../config/secrets.js";
import { connectDB } from "../config/database.js";
import logger from "../utils/appLogger.js";
import { uploadToS3 } from "../utils/s3Uploader.js";

import Category from "../models/medicalModels/category.model.js";
import Product from "../models/medicalModels/product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_FILE = path.resolve(
  __dirname,
  "../config/apollo_categorized_products.json"
);

const BATCH_SIZE = 50;

function cleanValue(value) {
  if (!value) return undefined;

  const v = String(value).trim();

  if (
    !v ||
    v.toUpperCase() === "NA" ||
    v.toUpperCase() === "NULL" ||
    v.toUpperCase() === "N/A"
  ) {
    return undefined;
  }

  return v;
}

function normalizeName(name = "") {
  return String(name).trim().toUpperCase().replace(/\s+/g, " ");
}

function parseDescription(description = "") {
  const result = {
    salt_composition: undefined,
    product_form: undefined,
    manufacturer_name: undefined,
  };

  if (!description) return result;

  const activeIngredientMatch = description.match(
    /Active Ingredient:\s*(.*?)\.\s*Dosage Form:/i
  );

  const dosageFormMatch = description.match(
    /Dosage Form:\s*(.*?)\.\s*Manufacturer:/i
  );

  const manufacturerMatch = description.match(/Manufacturer:\s*(.*?)\./i);

  result.salt_composition = cleanValue(activeIngredientMatch?.[1]);

  result.product_form = cleanValue(dosageFormMatch?.[1]);

  result.manufacturer_name = cleanValue(manufacturerMatch?.[1]);

  return result;
}

// async function downloadImage(imageUrl) {
//   const response = await axios.get(imageUrl, {
//     responseType: "arraybuffer",
//     timeout: 30000,
//     headers: {
//       "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
//       Accept: "image/*,*/*",
//     },
//   });

//   const contentType = response.headers["content-type"] || "image/jpeg";

//   return {
//     buffer: Buffer.from(response.data),
//     mimetype: contentType,
//     originalname: path.basename(imageUrl.split("?")[0]),
//   };
// }

async function getApolloImageUrl(productUrl) {
  try {
    const response = await axios.get(productUrl, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      },
    });

    const html = response.data;

    const match = html.match(
      /https:\/\/images\.apollo247\.in\/pub\/media\/catalog\/product\/.*?\.(jpg|jpeg|png|webp)/i
    );

    if (!match) {
      console.log("NO IMAGE FOUND:", productUrl);
      return null;
    }

    return match[0];
  } catch (err) {
    console.log("FAILED TO FETCH PRODUCT PAGE:", productUrl);

    return null;
  }
}

async function downloadImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}`);
    }

    return {
      buffer: Buffer.from(response.data),
      mimetype: response.headers["content-type"] || "image/jpeg",
      originalname: path.basename(imageUrl.split("?")[0]),
    };
  } catch (err) {
    console.log("DOWNLOAD FAILED:", err.message);
    throw err;
  }
}

async function uploadProductImage(imageUrl, categoryKey, productName) {
  try {
    const file = await downloadImage(imageUrl);

    const extension = file.originalname.split(".").pop() || "jpg";

    const key = `products/${categoryKey}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

    const s3Url = await uploadToS3(file, key);

    return s3Url;
  } catch (error) {
    logger.error(
      `Image upload failed for ${productName}`,
      "PRODUCT_IMPORT",
      error
    );

    return null;
  }
}

async function loadCategoryMap() {
  const map = new Map();

  const categories = await Category.find({}).select("_id key").lean();

  for (const category of categories) {
    map.set(category.key, category._id);
  }

  logger.info(`Loaded ${map.size} categories`, "PRODUCT_IMPORT");

  return map;
}

async function loadExistingProducts() {
  const products = await Product.find({}).select("name").lean();

  const set = new Set();

  for (const product of products) {
    set.add(normalizeName(product.name));
  }

  logger.info(`Loaded ${set.size} existing products`, "PRODUCT_IMPORT");

  return set;
}

async function main() {
  try {
    logger.setTimestampEnabled(true);

    logger.info("Starting Product Import", "PRODUCT_IMPORT");

    await loadSecrets();
    await connectDB();

    const categoryMap = await loadCategoryMap();

    const existingProducts = await loadExistingProducts();

    const raw = fs.readFileSync(JSON_FILE, "utf8");

    const products = JSON.parse(raw); // Limit to first 10 products for testing

    logger.info(`JSON Products: ${products.length}`, "PRODUCT_IMPORT");

    const batch = [];

    let inserted = 0;
    let skippedDuplicates = 0;
    let skippedCategory = 0;
    let skippedImages = 0;
    let imageUploaded = 0;

    for (let i = 0; i < products.length; i++) {
      const record = products[i];

      const productName = cleanValue(record["Product Title"]);

      if (!productName) {
        continue;
      }

      const normalizedName = normalizeName(productName);

      if (existingProducts.has(normalizedName)) {
        skippedDuplicates++;
        continue;
      }

      const categoryId = categoryMap.get(record.category_level_3_key);

      if (!categoryId) {
        skippedCategory++;
        continue;
      }

      const productUrl = cleanValue(record["Product Url"]);

      if (!productUrl) {
        skippedImages++;
        continue;
      }

      const firstImageUrl = await getApolloImageUrl(productUrl);

      if (!firstImageUrl) {
        skippedImages++;
        continue;
      }

      console.log("\n=================================");
      console.log(`${i + 1}. ${productName}`);
      console.log("CATEGORY:", record.category_level_3_key);
      console.log("PRODUCT URL:", productUrl);
      console.log("IMAGE URL:", firstImageUrl);
      console.log("=================================\n");

      let s3Url = null;

      try {
        s3Url = await uploadProductImage(
          firstImageUrl,
          record.category_level_3_key,
          productName
        );
      } catch (err) {
        logger.warn(`Image unavailable for ${productName}`, "PRODUCT_IMPORT");
      }

      if (!s3Url) {
        skippedImages++;

        console.log(
          `Skipping product because image upload failed: ${productName}`
        );

        continue;
      }

      if (s3Url) {
        imageUploaded++;
      }

      const description = cleanValue(record["Product Description"]);

      const parsed = parseDescription(description);

      batch.push({
        name: productName,

        description,

        brand: cleanValue(record.Brand),

        category: categoryId,

        images: s3Url
          ? [
              {
                url: s3Url,
                altText: productName,
              },
            ]
          : [],

        pack_size: cleanValue(record["Pack Size Or Quantity"]),

        marketer_name: cleanValue(record.Brand),

        manufacturerDetails: parsed.manufacturer_name
          ? {
              name: parsed.manufacturer_name,
            }
          : undefined,

        salt_composition: parsed.salt_composition,

        product_form: parsed.product_form,

        tags: [
          record.category_level_0_name,
          record.category_level_1_name,
          record.category_level_2_name,
          record.category_level_3_name,
        ].filter(Boolean),

        filterKeywords: [
          record.category_level_0_key,
          record.category_level_1_key,
          record.category_level_2_key,
          record.category_level_3_key,
        ].filter(Boolean),
      });

      existingProducts.add(normalizedName);

      if (batch.length >= BATCH_SIZE) {
        try {
          await Product.insertMany(batch, {
            ordered: false,
          });

          inserted += batch.length;

          logger.info(`Inserted: ${inserted}`, "PRODUCT_IMPORT");
        } catch (err) {
          logger.error("Batch insert failed", "PRODUCT_IMPORT", err);
        }

        batch.length = 0;
      }

      if ((i + 1) % 100 === 0) {
        logger.info(`Processed ${i + 1}/${products.length}`, "PRODUCT_IMPORT");
      }
    }

    if (batch.length) {
      try {
        await Product.insertMany(batch, {
          ordered: false,
        });

        inserted += batch.length;
      } catch (err) {
        logger.error("Final batch insert failed", "PRODUCT_IMPORT", err);
      }
    }

    logger.info(`Inserted: ${inserted}`, "PRODUCT_IMPORT");

    logger.info(`Skipped Duplicate: ${skippedDuplicates}`, "PRODUCT_IMPORT");

    logger.info(`Skipped Category: ${skippedCategory}`, "PRODUCT_IMPORT");

    logger.info(`Skipped Images: ${skippedImages}`, "PRODUCT_IMPORT");

    logger.info(`Images Uploaded: ${imageUploaded}`, "PRODUCT_IMPORT");

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    logger.error("Import Failed", "PRODUCT_IMPORT", error);

    await mongoose.disconnect();

    process.exit(1);
  }
}

main();
