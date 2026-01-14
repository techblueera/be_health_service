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

    res.status(201).json({
      success: true,
      message: 'Ward created successfully',
      data: ward
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get All Wards
export const getAllWards = async (req, res) => {
  try {
    const wards = await Ward.find({ businessId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Wards fetched successfully',
      data: wards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get Wards By Department
export const getWardsByDepartment = async (req, res) => {
  try {
    const wards = await Ward.find({
      businessId: req.user._id,
      departmentId: req.params.departmentId
    });

    res.status(200).json({
      success: true,
      message: 'Wards fetched by department successfully',
      data: wards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
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
      return res.status(404).json({
        success: false,
        message: 'Ward not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ward fetched successfully',
      data: ward
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
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
      return res.status(404).json({
        success: false,
        message: 'Ward not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ward updated successfully',
      data: ward
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
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
      return res.status(404).json({
        success: false,
        message: 'Ward not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ward deleted successfully',
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
      return res.status(404).json({
        success: false,
        message: 'Ward not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Available beds updated successfully',
      data: ward
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
