import mongoose from "mongoose";
import ExcelJS from "exceljs";
// import dotenv from "dotenv";
import { loadSecrets } from "../config/secrets.js";
import categoryModel from "../models/medicalModels/category.model.js";

// dotenv.config();
await loadSecrets();

const level0Name = process.argv[2];

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI_HEALTH_CARE_SERVICE);
  console.log("✅ MongoDB Connected");
}

function buildLevels(category, map, rootId) {
  const levels = ["", "", "", ""];
  let current = category;

  while (current) {
    if (current.level <= 3) {
      levels[current.level] = current.name;
    }

    if (!current.parentId) break;

    current = map.get(current.parentId.toString());

    if (current && current._id.toString() === rootId.toString()) {
      levels[0] = current.name;
      break;
    }
  }

  return levels;
}

async function exportCategories() {
  try {
    if (!level0Name) {
      console.log("❌ Please provide Level 0 category name");
      process.exit();
    }

    const categories = await categoryModel.find().lean();

    const map = new Map();
    categories.forEach(c => map.set(c._id.toString(), c));

    const root = categories.find(
      c => c.level === 0 && c.name.toLowerCase() === level0Name.toLowerCase()
    );

    if (!root) {
      console.log("❌ Level 0 category not found");
      process.exit();
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Categories");

    sheet.columns = [
      { header: "Level 0", key: "l0", width: 35 },
      { header: "Level 1", key: "l1", width: 35 },
      { header: "Level 2", key: "l2", width: 35 },
      { header: "Level 3", key: "l3", width: 35 }
    ];

    const level3Categories = categories.filter(c => c.level === 3);

    for (const cat of level3Categories) {
      const levels = buildLevels(cat, map, root._id);

      if (levels[0] === root.name) {
        sheet.addRow({
          l0: levels[0],
          l1: levels[1],
          l2: levels[2],
          l3: levels[3]
        });
      }
    }

    const fileName = `${root.name.replace(/\s+/g, "_")}_categories.xlsx`;

    await workbook.xlsx.writeFile(fileName);

    console.log(`✅ Excel exported: ${fileName}`);

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