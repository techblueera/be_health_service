import mongoose from "mongoose";
// import dotenv from "dotenv";
import { loadSecrets } from "../config/secrets.js";
import fs from "fs";
import categoryModel from "../models/medicalModels/category.model.js";

// dotenv.config();
await loadSecrets();

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI_HEALTH_CARE_SERVICE);
  console.log("✅ MongoDB Connected");
}

async function exportCategories() {
  try {
    const categories = await categoryModel.find({
      name: { $regex: /\./ } // matches names containing "."
    }).lean();

    if (!categories.length) {
      console.log("No categories found with '.' in name");
      process.exit();
    }

    let csv = "id,name,level,parentId\n";

    categories.forEach(cat => {
      csv += `${cat._id},"${cat.name}",${cat.level},${cat.parentId || ""}\n`;
    });

    fs.writeFileSync("categories_with_dot.csv", csv);

    console.log(`✅ CSV exported: categories_with_dot.csv`);
    console.log(`Total categories found: ${categories.length}`);

    process.exit();
  } catch (err) {
    console.error("❌ Export failed:", err);
    process.exit(1);
  }
}

async function run() {
  await connectDB();
  await exportCategories();
}

run();