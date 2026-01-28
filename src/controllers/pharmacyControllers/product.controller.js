import { Product, ProductVariant } from "../../models/pharmacyModels/index.js";

// ==================== GET ALL PRODUCTS ====================
// Screen: "Business Chats" - Display product grid
export const getProducts = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { categoryId } = req.query;
    
    if (!businessId) {
      return res.status(401).json({
        success: false,
        message: "Business ID not found",
      });
    }
    
    const filter = { businessId };
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    
    const products = await Product.find(filter).populate('categoryId');
    
    // Fetch variants for each product
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({ 
          productId: product._id,
          businessId
        });
        
        // Get price range from variants
        let priceInfo = {};
        if (variants.length > 0) {
          const allPrices = [];
          const allMrps = [];
          variants.forEach(variant => {
            if (variant.inventories) {
              variant.inventories.forEach(inventory => {
                if (inventory.batches) {
                  inventory.batches.forEach(batch => {
                    allPrices.push(batch.sellingPrice);
                    allMrps.push(batch.mrp);
                  });
                }
              });
            }
          });

          if (allPrices.length > 0) {
            const minPrice = Math.min(...allPrices);
            const maxPrice = Math.max(...allPrices);
            const minMrp = Math.min(...allMrps);
            
            priceInfo = {
              displayPrice: minPrice,
              priceRange: minPrice !== maxPrice ? `₹${minPrice} - ₹${maxPrice}` : `₹${minPrice}`,
              mrp: minMrp,
              variantCount: variants.length
            };
          }
        }
        
        return {
          ...product.toObject(),
          ...priceInfo
        };
      })
    );
    
    res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: productsWithVariants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== GET SINGLE PRODUCT ====================
// Screen: "Business Chats" - View product details
export const getProduct = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      businessId,
    }).populate("categoryId");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== CREATE PRODUCT ====================
// Screen: "Business Chats" - Add new product
export const createProduct = async (req, res) => {
  try {
    const businessId = req.user._id;
    const {
      categoryId,
      name,
      description,
      image,
      variant
    } = req.body;
    
    if (!businessId) {
      return res.status(401).json({
        success: false,
        message: "Business ID not found",
      });
    }
    
    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Product name and category are required",
      });
    }
    
    // Validate the incoming variant structure
    // Expecting variant to have weight, and an inventories array with at least one item
    if (!variant || !variant.weight || !Array.isArray(variant.inventories) || variant.inventories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product variant is required with weight and an inventories array.",
      });
    }

    // Further validation for the first inventory item for simplicity, similar to original logic
    const firstInventory = variant.inventories[0];
    if (!firstInventory || !firstInventory.pincode || !firstInventory.cityName || !Array.isArray(firstInventory.batches) || firstInventory.batches.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Variant's inventory must have pincode, cityName, and at least one batch.",
      });
    }
    const firstBatch = firstInventory.batches[0];
    if (!firstBatch || typeof firstBatch.mrp === 'undefined' || typeof firstBatch.sellingPrice === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "Variant's inventory batch must have MRP and selling price.",
      });
    }
    
    const product = await Product.create({
      businessId,
      categoryId,
      name,
      description,
      image
    });
    
    await ProductVariant.create({
      businessId,
      productId: product._id,
      weight: variant.weight,
      images: variant.images || [],
      inventories: variant.inventories
    });
    
    res.status(201).json({
      success: true,
      message: "Product created successfully with variant.",
      data: product
    });
  }
  catch(error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// ==================== UPDATE PRODUCT ====================
// Screen: "Business Chats" - Edit product
export const updateProduct = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { productId } = req.params;
    const {
      categoryId,
      name,
      description,
      image,
      basePrice,
      sellingPrice,
      discountPercent,
    } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: productId, businessId },
      {
        categoryId,
        name,
        description,
        image,
        basePrice,
        sellingPrice,
        discountPercent,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== DELETE PRODUCT ====================
// Screen: "Business Chats" - Delete product
export const deleteProduct = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findOneAndDelete({
      _id: productId,
      businessId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
