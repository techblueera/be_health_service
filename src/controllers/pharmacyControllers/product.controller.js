import { Product } from "../../models/pharmacyModels/product.model.js";

// ==================== GET ALL PRODUCTS ====================
// Screen: "Business Chats" - Display product grid
export const getProducts = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { categoryId } = req.query;

    const filter = { businessId };
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const products = await Product.find(filter).populate("categoryId");

    res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: products,
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
      basePrice,
      sellingPrice,
      discountPercent,
    } = req.body;

    const product = await Product.create({
      businessId,
      categoryId,
      name,
      description,
      image,
      basePrice,
      sellingPrice,
      discountPercent,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
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
