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
    res.status(201).json(facility);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Facilities
export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({ businessId: req.user._id });
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Facilities By Type
export const getFacilitiesByType = async (req, res) => {
  try {
    const facilities = await Facility.find({
      businessId: req.user._id,
      type: req.params.type
    });
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.json(facility);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.json(facility);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};