import { Product, ProductVariant, Catalog, Inventory, ProductVariantChangeRequest } from '../models/index.js';
import { uploadToS3, deleteFromS3 } from '../utils/s3Uploader.js';
import logger from '../utils/appLogger.js';
import mongoose from 'mongoose';

const createProductAdmin = async (req, res) => {
    const { productData, variantData } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    const uploadedImageUrls = [];

    try {
        if (!productData || !variantData) {
            return res.status(400).json({ message: 'productData and variantData are required.' });
        }

        let parsedProductData;
        let parsedVariantData;
        try {
            parsedProductData = JSON.parse(productData);
            // Expect variantData to be an array of variants
            parsedVariantData = JSON.parse(variantData); 
            if (!Array.isArray(parsedVariantData)) {
                throw new Error("variantData should be an array.")
            }
        } catch (e) {
            return res.status(400).json({ message: `Invalid JSON format in productData or variantData. ${e.message}` });
        }

        const category = await Catalog.findById(parsedProductData.catalogNodeId).session(session);
        if (!category) {
            return res.status(404).json({ message: `Catalog with id ${parsedProductData.catalogNodeId} not found.` });
        }

        // Group uploaded files by their fieldname
        const imageFiles = {};
        if (req.files) {
            for (const file of req.files) {
                if (!imageFiles[file.fieldname]) {
                    imageFiles[file.fieldname] = [];
                }
                imageFiles[file.fieldname].push(file);
            }
        }

        const processImages = async (files) => {
            const imageUrls = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    const uploadedUrl = await uploadToS3(file);
                    uploadedImageUrls.push(uploadedUrl);
                    imageUrls.push({ url: uploadedUrl });
                }
            }
            return imageUrls;
        };

        const productImages = await processImages(imageFiles['productImages']);

        const newProduct = new Product({
            ...parsedProductData,
            images: productImages,
        });
        await newProduct.save({ session });

        const newVariants = [];
        for (let i = 0; i < parsedVariantData.length; i++) {
            const variant = parsedVariantData[i];
            const variantImageFiles = imageFiles[`variantImages[${i}]`] || [];
            const variantImages = await processImages(variantImageFiles);

            const newVariant = new ProductVariant({
                ...variant,
                product: newProduct._id,
                images: variantImages,
            });
            await newVariant.save({ session });
            newVariants.push(newVariant);
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ product: newProduct, variants: newVariants });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        if (uploadedImageUrls.length > 0) {
            logger.info('Cleaning up orphaned S3 images due to transaction failure.', 'createProductAdmin');
            for (const url of uploadedImageUrls) {
                await deleteFromS3(url);
            }
        }

        logger.error('Error creating product (admin)', 'createProductAdmin', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A product or variant with the same unique fields (e.g., SKU, barcode) already exists.' });
        }
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};


