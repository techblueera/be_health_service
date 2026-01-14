// controllers/hospitalControllers/bedController.js
import Bed from '../../models/hospitalModels/bed.model.js';

// Create Bed
export const createBed = async (req, res) => {
  try {
    const bed = new Bed({
      businessId: req.user._id,
      ...req.body
    });
    await bed.save();
    res.status(201).json(bed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Beds
export const getAllBeds = async (req, res) => {
  try {
    const beds = await Bed.find({ businessId: req.user._id });
    res.json(beds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Beds By Ward
export const getBedsByWard = async (req, res) => {
  try {
    const beds = await Bed.find({
      businessId: req.user._id,
      wardId: req.params.wardId
    });
    res.json(beds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Bed By ID
export const getBedById = async (req, res) => {
  try {
    const bed = await Bed.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }
    res.json(bed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Bed
export const updateBed = async (req, res) => {
  try {
    const bed = await Bed.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }
    res.json(bed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Bed
export const deleteBed = async (req, res) => {
  try {
    const bed = await Bed.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }
    res.json({ message: 'Bed deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Bed Occupancy
export const toggleBedOccupancy = async (req, res) => {
  try {
    const bed = await Bed.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }
    bed.isOccupied = !bed.isOccupied;
    await bed.save();
    res.json(bed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};