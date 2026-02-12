import mongoose from 'mongoose';
import { Category, Inventory } from '../../models/medicalModels/index.js';
import { uploadToS3, deleteFromS3 } from '../../utils/s3Uploader.js';
import logger from '../../utils/appLogger.js';

const createCategory = async (req, res) => {
    const { name, key, description, parentId, isActive } = req.body;

    try {
        let imageUrl;
        let imageOptionsUrls = [];

        if (req.files && req.files.image && req.files.image.length > 0) {
            imageUrl = await uploadToS3(req.files.image[0]);
        }

        if (req.files && req.files.imageOptions && req.files.imageOptions.length > 0) {
            for (const file of req.files.imageOptions) {
                const url = await uploadToS3(file);
                imageOptionsUrls.push(url);
            }
        }

        let level = 0;
        if (parentId) {
            const parentCategory = await Category.findById(parentId);
            if (!parentCategory) {
                return res.status(404).json({ message: 'Parent category not found' });
            }
            level = parentCategory.level + 1;
        }

        const newCategory = new Category({
            name,
            key,
            description,
            parentId: parentId || null,
            level,
            isActive,
            image: imageUrl,
            imageOptions: imageOptionsUrls,
        });

        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        logger.error('Error creating category', 'createCategory', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A category with this name or key already exists.' });
        }
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().select('-imageOptions').sort({ level: 1 });
        res.status(200).json(categories);
    } catch (error) {
        logger.error('Error fetching categories', 'getCategories', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).select('-imageOptions');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        logger.error(`Error fetching category ${req.params.id}`, 'getCategoryById', error);
        res.status(500).json({ message: 'Error fetching category', error: error.message });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, key, description, parentId, level, isActive } = req.body; // req.body.image and req.body.imageOptions might also be here

    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        let newMainImage = category.image;
        // Make a mutable copy of imageOptionsUrls. This array will be modified.
        let newImageOptions = category.imageOptions ? [...category.imageOptions] : [];

        // Track images to delete from S3
        let s3Deletions = [];

        // --- Handle Main Image Update ---
        if (req.files && req.files.image && req.files.image.length > 0) {
            // Priority 1: New file uploaded for main image
            if (newMainImage) {
                newImageOptions.push(newMainImage); // Move old main image to options
                logger.info(`Moved old main image (${newMainImage}) to imageOptions for category ${id}.`, 'updateCategory');
            }
            newMainImage = await uploadToS3(req.files.image[0]);
            logger.info(`Updated main image for category ${id} via file upload.`, 'updateCategory');
        } else if (req.body.image !== undefined) {
            // Priority 2: URL provided in req.body.image (no new file uploaded for main image)
            const requestedMainImage = req.body.image;

            if (requestedMainImage === null || requestedMainImage === '') {
                // Case 1: Clear main image
                if (newMainImage) {
                    s3Deletions.push(newMainImage);
                }
                newMainImage = null;
                logger.info(`Cleared main image for category ${id}.`, 'updateCategory');
            } else if (requestedMainImage !== newMainImage) {
                // Case 2: Requested main image is different from current. Could be a swap or new external URL.
                const optionIndex = newImageOptions.indexOf(requestedMainImage);

                if (optionIndex !== -1) {
                    // It's a swap: requestedMainImage is one of the existing options
                    newImageOptions.splice(optionIndex, 1); // Remove from options
                    if (newMainImage) {
                        newImageOptions.push(newMainImage); // Add old main to options
                        logger.info(`Moved old main image to options for category ${id}.`, 'updateCategory');
                    }
                    newMainImage = requestedMainImage; // Set new main
                    logger.info(`Swapped main image with an option for category ${id}.`, 'updateCategory');
                } else {
                    // It's a new external URL or a URL that was previously deleted.
                    // If the old main image was managed by us, mark it for deletion.
                    if (newMainImage) {
                        s3Deletions.push(newMainImage);
                    }
                    newMainImage = requestedMainImage;
                    logger.info(`Set external main image for category ${id}. Old main image marked for deletion.`, 'updateCategory');
                }
            }
            // If requestedMainImage is same as newMainImage, no action needed for newMainImage.
        }
        // If req.body.image is not provided, newMainImage retains its original value.


        // --- Handle Optional Images Update ---
        if (req.files && req.files.imageOptions && req.files.imageOptions.length > 0) {
            // Priority 3: New files uploaded for optional images
            // Mark ALL current optional images for deletion
            for (const oldOptionUrl of newImageOptions) {
                s3Deletions.push(oldOptionUrl);
            }
            newImageOptions = []; // Clear current options
            for (const file of req.files.imageOptions) {
                const url = await uploadToS3(file);
                newImageOptions.push(url);
            }
            logger.info(`Updated all optional images for category ${id} via file upload.`, 'updateCategory');
        } else if (req.body.imageOptions !== undefined) {
            // Priority 4: Array of URLs provided in req.body.imageOptions (no new files uploaded)
            const requestedImageOptions = req.body.imageOptions;

            if (!Array.isArray(requestedImageOptions)) {
                return res.status(400).json({ message: 'imageOptions must be an array of URLs.' });
            }

            // Identify options to delete from S3 (those in newImageOptions but not in requestedImageOptions)
            for (const oldOptionUrl of newImageOptions) {
                if (!requestedImageOptions.includes(oldOptionUrl) && oldOptionUrl !== newMainImage) {
                    s3Deletions.push(oldOptionUrl);
                }
            }

            // Set newImageOptions to the requested list, ensuring the newMainImage is not duplicated if it was an option.
            newImageOptions = requestedImageOptions.filter(url => url !== newMainImage);
            logger.info(`Updated optional images for category ${id} via URL array.`, 'updateCategory');
        }
        // If req.body.imageOptions is not provided and no files uploaded, newImageOptions retains its current value.

        // Perform S3 deletions for all marked URLs
        await Promise.all(s3Deletions.map(url => deleteFromS3(url).catch(err => {
            logger.warn(`Failed to delete old S3 image: ${url}. Error: ${err.message}`, 'updateCategory');
            // Continue even if one deletion fails
        })));


        // Update category document properties
        category.name = name ?? category.name;
        category.key = key ?? category.key;
        category.description = description ?? category.description;
        category.parentId = (parentId === '' ? null : parentId) ?? category.parentId;
        category.level = level ?? category.level;
        category.isActive = isActive ?? category.isActive;
        category.image = newMainImage;
        category.imageOptions = newImageOptions;

        const updatedCategory = await category.save();
        res.status(200).json(updatedCategory);
    } catch (error) {
        logger.error(`Error updating category ${id}`, 'updateCategory', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A category with this name or key already exists.' });
        }
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if the category is a parent to any other categories
        const childCount = await Category.countDocuments({ parentId: category._id });
        if (childCount > 0) {
            return res.status(400).json({ message: 'Cannot delete a category that has sub-categories. Please delete them first.' });
        }

        // If there's an image, delete it from S3
        if (category.image) {
            await deleteFromS3(category.image);
        }

        await category.deleteOne(); // Use deleteOne instead of remove
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting category ${req.params.id}`, 'deleteCategory', error);
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};

const getNestedCategories = async (req, res) => {
    try {
        const { categoryId, categoryKey } = req.query;

        const categories = await Category.find().select('-imageOptions').lean();
        const categoryMap = new Map();

        categories.forEach(category => {
            category.children = [];
            categoryMap.set(category._id.toString(), category);
        });

        const rootCategories = [];

        categories.forEach(category => {
            if (category.parentId) {
                const parent = categoryMap.get(category.parentId.toString());
                if (parent) {
                    parent.children.push(category);
                }
            } else {
                rootCategories.push(category);
            }
        });

        if (categoryId) {
            const category = categoryMap.get(categoryId);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            return res.status(200).json(category);
        }

        if (categoryKey) {
            const upperKey = categoryKey.toUpperCase();
            const category = categories.find(c => c.key === upperKey);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            // we need to get the category from the map to get children
            const categoryFromMap = categoryMap.get(category._id.toString());
            return res.status(200).json(categoryFromMap);
        }

        res.status(200).json(rootCategories);
    } catch (error) {
        logger.error('Error fetching nested categories', 'getNestedCategories', error);
        res.status(500).json({ message: 'Error fetching nested categories', error: error.message });
    }
};

const getChildrenByCategoryId = async (req, res) => {
    try {
        const parentId = req.params.id;
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
            return res.status(404).json({ message: 'Parent category not found' });
        }

        const children = await Category.find({ parentId: parentId }).select('-imageOptions');
        res.status(200).json(children);
    } catch (error) {
        logger.error(`Error fetching children for category ${req.params.id}`, 'getChildrenByCategoryId', error);
        res.status(500).json({ message: 'Error fetching children categories', error: error.message });
    }
};

const getChildrenByCategoryKey = async (req, res) => {
    try {
        const parentKey = req.params.key;
        const parentCategory = await Category.findOne({ key: parentKey.toUpperCase() }); // Assuming keys are stored uppercase
        if (!parentCategory) {
            return res.status(404).json({ message: 'Parent category not found with provided key.' });
        }

        const children = await Category.find({ parentId: parentCategory._id }).select('-imageOptions');
        res.status(200).json(children);
    } catch (error) {
        logger.error(`Error fetching children for category key ${req.params.key}`, 'getChildrenByCategoryKey', error);
        res.status(500).json({ message: 'Error fetching children categories by key', error: error.message });
    }
};



const searchCategories = async (req, res) => {
    try {
        const { key, name, excludeImage } = req.query;
        const query = {};
        const projection = {};

        if (key) {
            query.key = { $regex: key, $options: 'i' };
        }
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        if (excludeImage === 'true') {
            projection.image = 0; // Exclude the image field
        }



        projection.imageOptions = 0; // Exclude imageOptions by default for backward compatibility
        const categories = await Category.find(query, projection);
        res.status(200).json(categories);

    } catch (error) {
        logger.error('Error searching categories', 'searchCategories', error);
        res.status(500).json({ message: 'Error searching categories', error: error.message });
    }
};

const getBusinessCategoriesWithInventory = async (req, res) => {
    try {
        const businessId = req.user._id;

        const pipeline = [
            // 1. Match inventory for the specific business
            {
                $match: {
                    businessId: new mongoose.Types.ObjectId(businessId)
                }
            },
            // 2. Lookup productVariant
            {
                $lookup: {
                    from: 'productvariants',
                    localField: 'productVariant',
                    foreignField: '_id',
                    as: 'productVariant'
                }
            },
            { $unwind: '$productVariant' },
            // 3. Lookup product
            {
                $lookup: {
                    from: 'products',
                    localField: 'productVariant.product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            // 4. Lookup category
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            // 5. Find the top-level parent (ancestor) of each category
            {
                $graphLookup: {
                    from: 'categories',
                    startWith: '$category.parentId',
                    connectFromField: 'parentId',
                    connectToField: '_id',
                    as: 'ancestors'
                }
            },
            // 6. Find the root category (level 0)
            {
                $addFields: {
                    rootCategory: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    { $filter: { input: '$ancestors', as: 'anc', cond: { $eq: ['$$anc.level', 0] } } },
                                    0
                                ]
                            },
                            { $cond: { if: { $eq: ['$category.level', 0] }, then: '$category', else: null } }
                        ]
                    }
                }
            },
            // 7. Filter out products that don't have a root category (should not happen with good data)
            {
                $match: {
                    'rootCategory': { $ne: null }
                }
            },
            // 8. Group by the root category to get a unique list
            {
                $group: {
                    _id: '$rootCategory._id',
                    name: { $first: '$rootCategory.name' },
                    key: { $first: '$rootCategory.key' },
                    description: { $first: '$rootCategory.description' },
                    image: { $first: '$rootCategory.image' },
                    isActive: { $first: '$rootCategory.isActive' },
                    level: { $first: '$rootCategory.level' },
                    createdAt: { $first: '$rootCategory.createdAt' },
                    updatedAt: { $first: '$rootCategory.updatedAt' }
                }
            },
            // 9. Reformat the output
            {
                $project: {
                    _id: '$_id',
                    name: '$name',
                    key: '$key',
                    description: '$description',
                    image: '$image',
                    isActive: '$isActive',
                    level: '$level',
                    createdAt: '$createdAt',
                    updatedAt: '$updatedAt'
                }
            },
            { $sort: { name: 1 } } // Sort alphabetically
        ];

        const categories = await Inventory.aggregate(pipeline);

        res.status(200).json(categories);

    } catch (error) {
        logger.error('Error fetching business categories with inventory', 'getBusinessCategoriesWithInventory', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

const getCategoriesWithImageOptions = async (req, res) => {
    try {
        const { categoryIds, categoryKeys } = req.query;
        let query = {};

        if (categoryIds) {
            const ids = categoryIds.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
            query._id = { $in: ids };
        }

        if (categoryKeys) {
            const keys = categoryKeys.split(',').map(key => key.trim().toUpperCase());
            query.key = { $in: keys };
        }

        if (Object.keys(query).length === 0) {
            return res.status(400).json({ message: 'Please provide at least one categoryId or categoryKey.' });
        }

        const categories = await Category.find(query); // Image options are included by default now

        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: 'No categories found for the provided IDs or keys.' });
        }

        res.status(200).json(categories);
    } catch (error) {
        logger.error('Error fetching categories with image options', 'getCategoriesWithImageOptions', error);
        res.status(500).json({ message: 'Error fetching categories with image options', error: error.message });
    }
};


const deleteImageOption = async (req, res) => {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ message: 'Image URL to delete is required.' });
    }

    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        const initialImageOptionsCount = category.imageOptions.length;
        category.imageOptions = category.imageOptions.filter(url => url !== imageUrl);

        if (category.imageOptions.length === initialImageOptionsCount) {
            return res.status(404).json({ message: 'Image URL not found in category options.' });
        }

        // Attempt to delete from S3
        await deleteFromS3(imageUrl).catch(err => {
            logger.warn(`Failed to delete S3 image ${imageUrl} during image option removal. Error: ${err.message}`, 'deleteImageOption');
            // Continue even if S3 deletion fails, as the URL is removed from DB.
        });

        await category.save();
        res.status(200).json({ message: 'Image option deleted successfully.', category });
    } catch (error) {
        logger.error(`Error deleting image option for category ${id}`, 'deleteImageOption', error);
        res.status(500).json({ message: 'Error deleting image option', error: error.message });
    }
};


export { createCategory, deleteImageOption, getCategories, getCategoryById, updateCategory, deleteCategory, getNestedCategories, getChildrenByCategoryId, getChildrenByCategoryKey, searchCategories, getBusinessCategoriesWithInventory, getCategoriesWithImageOptions };