const updateProductAdmin = async (req, res) => {
    const { productId } = req.params;
    const { productData, variantsData } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    const uploadedImageUrls = [];
    const imagesToDelete = []; // Keep track of old images to delete on success

    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID format.' });
        }
        if (!productData && !variantsData) {
            return res.status(400).json({ message: 'At least one of productData or variantsData must be provided.' });
        }

        let parsedProductData = {};
        let parsedVariantsData = [];
        if (productData) {
            try {
                parsedProductData = JSON.parse(productData);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid JSON format in productData.' });
            }
        }
        if (variantsData) {
            try {
                parsedVariantsData = JSON.parse(variantsData);
                 if (!Array.isArray(parsedVariantsData)) {
                    throw new Error("variantsData should be an array.")
                }
            } catch (e) {
                return res.status(400).json({ message: `Invalid JSON format in variantsData. ${e.message}` });
            }
        }

        const product = await Product.findById(productId).session(session);
        if (!product) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: `Product with id ${productId} not found.` });
        }

        // Group uploaded files by their fieldname
        const imageFiles = {};
        if (req.files) {
            for (const file of req.files) {
                if (!imageFiles[file.fieldname]) {
                    imageFiles[file.fieldname] = [];
                }
                imageFiles[file.fieldname].push(file);
            }
        }

        const processImages = async (files) => {
            const imageUrls = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    const uploadedUrl = await uploadToS3(file);
                    uploadedImageUrls.push(uploadedUrl); // For cleanup on failure
                    imageUrls.push({ url: uploadedUrl });
                }
            }
            return imageUrls;
        };

        // --- Update Product ---
        if (productData) {
            // Unset fields that are explicitly set to null
            Object.keys(parsedProductData).forEach(key => {
                if (parsedProductData[key] === null) {
                    product.set(key, undefined);
                    delete parsedProductData[key];
                }
            });

            Object.assign(product, parsedProductData);

            // Handle product image additions
            const newProductImages = await processImages(imageFiles['productImages']);
            if (newProductImages.length > 0) {
                product.images = product.images.concat(newProductImages);
            }
            
            // Handle product image removals
            if (parsedProductData.imagesToRemove && Array.isArray(parsedProductData.imagesToRemove)) {
                product.images = product.images.filter(img => {
                    const shouldRemove = parsedProductData.imagesToRemove.includes(img.url);
                    if (shouldRemove) imagesToDelete.push(img.url);
                    return !shouldRemove;
                });
            }
        }
        await product.save({ session });


        // --- Update Variants ---
        if (variantsData) {
            const incomingVariantIds = parsedVariantsData.map(v => v._id).filter(id => id);

            // Delete variants that are not in the incoming list
            const variantsToDelete = await ProductVariant.find({ 
                product: productId, 
                _id: { $nin: incomingVariantIds } 
            }).session(session);

            for (const variant of variantsToDelete) {
                const invCount = await Inventory.countDocuments({ productVariant: variant._id }).session(session);
                if (invCount > 0) {
                    throw new Error(`Cannot delete variant ${variant.variantName} (${variant.sku}) as it has existing inventory.`);
                }
                variant.images.forEach(img => imagesToDelete.push(img.url));
                await ProductVariant.findByIdAndDelete(variant._id, { session });
            }

            // Update existing and create new variants
            for (let i = 0; i < parsedVariantsData.length; i++) {
                const variantData = parsedVariantsData[i];
                const variantImageFiles = imageFiles[`variantImages[${i}]`] || [];

                if (variantData._id) { // Existing variant
                    const variant = await ProductVariant.findById(variantData._id).session(session);
                    if (!variant) throw new Error(`Variant with id ${variantData._id} not found.`);

                    Object.keys(variantData).forEach(key => {
                        if (variantData[key] === null) {
                            variant.set(key, undefined);
                            delete variantData[key];
                        }
                    });
                    Object.assign(variant, variantData);

                    const newVariantImages = await processImages(variantImageFiles);
                    if (newVariantImages.length > 0) {
                        variant.images = variant.images.concat(newVariantImages);
                    }
                    if (variantData.imagesToRemove && Array.isArray(variantData.imagesToRemove)) {
                        variant.images = variant.images.filter(img => {
                            const shouldRemove = variantData.imagesToRemove.includes(img.url);
                            if (shouldRemove) imagesToDelete.push(img.url);
                            return !shouldRemove;
                        });
                    }

                    await variant.save({ session });
                } else { // New variant
                    const newVariantImages = await processImages(variantImageFiles);
                    const newVariant = new ProductVariant({
                        ...variantData,
                        product: productId,
                        images: newVariantImages,
                    });
                    await newVariant.save({ session });
                }
            }
        }


        await session.commitTransaction();
        
        // Cleanup old images from S3 after transaction is successful
        if (imagesToDelete.length > 0) {
            logger.info('Cleaning up old S3 images after successful update.', 'updateProductAdmin');
            for (const url of imagesToDelete) {
                await deleteFromS3(url);
            }
        }
        
        // Refetch the product to return the fully updated state
        const updatedProduct = await Product.findById(productId);
        const updatedVariants = await ProductVariant.find({ product: productId });

        session.endSession();

        res.status(200).json({ message: 'Product updated successfully.', data: { ...updatedProduct.toObject(), variants: updatedVariants } });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        if (uploadedImageUrls.length > 0) {
            logger.info('Cleaning up newly uploaded S3 images due to transaction failure.', 'updateProductAdmin');
            for (const url of uploadedImageUrls) {
                await deleteFromS3(url);
            }
        }

        logger.error(`Error updating product ${productId} (admin)`, 'updateProductAdmin', error);
         if (error.message.includes('Cannot delete variant')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A product or variant with the same unique fields (e.g., SKU, barcode) already exists.' });
        }
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};


