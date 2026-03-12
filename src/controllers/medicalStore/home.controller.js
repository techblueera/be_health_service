import mongoose from 'mongoose';
import Gallery from '../../models/medicalModels/gallery.model.js';
import PharmacyContact from '../../models/medicalModels/contact.model.js';
import PharmacyAboutUs from '../../models/medicalModels/aboutUs.model.js';
import PharmacyTestimonial from '../../models/medicalModels/testimonial.model.js';
import Inventory from '../../models/medicalModels/inventory.model.js';
import { getBusinessById } from '../../grpc/clients/businessClient.js'; // Adjust path to your gRPC client
import logger from '../../utils/appLogger.js';

export const getMedicalHomeProfile = async (req, res) => {
  try {
    const { businessId } = req.params;
    const objectIdBusinessId = new mongoose.Types.ObjectId(businessId);

    // ============================================================================
    // 1. FETCH INDEPENDENT DATA CONCURRENTLY
    // ============================================================================
    const [
      grpcBusinessProfileResult,
      aboutUs,
      contact,
      galleries,
      testimonials
    ] = await Promise.allSettled([
      getBusinessById(businessId), // gRPC call
      PharmacyAboutUs.findOne({ businessId }), // String lookup
      PharmacyContact.findOne({ businessId }), // String lookup
      Gallery.find({ businessId: objectIdBusinessId }), // ObjectId lookup
      PharmacyTestimonial.find({ businessId, isActive: true }) // String lookup
    ]);

    // Safely extract the gRPC response
    const businessProfile = grpcBusinessProfileResult.status === 'fulfilled' 
      ? grpcBusinessProfileResult.value 
      : null;

    if (grpcBusinessProfileResult.status === 'rejected') {
      logger.warn(`Failed to fetch gRPC business profile for ${businessId}`, 'getMedicalHomeProfile', grpcBusinessProfileResult.reason);
    }

    // ============================================================================
    // 2. FETCH POPULAR PRODUCTS (Discounted: MRP > Selling Price)
    // ============================================================================
    const popularProducts = await Inventory.aggregate([
      { $match: { businessId: objectIdBusinessId } },
      { $unwind: '$batches' },
      // Condition: MRP is greater than Selling Price (Discounted)
      { $match: { $expr: { $gt: ['$batches.mrp', '$batches.sellingPrice'] } } },
      
      // Lookup Variant
      { $lookup: { from: 'productvariants', localField: 'productVariant', foreignField: '_id', as: 'variant' } },
      { $unwind: '$variant' },
      
      // Lookup Product
      { $lookup: { from: 'products', localField: 'variant.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },

      // Lookup Category
      { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },

      // Group back to avoid duplicate variants if multiple batches match, keeping the best batch
      {
        $group: {
          _id: '$_id',
          inventoryDetails: { $first: '$$ROOT' },
        }
      },
      { $replaceRoot: { newRoot: '$inventoryDetails' } },
      { $limit: 15 } // Keep response size manageable
    ]);

    // ============================================================================
    // 3. FETCH CATEGORY-WISE PRODUCTS (Only Level 0 categories with inventory)
    // ============================================================================
    const categoryWiseProducts = await Inventory.aggregate([
      { $match: { businessId: objectIdBusinessId } },
      
      // 1. Join relationships
      { $lookup: { from: 'productvariants', localField: 'productVariant', foreignField: '_id', as: 'variant' } },
      { $unwind: '$variant' },
      { $lookup: { from: 'products', localField: 'variant.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      
      // 2. Find immediate category
      { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'immediateCategory' } },
      { $unwind: '$immediateCategory' },

      // 3. Graph lookup to find all ancestor categories up to Level 0
      {
        $graphLookup: {
          from: 'categories',
          startWith: '$immediateCategory.parentId',
          connectFromField: 'parentId',
          connectToField: '_id',
          as: 'ancestors'
        }
      },

      // 4. Identify the Level 0 Category
      {
        $addFields: {
          level0Category: {
            $ifNull: [
              {
                $arrayElemAt: [
                  { $filter: { input: '$ancestors', as: 'anc', cond: { $eq: ['$$anc.level', 0] } } },
                  0
                ]
              },
              // If the immediate category itself is Level 0
              { $cond: [{ $eq: ['$immediateCategory.level', 0] }, '$immediateCategory', null] }
            ]
          }
        }
      },

      // 5. Exclude orphaned products that somehow have no Level 0 ancestor
      { $match: { level0Category: { $ne: null } } },

      // 6. Group by Level 0 Category and push products into it
      {
        $group: {
          _id: '$level0Category._id',
          categoryName: { $first: '$level0Category.name' },
          categoryImage: { $first: '$level0Category.image' },
          categoryKey: { $first: '$level0Category.key' },
          products: {
            $push: {
              inventoryId: '$_id',
              productId: '$product._id',
              productName: '$product.name',
              brand: '$product.brand',
              productImages: '$product.images',
              variantId: '$variant._id',
              variantName: '$variant.variantName',
              mrp: { $max: '$batches.mrp' },
              sellingPrice: { $min: '$batches.sellingPrice' },
              totalStock: { $sum: '$batches.quantity' }
            }
          }
        }
      },
      { $sort: { categoryName: 1 } }
    ]);

    // ============================================================================
    // 4. CONSTRUCT FINAL RESPONSE
    // ============================================================================
    res.status(200).json({
      success: true,
      message: 'Medical profile fetched successfully',
      data: {
        businessProfile: businessProfile?.business || null,
        aboutUs: aboutUs?.status === 'fulfilled' ? aboutUs.value : null,
        contact: contact?.status === 'fulfilled' ? contact.value : null,
        gallery: galleries?.status === 'fulfilled' ? galleries.value : [],
        testimonials: testimonials?.status === 'fulfilled' ? testimonials.value : [],
        inventorySummary: {
          popularProducts,
          categoriesWithProducts: categoryWiseProducts
        }
      }
    });

  } catch (error) {
    logger.error(`Error fetching medical profile`, 'getMedicalHomeProfile', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complete medical profile',
      error: error.message
    });
  }
};