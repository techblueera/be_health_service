// controllers/pharmacyControllers/pharmacyTestimonial.controller.js
import { PharmacyTestimonial } from "../../models/pharmacyModels/index.js";

// Create Testimonial
export const createPharmacyTestimonial = async (req, res) => {
  try {
    const testimonial = new PharmacyTestimonial({
      businessId: req.user._id,
      ...req.body,
    });
    await testimonial.save();
    res.status(201).json({
      success: true,
      message: "Pharmacy testimonial created successfully",
      data: testimonial,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create pharmacy testimonial",
      error: error.message,
    });
  }
};

// Get All Testimonials
export const getAllPharmacyTestimonials = async (req, res) => {
  try {
    const testimonials = await PharmacyTestimonial.find({
      businessId: req.user._id,
    });
    res.status(200).json({
      success: true,
      message: "Pharmacy testimonials fetched successfully",
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pharmacy testimonials",
      error: error.message,
    });
  }
};

// Get Active Testimonials
export const getActivePharmacyTestimonials = async (req, res) => {
  try {
    const testimonials = await PharmacyTestimonial.find({
      businessId: req.user._id,
      isActive: true,
    });
    res.status(200).json({
      success: true,
      message: "Active pharmacy testimonials fetched successfully",
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch active pharmacy testimonials",
      error: error.message,
    });
  }
};

// Get Testimonial By ID
export const getPharmacyTestimonialById = async (req, res) => {
  try {
    const testimonial = await PharmacyTestimonial.findOne({
      _id: req.params.id,
      businessId: req.user._id,
    });
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy testimonial not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Pharmacy testimonial fetched successfully",
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pharmacy testimonial",
      error: error.message,
    });
  }
};

// Update Testimonial
export const updatePharmacyTestimonial = async (req, res) => {
  try {
    const testimonial = await PharmacyTestimonial.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy testimonial not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Pharmacy testimonial updated successfully",
      data: testimonial,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update pharmacy testimonial",
      error: error.message,
    });
  }
};

// Delete Testimonial
export const deletePharmacyTestimonial = async (req, res) => {
  try {
    const testimonial = await PharmacyTestimonial.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id,
    });
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy testimonial not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Pharmacy testimonial deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete pharmacy testimonial",
      error: error.message,
    });
  }
};

// Toggle Testimonial Status
export const togglePharmacyTestimonialStatus = async (req, res) => {
  try {
    const testimonial = await PharmacyTestimonial.findOne({
      _id: req.params.id,
      businessId: req.user._id,
    });
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy testimonial not found",
      });
    }
    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();
    res.status(200).json({
      success: true,
      message: "Pharmacy testimonial status toggled successfully",
      data: testimonial,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to toggle pharmacy testimonial status",
      error: error.message,
    });
  }
};
