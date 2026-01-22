import { Category } from "../../models/pharmacyModels/category.model.js";
import { seedCategories } from "../../seeders/pharmacySeeder.js";

// ==================== GET ALL CATEGORIES ====================
// Screen: "My Store" - Display categories in sidebar
export const getCategories = async (req, res) => {
  try {
    const businessId = req.user._id;

    await seedCategories(businessId);

    const categories = await Category.find({ businessId });

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== CREATE CATEGORY ====================
// Screen: "Add Details" - Create new category
export const createCategory = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { name, icon } = req.body;

    const category = await Category.create({
      businessId,
      name,
      icon,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== UPDATE CATEGORY ====================
// Screen: "Add Details" - Edit category
export const updateCategory = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { categoryId } = req.params;
    const { name, icon } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: categoryId, businessId },
      { name, icon },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== DELETE CATEGORY ====================
// Screen: "Add Details" - Delete category
export const deleteCategory = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { categoryId } = req.params;

    const category = await Category.findOneAndDelete({
      _id: categoryId,
      businessId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
