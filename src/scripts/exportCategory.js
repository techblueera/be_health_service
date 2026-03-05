import mongoose from "mongoose";
import ExcelJS from "exceljs";
// import dotenv from "dotenv";
import { loadSecrets } from "../config/secrets.js";
import categoryModel from "../models/medicalModels/category.model.js"; // adjust if needed
import { load } from "@grpc/grpc-js";

// dotenv.config();
await loadSecrets()

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI_HEALTH_CARE_SERVICE);
  console.log("✅ MongoDB Connected");
}

function buildLevels(category, map) {
  const levels = ["", "", "", ""];
  let current = category;

  while (current) {
    if (current.level <= 3) {
      levels[current.level] = current.name;
    }

    if (!current.parentId) break;

    current = map.get(current.parentId.toString());
  }

  return levels;
}

async function exportCategories() {
  try {
    const categories = await categoryModel.find().lean();

    const map = new Map();
    categories.forEach(c => map.set(c._id.toString(), c));

    // Only export level 3 categories
    const level3 = categories.filter(c => c.level === 3);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Categories");

    sheet.columns = [
      { header: "Level 0", key: "l0", width: 35 },
      { header: "Level 1", key: "l1", width: 35 },
      { header: "Level 2", key: "l2", width: 35 },
      { header: "Level 3", key: "l3", width: 35 }
    ];

    for (const cat of level3) {
      const [l0, l1, l2, l3] = buildLevels(cat, map);

      sheet.addRow({
        l0,
        l1,
        l2,
        l3
      });
    }

    await workbook.xlsx.writeFile("category_levels.xlsx");

    console.log("✅ Excel exported: category_levels.xlsx");
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