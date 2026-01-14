// controllers/aboutUsController.js
import AboutUs from "../../models/hospitalModels/aboutUs.model.js";

// Create About Us
export const createAboutUs = async (req, res) => {
  try {
    const aboutUs = new AboutUs({
      businessId: req.user._id,
      ...req.body,
    });
    await aboutUs.save();
    res.status(201).json({
      success: true,
      message: "About Us created successfully.",
      data: aboutUs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create about us.",
      error: error.message,
    });
  }
};

// Get About Us
export const getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne({ businessId: req.user._id });
    if (!aboutUs) {
      return res.status(404).json({ message: "About Us not found" });
    }
    res.status(200).json({
      success: true,
      message: "Fetched about us successfully.",
      data: aboutUs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch about us.",
      error: error.message,
    });
  }
};

// Update About Us
export const updateAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOneAndUpdate(
      { businessId: req.user._id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "About us updated successfully.",
      data: aboutUs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update about us.",
      error: error.message,
    });
  }
};

// Delete About Us
export const deleteAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOneAndDelete({
      businessId: req.user._id,
    });
    if (!aboutUs) {
      return res.status(404).json({ message: "About Us not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "About Us deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete about us.",
      error: error.message,
    });
  }
};