const searchProducts = async (req, res) => {
    try {
        const { categoryId, key, searchTerm, pincode, page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        let targetCategoryIds = [];

        // --- Enhanced Catalog Filtering ---
        let startCategoryId = null;
        if (categoryId) {
            startCategoryId = new mongoose.Types.ObjectId(categoryId);
        } else if (key) {
            const requestedCategory = await Catalog.findOne({ key: key.toUpperCase() });
            if (requestedCategory) {
                startCategoryId = requestedCategory._id;
            }
        }

        if (startCategoryId) {
            const categoryHierarchy = await Catalog.aggregate([
                { $match: { _id: startCategoryId } },
                {
                    $graphLookup: {
                        from: 'categories',
                        startWith: '$_id',
                        connectFromField: '_id',
                        connectToField: 'parentId',
                        as: 'descendants',
                        depthField: 'depth'
                    }
                },
                {
                    $project: {
                        allCategoryIds: {
                            $concatArrays: [ ["$_id"], "$descendants._id" ]
                        }
                    }
                }
            ]);

            if (categoryHierarchy.length > 0) {
                targetCategoryIds = categoryHierarchy[0].allCategoryIds;
            } else if (categoryId) { // Fallback for a valid ID that might not be in the hierarchy aggregation for some reason
                targetCategoryIds = [new mongoose.Types.ObjectId(categoryId)];
            }
        }
        
        let pipeline = [];
        const matchStage = {};

        if (targetCategoryIds.length > 0) {
            matchStage.category = { $in: targetCategoryIds };
        }

        if (searchTerm) {
            matchStage.$text = { $search: searchTerm };
        }

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // --- Group Variants by Product ---
        pipeline.push(
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'variants'
                }
            },
            // Only include products that have at least one variant
            {
                $match: { 'variants.0': { $exists: true } }
            }
        );

        // --- Pincode Sorting Logic for Grouped Variants ---
        if (pincode) {
            pipeline.push(
                {
                    $addFields: {
                        hasPincodePrice: {
                            $anyElementTrue: {
                                $map: {
                                   input: "$variants",
                                   as: "variant",
                                   in: { $in: [pincode, "$$variant.pricing.pincode"] }
                                }
                            }
                        }
                    }
                },
                { $sort: { hasPincodePrice: -1, _id: 1 } }
            );
        }

        // --- Pagination ---
        pipeline.push(
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [{ $skip: skip }, { $limit: limitNum }]
                }
            }
        );

        const result = await Product.aggregate(pipeline);

        const data = result[0].data;
        // The total count is now of products, not variants
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
        logger.error('Error searching products', 'searchProducts', error);
        res.status(500).json({ message: 'Error searching products', error: error.message });
    }
};

