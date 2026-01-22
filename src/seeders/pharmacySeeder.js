import { Category } from "../models/pharmacyModels/category.model.js";

const categories = [
  {
    name: "OTC Items",
    icon: "otc-icon",
  },
  {
    name: "Herbal/Ayurved",
    icon: "herbal-icon",
  },
  {
    name: "Patanjali Product",
    icon: "patanjali-icon",
  },
  {
    name: "General Medical Instruments",
    icon: "instruments-icon",
  },
  {
    name: "General Medicines",
    icon: "medicines-icon",
  },
  {
    name: "Beauty & Health Care",
    icon: "beauty-icon",
  },
  {
    name: "Services",
    icon: "services-icon",
  },
  {
    name: "Staff",
    icon: "staff-icon",
  },
];

export const seedCategories = async (businessId) => {
  try {
    // Check if categories already exist for this business
    const existingCategories = await Category.find({ businessId });

    if (existingCategories.length > 0) {
      console.log("Categories already exist for this business");
      return;
    }

    // Add businessId to each category
    const categoriesWithBusinessId = categories.map((category) => ({
      ...category,
      businessId,
    }));

    // Insert categories
    await Category.insertMany(categoriesWithBusinessId);
    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
};
