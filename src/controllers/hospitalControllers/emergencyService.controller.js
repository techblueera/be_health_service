// controllers/hospitalControllers/emergencyServiceController.js
import EmergencyService from '../../models/hospitalModels/emergencyService.model.js';

// Create Emergency Service
export const createEmergencyService = async (req, res) => {
  try {
    const emergencyService = new EmergencyService({
      businessId: req.user._id,
      ...req.body
    });
    await emergencyService.save();

    res.status(201).json({
      success: true,
      message: 'Emergency service created successfully',
      data: emergencyService
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get All Emergency Services
export const getAllEmergencyServices = async (req, res) => {
  try {
    const emergencyServices = await EmergencyService.find({
      businessId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Emergency services fetched successfully',
      data: emergencyServices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get Emergency Services By Department
export const getEmergencyServicesByDepartment = async (req, res) => {
  try {
    const emergencyServices = await EmergencyService.find({
      businessId: req.user._id,
      departmentId: req.params.departmentId
    });

    res.status(200).json({
      success: true,
      message: 'Emergency services fetched by department successfully',
      data: emergencyServices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get Emergency Service By ID
export const getEmergencyServiceById = async (req, res) => {
  try {
    const emergencyService = await EmergencyService.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });

    if (!emergencyService) {
      return res.status(404).json({
        success: false,
        message: 'Emergency service not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency service fetched successfully',
      data: emergencyService
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Update Emergency Service
export const updateEmergencyService = async (req, res) => {
  try {
    const emergencyService = await EmergencyService.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!emergencyService) {
      return res.status(404).json({
        success: false,
        message: 'Emergency service not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency service updated successfully',
      data: emergencyService
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Delete Emergency Service
export const deleteEmergencyService = async (req, res) => {
  try {
    const emergencyService = await EmergencyService.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });

    if (!emergencyService) {
      return res.status(404).json({
        success: false,
        message: 'Emergency service not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency service deleted successfully',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