const createProductVariant = async (req, res) => {
    const { productId } = req.params;
    const { variantData } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    const uploadedImageUrls = [];

    try {
        if (!variantData) {
            return res.status(400).json({ message: 'variantData is required.' });
        }

        let parsedVariantData;
        try {
            parsedVariantData = JSON.parse(variantData);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid JSON format in variantData.' });
        }

        const product = await Product.findById(productId).session(session);
        if (!product) {
            return res.status(404).json({ message: `Product with id ${productId} not found.` });
        }

        // Handle missing pricing info by copying from another variant if available
        if (parsedVariantData.pricing && parsedVariantData.pricing.length > 0) {
            const firstPricing = parsedVariantData.pricing[0];
            if (!firstPricing.pincode || !firstPricing.cityName) {
                const anotherVariant = await ProductVariant.findOne({ product: productId }).session(session);
                if (anotherVariant && anotherVariant.pricing && anotherVariant.pricing.length > 0) {
                    const referencePricing = anotherVariant.pricing[0];
                    for (const price of parsedVariantData.pricing) {
                        price.pincode = price.pincode || referencePricing.pincode;
                        price.cityName = price.cityName || referencePricing.cityName;
                    }
                }
            }
        }

        const processImages = async (files) => {
            const imageUrls = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    const uploadedUrl = await uploadToS3(file);
                    uploadedImageUrls.push(uploadedUrl);
                    imageUrls.push({ url: uploadedUrl });
                }
            }
            return imageUrls;
        };

        const variantImages = await processImages(req.files?.variantImages || []);

        const newVariant = new ProductVariant({
            ...parsedVariantData,
            product: productId,
            images: variantImages,
        });
        await newVariant.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(newVariant);

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        if (uploadedImageUrls.length > 0) {
            logger.info('Cleaning up orphaned S3 images due to transaction failure.', 'createProductVariant');
            for (const url of uploadedImageUrls) {
                await deleteFromS3(url);
            }
        }

        logger.error('Error creating product variant', 'createProductVariant', error);


        if (error.code === 11000) {
            return res.status(409).json({ message: 'A variant with the same unique fields (e.g., SKU, barcode) already exists.' });
        }
        res.status(500).json({ message: 'Error creating product variant', error: error.message });
    }
};

const updateProductVariant = async (req, res) => {
    const { variantId } = req.params;
    const updateData = req.body;
    // Fallback user object for environments where auth middleware is not present
    const user = req.user || { role: 'admin', _id: new mongoose.Types.ObjectId() };
    
    // Disallow changing the product reference
    delete updateData.product;

    try {
        const variant = await ProductVariant.findById(variantId);

        if (!variant) {
            return res.status(404).json({ message: `ProductVariant with id ${variantId} not found.` });
        }

        if (req.files && Object.keys(req.files).length > 0) {
            return res.status(400).json({ message: 'This endpoint does not support file uploads for image updates.' });
        }

        if (user && user.role === 'admin') {
            Object.assign(variant, updateData);
            const updatedVariant = await variant.save();
            return res.status(200).json(updatedVariant);
        } else {
            // Non-admins or if user role is not defined, create a change request
            const changeRequest = new ProductVariantChangeRequest({
                variant: variantId,
                requestedBy: user._id,
                changes: updateData,
            });
            await changeRequest.save();
            return res.status(202).json({
                message: 'Update request submitted for approval.',
                changeRequest,
            });
        }

    } catch (error) {
        logger.error(`Error processing update for product variant ${variantId}`, 'updateProductVariant', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A variant with the same unique fields (e.g., SKU, barcode) may already exist. This will be checked upon approval.' });
        }
        res.status(500).json({ message: 'Error processing product variant update request', error: error.message });
    }
};

