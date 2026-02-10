import { Inventory, ProductVariant } from '../../models/medicalModels/index.js';;
import logger from '../../utils/appLogger.js';
import mongoose from 'mongoose';

// Helper function to fetch city name from pincode using postal API
const getCityNameFromPincode = async (pincode) => {
    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
            // Get the first entry which contains the district information
            const firstPostOffice = data[0].PostOffice[0];
            if (firstPostOffice && firstPostOffice.District) {
                return firstPostOffice.District; // Using District as the city name
            }
        }
        return null;
    } catch (error) {
        logger.error('Error fetching city name from pincode API', 'getCityNameFromPincode', error);
        return null;
    }
};

const createBusinessInventory = async (req, res) => {
    const businessId = req.user._id;
    const inventoryItems = req.body;

    if (!Array.isArray(inventoryItems) || inventoryItems.length === 0) {
        return res.status(400).json({ message: 'Request body must be a non-empty array of inventory items.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const createdInventories = [];

        for (const item of inventoryItems) {
            const { productVariant: productVariantId, pincode, cityName, batches, supplierInfo, location, reorderPoint } = item;

            if (!productVariantId || !pincode || !batches) {
                throw new Error('Each inventory item must include productVariant, pincode, and batches.');
            }

            const variant = await ProductVariant.findById(productVariantId).session(session);
            if (!variant) {
                throw new Error(`ProductVariant with id ${productVariantId} not found.`);
            }

            // If cityName is not provided, fetch it from the pincode API
            let finalCityName = cityName;
            if (!finalCityName) {
                finalCityName = await getCityNameFromPincode(pincode);
                if (!finalCityName) {
                    finalCityName = null; // Set to null if API call fails
                }
            }

            // Find existing inventory or create a new one
            let inventory = await Inventory.findOne({
                businessId,
                productVariant: productVariantId,
                pincode,
            }).session(session);

            if (inventory) {
                // If it exists, push the new batches
                inventory.batches.push(...batches);
            } else {
                // If not, create a new inventory document
                inventory = new Inventory({
                    businessId,
                    productVariant: productVariantId,
                    pincode,
                    cityName: finalCityName,
                    batches,
                    supplierInfo,
                    location,
                    reorderPoint,
                });
            }

            const savedInventory = await inventory.save({ session });
            createdInventories.push(savedInventory);
        }

        await session.commitTransaction();
        res.status(201).json(createdInventories);
    } catch (error) {
        await session.abortTransaction();
        logger.error('Error creating business inventory', 'createBusinessInventory', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate inventory item detected. An inventory record for one of the product variants at the same pincode already exists.' });
        }
        res.status(500).json({ message: 'Error creating inventory', error: error.message });
    } finally {
        session.endSession();
    }
};



const getBusinessProducts = async (req, res) => {
    try {
        const businessId = req.user._id;
        const { categoryId, page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        let pipeline = [];

        // 1. Match inventory for the specific business
        pipeline.push({
            $match: {
                businessId: new mongoose.Types.ObjectId(businessId)
            }
        });

        // 2. Lookup related documents
        pipeline.push(
            { $lookup: { from: 'productvariants', localField: 'productVariant', foreignField: '_id', as: 'productVariant' } },
            { $unwind: '$productVariant' },
            { $lookup: { from: 'products', localField: 'productVariant.product', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' }
        );

        // 3. Filter by category if provided
        if (categoryId) {
            // Find all descendants of the given categoryId to include in the filter
            const categoryWithDescendants = await mongoose.model('Category').aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(categoryId) } },
                {
                    $graphLookup: {
                        from: 'categories',
                        startWith: '$_id',
                        connectFromField: '_id',
                        connectToField: 'parentId',
                        as: 'descendants'
                    }
                }
            ]);

            let categoryIdsToFilter = [new mongoose.Types.ObjectId(categoryId)];
            if (categoryWithDescendants.length > 0 && categoryWithDescendants[0].descendants.length > 0) {
                categoryIdsToFilter = categoryIdsToFilter.concat(categoryWithDescendants[0].descendants.map(d => d._id));
            }

            pipeline.push({
                $match: { 'product.category': { $in: categoryIdsToFilter } }
            });
        }

        // 4. Find the main category for each product
        pipeline.push(
            { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
            { $unwind: '$category' },
            {
                $graphLookup: {
                    from: 'categories',
                    startWith: '$category._id',
                    connectFromField: 'parentId',
                    connectToField: '_id',
                    as: 'categoryHierarchy'
                }
            },
            {
                $addFields: {
                    mainCategory: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    { $filter: { input: '$categoryHierarchy', as: 'cat', cond: { $eq: ['$$cat.level', 0] } } },
                                    0
                                ]
                            },
                            { $cond: { if: { $eq: ['$category.level', 0] }, then: '$category', else: null } }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    mainCategory: { $ifNull: ['$mainCategory', { _id: null, name: 'Uncategorized' }] }
                }
            }
        );

        // 5. Group by main category and product to collect variants and their inventory
        pipeline.push(
            {
                $group: {
                    _id: {
                        mainCategory: '$mainCategory._id',
                        product: '$product._id'
                    },
                    mainCategory: { $first: '$mainCategory' },
                    product: { $first: '$product' },
                    variants: {
                        $push: {
                            _id: '$productVariant._id',
                            variantName: '$productVariant.variantName',
                            unit: '$productVariant.unit',
                            sku: '$productVariant.sku',
                            pricing: '$productVariant.pricing',
                            images: '$productVariant.images',
                            weight: '$productVariant.weight',
                            inventory: {
                                inventoryId: '$_id',
                                pincode: '$pincode',
                                cityName: '$cityName',
                                batches: '$batches',
                                totalStock: '$totalStock' // virtual field
                            }
                        }
                    },
                    productLastUpdate: { $max: '$updatedAt' }
                }
            },
            // 6. Group again by main category to nest products
            {
                $group: {
                    _id: '$_id.mainCategory',
                    name: { $first: '$mainCategory.name' },
                    image: { $first: '$mainCategory.image' },
                    products: {
                        $push: {
                            _id: '$product._id',
                            name: '$product.name',
                            description: '$product.description',
                            brand: '$product.brand',
                            images: '$product.images',
                            lastInventoryAddedOrUpdated: '$productLastUpdate',
                            variants: '$variants'
                        }
                    },
                    lastUpdate: { $max: '$productLastUpdate' }
                }
            },
            // 7. Count total variants in the category
            {
                $addFields: {
                    productVariantCount: {
                        $sum: {
                            $map: {
                                input: '$products',
                                as: 'p',
                                in: { $size: '$$p.variants' }
                            }
                        }
                    }
                }
            },
            // 8. Shape the final output
            {
                $project: {
                    _id: 0,
                    category: {
                        _id: '$_id',
                        name: '$name',
                        image: '$image',
                        lastUpdate: '$lastUpdate',
                        productVariantCount: '$productVariantCount',
                        products: '$products'
                    }
                }
            }
        );

        // 9. Pagination
        pipeline.push(
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [{ $skip: skip }, { $limit: limitNum }]
                }
            }
        );

        const result = await Inventory.aggregate(pipeline);

        const data = result[0].data;
        const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

        res.status(200).json({
            data,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });

    } catch (error) {
        logger.error('Error fetching business products', 'getBusinessProducts', error);
        res.status(500).json({ message: 'Error fetching business products', error: error.message });
    }
};


