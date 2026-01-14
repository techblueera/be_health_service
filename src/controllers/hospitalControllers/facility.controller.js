// controllers/hospitalControllers/facilityController.js
import Facility from '../../models/hospitalModels/facility.model.js';

// Create Facility
export const createFacility = async (req, res) => {
  try {
    const facility = new Facility({
      businessId: req.user._id,
      ...req.body
    });
    await facility.save();

    res.status(201).json({
      success: true,
      message: 'Facility created successfully',
      data: facility
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get All Facilities
export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({
      businessId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Facilities fetched successfully',
      data: facilities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get Facilities By Type
export const getFacilitiesByType = async (req, res) => {
  try {
    const facilities = await Facility.find({
      businessId: req.user._id,
      type: req.params.type
    });

    res.status(200).json({
      success: true,
      message: 'Facilities fetched by type successfully',
      data: facilities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get Facility By ID
export const getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Facility fetched successfully',
      data: facility
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Update Facility
export const updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Facility updated successfully',
      data: facility
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Delete Facility
export const deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Facility deleted successfully',
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
