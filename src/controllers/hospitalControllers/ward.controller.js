// controllers/hospitalControllers/wardController.js
import Ward from '../../models/hospitalModels/ward.model.js';

// Create Ward
export const createWard = async (req, res) => {
  try {
    const ward = new Ward({
      businessId: req.user._id,
      ...req.body
    });
    await ward.save();
    res.status(201).json(ward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Wards
export const getAllWards = async (req, res) => {
  try {
    const wards = await Ward.find({ businessId: req.user._id });
    res.json(wards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Wards By Department
export const getWardsByDepartment = async (req, res) => {
  try {
    const wards = await Ward.find({
      businessId: req.user._id,
      departmentId: req.params.departmentId
    });
    res.json(wards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Ward By ID
export const getWardById = async (req, res) => {
  try {
    const ward = await Ward.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!ward) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    res.json(ward);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Ward
export const updateWard = async (req, res) => {
  try {
    const ward = await Ward.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!ward) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    res.json(ward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Ward
export const deleteWard = async (req, res) => {
  try {
    const ward = await Ward.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!ward) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    res.json({ message: 'Ward deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Available Beds
export const updateAvailableBeds = async (req, res) => {
  try {
    const { availableBeds } = req.body;
    const ward = await Ward.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      { availableBeds },
      { new: true, runValidators: true }
    );
    if (!ward) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    res.json(ward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};