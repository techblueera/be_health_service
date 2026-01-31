// controllers/pharmacyControllers/pharmacyAboutUs.controller.js
import PharmacyAboutUs from "../../models/pharmacyModels/aboutUs.model.js";

// Create or Update Pharmacy About Us
export const upsertPharmacyAboutUs = async (req, res) => {
  try {
    const aboutUs = await PharmacyAboutUs.findOneAndUpdate(
      { businessId: req.user._id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: "Pharmacy about us updated successfully.",
      data: aboutUs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update pharmacy about us.",
      error: error.message,
    });
  }
};

// Get Pharmacy About Us
export const getPharmacyAboutUs = async (req, res) => {
  try {
    const aboutUs = await PharmacyAboutUs.findOne({ businessId: req.user._id });
    if (!aboutUs) {
      return res.status(404).json({ message: "Pharmacy about us not found" });
    }
    res.status(200).json({
      success: true,
      message: "Pharmacy about us fetched successfully.",
      data: aboutUs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pharmacy about us.",
      error: error.message,
    });
  }
};
