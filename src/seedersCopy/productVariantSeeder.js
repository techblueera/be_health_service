import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Product, ProductVariant, Category } from '../models/index.js';
import { connectDB } from '../config/database.js';
import logger from '../utils/appLogger.js';
import { loadSecrets } from '../config/secrets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedProductsAndVariants = async () => {
    try {
        await loadSecrets();
        await connectDB();

        await Product.deleteMany();
        await ProductVariant.deleteMany();
        logger.info('Products and ProductVariants collections cleared.', 'ProductVariantSeeder');

        const seedFilePath = path.resolve(__dirname, '../config/productSeed.json');
        const productData = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));

        for (const item of productData) {
            const { product: productInfo, variants: variantInfo } = item;

            const category = await Category.findOne({ key: productInfo.categoryKey });
            if (!category) {
                logger.warn(`Category with key "${productInfo.categoryKey}" not found. Skipping product "${productInfo.name}".`, 'ProductVariantSeeder');
                continue;
            }

            const newProduct = new Product({
                name: productInfo.name,
                description: productInfo.description,
                brand: productInfo.brand,
                category: category._id,
                tags: productInfo.tags,
                isVegetarian: productInfo.isVegetarian,
                countryOfOrigin: productInfo.countryOfOrigin,
                // Assuming images will be added later via admin UI
                images: [],
                isActive: true,
            });

            await newProduct.save();
            logger.info(`Created product: ${newProduct.name}`, 'ProductVariantSeeder');

            for (const variant of variantInfo) {
                const newVariant = new ProductVariant({
                    product: newProduct._id,
                    variantName: variant.variantName,
                    unit: variant.unit,
                    weight: variant.weight,
                    mrp: variant.mrp,
                    sellingPrice: variant.sellingPrice,
                    // Sane defaults for pricing, assuming a couple of major cities
                    // In a real scenario, this might be more dynamic
                    pricing: [
                        { pincode: '110001', cityName: 'Delhi', mrp: variant.mrp, sellingPrice: variant.sellingPrice },
                        { pincode: '400001', cityName: 'Mumbai', mrp: variant.mrp, sellingPrice: variant.sellingPrice + 2 } // Example variation
                    ],
                    images: [],
                });
                await newVariant.save();
            }
            logger.info(`  - Created ${variantInfo.length} variants for ${newProduct.name}.`, 'ProductVariantSeeder');
        }

        logger.info('Product and variant seeding completed successfully.', 'ProductVariantSeeder');
        process.exit(0);
    } catch (error) {
        logger.error('Error during product and variant seeding', 'ProductVariantSeeder', error);
        process.exit(1);
    }
};

seedProductsAndVariants();
