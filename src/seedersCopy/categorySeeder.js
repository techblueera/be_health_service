import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import Category from '../models/medicalModels/category.model.js';
import {connectDB} from '../config/database.js';
import logger from '../utils/appLogger.js';
import { loadSecrets } from '../config/secrets.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedCategories = async () => {
    try {
        await loadSecrets(); // Load secrets before connecting to DB
        await connectDB();

        await Category.deleteMany();
        logger.info('Categories collection cleared.', 'CategorySeeder');

        const seedFilePath = path.resolve(__dirname, '../config/generated_categories.json');
        const categories = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));

        const insertCategory = async (categoryData, parentId = null, level = 0) => {
            const { name, key, children } = categoryData;

            // Check if category with the key already exists to be safe
            const existingCategory = await Category.findOne({ key });
            if (existingCategory) {
                logger.warn(`Category with key "${key}" already exists. Skipping.`, 'CategorySeeder');
                return;
            }

            const newCategory = new Category({
                name,
                key,
                parentId,
                level,
                isActive: true, // Default to active
            });

            await newCategory.save();
            logger.info(`Created category: ${name} (Level ${level})`, 'CategorySeeder');

            if (children && children.length > 0) {
                for (const child of children) {
                    await insertCategory(child, newCategory._id, level + 1);
                }
            }
        };

        for (const category of categories) {
            await insertCategory(category);
        }

        logger.info('Category seeding completed successfully.', 'CategorySeeder');
        process.exit(0);
    } catch (error) {
        logger.error('Error during category seeding', 'CategorySeeder', error);
        process.exit(1);
    }
};

seedCategories();
