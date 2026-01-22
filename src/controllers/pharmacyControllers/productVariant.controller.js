import { ProductVariant } from "../../models/pharmacyModels/productVariant.model.js";

// ==================== GET ALL VARIANTS ====================
// Screen: "All Variant" modal - Display all variants of a product
export const getProductVariants = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { productId } = req.params;

    const variants = await ProductVariant.find({
      businessId,
      productId,
    });

    res.status(200).json({
      success: true,
      message: "Product variants fetched successfully.",
      data: variants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== GET SINGLE VARIANT ====================
// Screen: "All Variant" modal - View variant details
export const getProductVariant = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { variantId } = req.params;

    const variant = await ProductVariant.findOne({
      _id: variantId,
      businessId,
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product variant fetched successfully.",
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== CREATE VARIANT ====================
// Screen: "Add More Variant" form - Create new variant
export const createProductVariant = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { productId, weight, quantity, mrp, sellingPrice } = req.body;

    const variant = await ProductVariant.create({
      businessId,
      productId,
      weight,
      quantity,
      mrp,
      sellingPrice,
    });

    res.status(201).json({
      success: true,
      message: "Product variant created successfully.",
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== UPDATE VARIANT ====================
// Screen: "All Variant" modal - Edit variant
export const updateProductVariant = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { variantId } = req.params;
    const { weight, quantity, mrp, sellingPrice } = req.body;

    const variant = await ProductVariant.findOneAndUpdate(
      { _id: variantId, businessId },
      { weight, quantity, mrp, sellingPrice },
      { new: true }
    );

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product variant updated successfully.",
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== DELETE VARIANT ====================
// Screen: "All Variant" modal - Delete variant
export const deleteProductVariant = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { variantId } = req.params;

    const variant = await ProductVariant.findOneAndDelete({
      _id: variantId,
      businessId,
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product variant deleted successfully.",
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
