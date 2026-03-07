/**
 * Bulk Product Upload Script
 * --------------------------
 * Reads one or more Excel files, looks up the Level-3 category by name
 * from the DB, then inserts Products with only: name, brand, category.
 *
 * Usage (from project root):
 *   node scripts/bulkUploadProducts.js data/excel/*.xlsx
 *   node scripts/bulkUploadProducts.js data/excel/Ayurveda.xlsx data/excel/Herbal.xlsx
 *
 * Dependencies:
 *   npm install xlsx dotenv
 *
 * Requires MONGODB_URI in your .env file.
 */

// import 'dotenv/config';
import { loadSecrets } from '../src/config/secrets.js';
import mongoose from 'mongoose';
import XLSX from 'xlsx';
import path from 'path';

import Category from '../src/models/medicalModels/category.model.js';
import Product from '../src/models/medicalModels/product.model.js';

// ─── Cache all Level-3 categories at startup ─────────────────────────────────

const level3Cache = new Map(); // lowercased name → ObjectId

async function loadLevel3Categories() {
  const cats = await Category.find({ level: 3 }, { name: 1 }).lean();
  for (const cat of cats) {
    level3Cache.set(cat.name.toLowerCase().trim(), cat._id);
  }
  console.log(`✅ Loaded ${level3Cache.size} Level-3 categories from DB.\n`);
}

function getLevel3Id(name) {
  return level3Cache.get(name.toLowerCase().trim()) || null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractRows(workbook) {
  const TARGET_SHEET = 'All Products';
  const sheetName = workbook.SheetNames.includes(TARGET_SHEET)
    ? TARGET_SHEET
    : workbook.SheetNames[0];

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
  console.log(`  ↳ Sheet: "${sheetName}" — ${rows.length} rows`);
  return rows;
}

function detectColumns(sample) {
  const keys = Object.keys(sample);
  const find = (...patterns) =>
    keys.find(k => patterns.some(p => k.toLowerCase().includes(p.toLowerCase()))) || null;

  return {
    level3:      find('level 3', 'level3'),
    productName: find('product name', 'name'),
    brand:       find('brand'),
  };
}

// ─── Core upload function ─────────────────────────────────────────────────────

async function processFile(filePath) {
  console.log(`📂 Processing: ${path.basename(filePath)}`);

  const workbook = XLSX.readFile(filePath);
  const rows     = extractRows(workbook);

  if (!rows.length) {
    console.warn('  ⚠ No rows found — skipping.\n');
    return;
  }

  const cols = detectColumns(rows[0]);
  console.log(`  Columns → name: "${cols.productName}" | brand: "${cols.brand}" | level3: "${cols.level3}"`);

  const missing = ['level3', 'productName', 'brand'].filter(c => !cols[c]);
  if (missing.length) {
    console.error(`  ✖ Required columns not found: ${missing.join(', ')} — skipping file.\n`);
    return;
  }

  let inserted = 0, skipped = 0, notFound = 0, errors = 0;
  const notFoundCategories = new Set();

  // Deduplicate by name + brand within the file
  const seen      = new Set();
  const toProcess = [];

  for (const row of rows) {
    const productName = String(row[cols.productName] || '').trim();
    const brand       = String(row[cols.brand]       || '').trim();
    const l3Name      = String(row[cols.level3]      || '').trim();

    if (!productName || !l3Name) { skipped++; continue; }

    const key = `${productName}||${brand}`;
    if (seen.has(key)) { skipped++; continue; }
    seen.add(key);

    toProcess.push({ productName, brand, l3Name });
  }

  console.log(`  ${toProcess.length} unique products to process (${skipped} duplicates/empty skipped)`);

  // Process in batches of 50
  const BATCH = 50;
  for (let i = 0; i < toProcess.length; i += BATCH) {
    const batch = toProcess.slice(i, i + BATCH);

    await Promise.all(batch.map(async ({ productName, brand, l3Name }) => {
      try {
        const categoryId = getLevel3Id(l3Name);

        if (!categoryId) {
          notFoundCategories.add(l3Name);
          notFound++;
          return;
        }

        const result = await Product.updateOne(
          { name: productName, brand: brand || undefined },
          { $setOnInsert: { name: productName, brand, category: categoryId } },
          { upsert: true }
        );

        if (result.upsertedCount > 0) inserted++;
        else skipped++;
      } catch (err) {
        console.error(`\n  ✖ Error on "${productName}": ${err.message}`);
        errors++;
      }
    }));

    process.stdout.write(`\r  Progress: ${Math.min(i + BATCH, toProcess.length)}/${toProcess.length}`);
  }

  console.log(`\n  ✔ inserted: ${inserted} | already existed: ${skipped} | category not found: ${notFound} | errors: ${errors}`);

  if (notFoundCategories.size) {
    console.warn(`  ⚠ These Level-3 category names had no match in DB (${notFoundCategories.size}):`);
    for (const name of notFoundCategories) console.warn(`      - "${name}"`);
  }

  console.log();
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  const files = process.argv.slice(2);

  if (!files.length) {
    console.error('Usage: node scripts/bulkUploadProducts.js data/excel/*.xlsx');
    process.exit(1);
  }

  await loadSecrets();


  if (!process.env.MONGO_URI_HEALTH_CARE_SERVICE) {
    console.error('Error: MONGODB_URI is not set in your .env file.');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI_HEALTH_CARE_SERVICE);
  console.log('✅ Connected.\n');

  await loadLevel3Categories();

  for (const file of files) {
    await processFile(path.resolve(file));
  }

  await mongoose.disconnect();
  console.log('🏁 All files processed. Connection closed.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  mongoose.disconnect();
  process.exit(1);
});