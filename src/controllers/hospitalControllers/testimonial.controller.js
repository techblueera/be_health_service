// controllers/hospitalControllers/testimonialController.js
import Testimonial from '../../models/hospitalModels/testimonial.model.js';

// Create Testimonial
export const createTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial({
      businessId: req.user._id,
      ...req.body
    });
    await testimonial.save();
    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create testimonial',
      error: error.message
    });
  }
};

// Get All Testimonials
export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ businessId: req.user._id });
    res.status(200).json({
      success: true,
      message: 'Testimonials fetched successfully',
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message
    });
  }
};

// Get Active Testimonials
export const getActiveTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      businessId: req.user._id,
      isActive: true
    });
    res.status(200).json({
      success: true,
      message: 'Active testimonials fetched successfully',
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active testimonials',
      error: error.message
    });
  }
};

// Get Testimonial By ID
export const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Testimonial fetched successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonial',
      error: error.message
    });
  }
};

// Update Testimonial
export const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update testimonial',
      error: error.message
    });
  }
};

// Delete Testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
      error: error.message
    });
  }
};

// Toggle Testimonial Status
export const toggleTestimonialStatus = async (req, res) => {
  try {
    const testimonial = await Testimonial.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();
    res.status(200).json({
      success: true,
      message: 'Testimonial status toggled successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to toggle testimonial status',
      error: error.message
    });
  }
};
