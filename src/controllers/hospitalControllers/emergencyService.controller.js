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
    res.status(201).json(emergencyService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Emergency Services
export const getAllEmergencyServices = async (req, res) => {
  try {
    const emergencyServices = await EmergencyService.find({ businessId: req.user._id });
    res.json(emergencyServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Emergency Services By Department
export const getEmergencyServicesByDepartment = async (req, res) => {
  try {
    const emergencyServices = await EmergencyService.find({
      businessId: req.user._id,
      departmentId: req.params.departmentId
    });
    res.json(emergencyServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: 'Emergency Service not found' });
    }
    res.json(emergencyService);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: 'Emergency Service not found' });
    }
    res.json(emergencyService);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
      return res.status(404).json({ message: 'Emergency Service not found' });
    }
    res.json({ message: 'Emergency Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};