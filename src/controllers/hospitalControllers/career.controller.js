// controllers/hospitalControllers/careerController.js
import Career from '../../models/hospitalModels/career.model.js';

// Create Career
export const createCareer = async (req, res) => {
  try {
    const career = new Career({
      businessId: req.user._id,
      ...req.body
    });
    await career.save();
    res.status(201).json(career);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create career.",
      error: error.message,
    });
  }
};

// Get All Careers
export const getAllCareers = async (req, res) => {
  try {
    const careers = await Career.find({ businessId: req.user._id });
    res.json(careers);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get all careers.",
      error: error.message,
    });
  }
};

// Get Active Careers
export const getActiveCareers = async (req, res) => {
  try {
    const careers = await Career.find({
      businessId: req.user._id,
      isActive: true
    });
    res.json(careers);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get all active careers.",
      error: error.message,
    });
  }
};

// Get Career By ID
export const getCareerById = async (req, res) => {
  try {
    const career = await Career.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    res.json(career);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update career.",
      error: error.message,
    });
  }
};

// Update Career
export const updateCareer = async (req, res) => {
  try {
    const career = await Career.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    res.json(career);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update career.",
      error: error.message,
    });
  }
};

// Delete Career
export const deleteCareer = async (req, res) => {
  try {
    const career = await Career.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    res.json({ message: 'Career deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete career.",
      error: error.message,
    });
  }
};

// Toggle Career Status
export const toggleCareerStatus = async (req, res) => {
  try {
    const career = await Career.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }
    career.isActive = !career.isActive;
    await career.save();
    res.json(career);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle career status.",
      error: error.message,
    });
  }
};