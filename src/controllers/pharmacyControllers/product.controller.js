import { Product } from "../../models/pharmacyModels/product.model.js";
import { ProductVariant } from "../../models/pharmacyModels/productVariant.model.js";


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
          const prices = variants.map(v => v.sellingPrice);
          const mrps = variants.map(v => v.mrp);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const minMrp = Math.min(...mrps);
          
          priceInfo = {
            displayPrice: minPrice,
            priceRange: minPrice !== maxPrice ? `₹${minPrice} - ₹${maxPrice}` : `₹${minPrice}`,
            mrp: minMrp,
            variantCount: variants.length
          };
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
    
    if (!variant || !variant.weight || !variant.mrp || !variant.sellingPrice) {
      return res.status(400).json({
        success: false,
        message: "At least one variant is required with weight, MRP, and selling price",
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
      quantity: variant.quantity,
      mrp: variant.mrp,
      sellingPrice: variant.sellingPrice
    });
    
    res.status(201).json({
      success: true,
      message: "Product created successfully with variant.",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
