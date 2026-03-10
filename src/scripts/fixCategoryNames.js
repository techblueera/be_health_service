import mongoose from "mongoose";
// import dotenv from "dotenv";
import { loadSecrets } from "../config/secrets.js";
import categoryModel from "../models/medicalModels/category.model.js";

// dotenv.config();
await loadSecrets();

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI_HEALTH_CARE_SERVICE);
  console.log("✅ MongoDB Connected");
}

async function fixCategoryNames() {
  try {
    const categories = await categoryModel.find({
      name: { $regex: /\.$/ } // names ending with "."
    });

    console.log(`Found ${categories.length} categories to fix\n`);

    for (const cat of categories) {
      const newName = cat.name.replace(/\.$/, "");

      console.log(`${cat.name}  →  ${newName}`);

      cat.name = newName;
      await cat.save();
    }

    console.log("\n✅ Category names updated successfully");
    process.exit();

  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

async function run() {
  await connectDB();
  await fixCategoryNames();
}

run();