const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user._id;
        const updateData = req.body;

        // Optionally, if productVariant is updated, ensure it exists
        if (updateData.productVariant) {
            const variant = await ProductVariant.findById(updateData.productVariant);
            if (!variant) {
                return res.status(404).json({ message: `ProductVariant with id ${updateData.productVariant} not found.` });
            }
        }

        const inventory = await Inventory.findOneAndUpdate(
            { _id: id, businessId: businessId },
            { $set: updateData }, // $set replaces existing batches if updateData.batches is present
            { new: true, runValidators: true }
        );

        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found or you do not have permission to update it.' });
        }

        res.status(200).json(inventory);

    } catch (error) {
        logger.error(`Error updating inventory ${req.params.id}`, 'updateInventory', error);
        res.status(500).json({ message: 'Error updating inventory', error: error.message });
    }
};



const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user._id;

        const inventory = await Inventory.findOneAndDelete({ _id: id, businessId: businessId });

        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found or you do not have permission to delete it.' });
        }

        res.status(200).json({ message: 'Inventory deleted successfully.' });

    } catch (error) {
        logger.error(`Error deleting inventory ${req.params.id}`, 'deleteInventory', error);
        res.status(500).json({ message: 'Error deleting inventory', error: error.message });
    }
};

export { createBusinessInventory, getBusinessProducts, updateInventory, deleteInventory };