const deleteProductVariant = async (req, res) => {
    const { variantId } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const variant = await ProductVariant.findById(variantId).session(session); // find first to get image urls
        if (!variant) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: `ProductVariant with id ${variantId} not found.` });
        }

        const inventoryCount = await Inventory.countDocuments({ productVariant: variantId }).session(session);
        if (inventoryCount > 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Cannot delete variant with existing inventory. Please clear inventory first.' });
        }

        const imageUrls = variant.images.map(img => img.url);

        await ProductVariant.findByIdAndDelete(variantId, { session });

        // If deletion is successful, delete images from S3
        if (imageUrls.length > 0) {
            logger.info(`Cleaning up S3 images for deleted variant ${variantId}`, 'deleteProductVariant');
            for (const url of imageUrls) {
                await deleteFromS3(url);
            }
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Product variant deleted successfully.' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger.error(`Error deleting product variant ${variantId}`, 'deleteProductVariant', error);
        res.status(500).json({ message: 'Error deleting product variant', error: error.message });
    }
};


// --- New controllers for change requests ---

const getChangeRequests = async (req, res) => {
    // Fallback user object for environments where auth middleware is not present
    const user = req.user || { role: 'admin' };
    
    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to view change requests.' });
    }

    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const requests = await ProductVariantChangeRequest.find({ status })
            .populate('variant')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
            
        const total = await ProductVariantChangeRequest.countDocuments({ status });

        res.status(200).json({
            data: requests,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        logger.error('Error fetching change requests', 'getChangeRequests', error);
        res.status(500).json({ message: 'Error fetching change requests', error: error.message });
    }
};

const approveChangeRequest = async (req, res) => {
    const { requestId } = req.params;
    // Fallback user object for environments where auth middleware is not present
    const user = req.user || { role: 'admin', _id: new mongoose.Types.ObjectId() };
    
    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to approve requests.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const request = await ProductVariantChangeRequest.findById(requestId).session(session);

        if (!request) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Change request not found.' });
        }

        if (request.status !== 'pending') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `This request is already ${request.status}.` });
        }

        const variant = await ProductVariant.findById(request.variant).session(session);
        if (!variant) {
            request.status = 'rejected';
            request.rejectionReason = 'The associated product variant no longer exists.';
            request.reviewedBy = user._id;
            await request.save({ session });

            await session.commitTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Associated product variant not found. The request has been automatically rejected.' });
        }

        Object.assign(variant, request.changes);
        await variant.save({ session });

        request.status = 'approved';
        request.reviewedBy = user._id;
        await request.save({ session });
        
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Change request approved and product variant updated successfully.', variant });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger.error(`Error approving change request ${requestId}`, 'approveChangeRequest', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Update failed due to a conflict. A different variant may already have the same unique value (e.g., SKU, barcode).' });
        }
        res.status(500).json({ message: 'An internal error occurred while approving the change request.', error: error.message });
    }
};

