import Category from "../models/pharmacyModels/category.model.js";

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

export const seedCategories = async () => {
  try {
    // Check if categories already exist
    const existingCategories = await Category.find();

    if (existingCategories.length > 0) {
      console.log("Categories already exist");
      return;
    }

    // Insert categories
    await Category.insertMany(categories);
    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
};