const rejectChangeRequest = async (req, res) => {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    // Fallback user object for environments where auth middleware is not present
    const user = req.user || { role: 'admin', _id: new mongoose.Types.ObjectId() };
    
    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to reject requests.' });
    }

    if (!rejectionReason) {
        return res.status(400).json({ message: 'A reason for rejection is required.' });
    }

    try {
        const request = await ProductVariantChangeRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: 'Change request not found.' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: `This request is already ${request.status}.` });
        }

        request.status = 'rejected';
        request.rejectionReason = rejectionReason;
        request.reviewedBy = user._id;
        await request.save();

        res.status(200).json({ message: 'Change request has been rejected.', request });

    } catch (error) {
        logger.error(`Error rejecting change request ${requestId}`, 'rejectChangeRequest', error);
        res.status(500).json({ message: 'An internal error occurred while rejecting the request.', error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID format.' });
        }

        const pipeline = [
            { $match: { _id: new mongoose.Types.ObjectId(productId) } },
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'variants'
                }
            },
            {
                $limit: 1 // We expect only one product
            }
        ];

        const result = await Product.aggregate(pipeline);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const product = result[0];

        res.status(200).json({ data: product });

    } catch (error) {
        logger.error(`Error fetching product by ID: ${req.params.productId}`, 'getProductById', error);
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

const searchProductsForUser = async (req, res) => {
    try {
        const { pincode, key, searchTerm, page = 1, limit = 10 } = req.query;

        if (!pincode) {
            return res.status(400).json({ message: 'Pincode is required for this search.' });
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        let targetCategoryIds = [];

        if (key) {
            const requestedCategory = await Catalog.findOne({ key: key.toUpperCase() });
            if (requestedCategory) {
                const categoryHierarchy = await Catalog.aggregate([
                    { $match: { _id: requestedCategory._id } },
                    {
                        $graphLookup: {
                            from: 'categories',
                            startWith: '$_id',
                            connectFromField: '_id',
                            connectToField: 'parentId',
                            as: 'descendants',
                        }
                    },
                    {
                        $project: {
                            allCategoryIds: {
                                $concatArrays: [ ["$_id"], "$descendants._id" ]
                            }
                        }
                    }
                ]);
                if (categoryHierarchy.length > 0) {
                    targetCategoryIds = categoryHierarchy[0].allCategoryIds;
                }
            }
        }
        
        let pipeline = [];
        const matchStage = {};

        if (targetCategoryIds.length > 0) {
            matchStage.category = { $in: targetCategoryIds };
        }

        if (searchTerm) {
            matchStage.$text = { $search: searchTerm };
        }

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Main logic to find variants with inventory
        pipeline.push(
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'variants'
                }
            },
            { $unwind: '$variants' },
            {
                $lookup: {
                    from: 'inventories',
                    let: { variantId: "$variants._id" },
                    pipeline: [
                        { 
                            $match: {
                                pincode: pincode,
                                $expr: { $eq: ["$productVariant", "$$variantId"] }
                            }
                        }
                    ],
                    as: 'variants.inventory'
                }
            },
            // Filter out variants that do not have inventory in the specified pincode
            { $match: { 'variants.inventory.0': { $exists: true } } },
            // Group variants back into products
            {
                $group: {
                    _id: '$_id',
                    productData: { $first: '$$ROOT' },
                    variants: { $push: '$variants' }
                }
            },
            // Reshape the document
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            {
                                _id: '$productData._id',
                                name: '$productData.name',
                                description: '$productData.description',
                                brand: '$productData.brand',
                                category: '$productData.category',
                                tags: '$productData.tags',
                                images: '$productData.images',
                                isActive: '$productData.isActive',
                                isVegetarian: '$productData.isVegetarian',
                                countryOfOrigin: '$productData.countryOfOrigin',
                                nutritionalInfo: '$productData.nutritionalInfo',
                                createdAt: '$productData.createdAt',
                                updatedAt: '$productData.updatedAt',
                            },
                            { variants: '$variants' }
                        ]
                    }
                }
            },
            { $sort: { _id: 1 } }
        );

        // --- Pagination ---
        const paginatedPipeline = pipeline.concat([
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [{ $skip: skip }, { $limit: limitNum }]
                }
            }
        ]);

        const result = await Product.aggregate(paginatedPipeline);

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
        logger.error('Error searching products for user', 'searchProductsForUser', error);
        res.status(500).json({ message: 'Error searching products', error: error.message });
    }
};

const getAllProductsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const products = await Product.find()
            .populate('category', 'name') // Populate only the name of the category
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(); // Use lean for better performance on read-heavy operations

        const total = await Product.countDocuments();

        const processedProducts = products.map(product => {
            if (!product.category) {
                // If populate does not find the category, it returns null.
                // We'll replace it with a placeholder object.
                product.category = { name: 'Invalid Catalog' };
            }
            return product;
        });

        res.status(200).json({
            data: processedProducts,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });

    } catch (error) {
        logger.error('Error getting all products for admin', 'getAllProductsAdmin', error);
        res.status(500).json({ message: 'Error getting products', error: error.message });
    }
};


export { createProductAdmin, updateProductAdmin, searchProducts, createProductVariant, updateProductVariant, deleteProductVariant, getChangeRequests, approveChangeRequest, rejectChangeRequest, getProductById, searchProductsForUser, getAllProductsAdmin };

