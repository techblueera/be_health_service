// controllers/hospitalControllers/bedController.js
import Bed from "../../models/hospitalModels/bed.model.js";

// Create Bed
export const createBed = async (req, res) => {
  try {
    const bed = new Bed({
      businessId: req.user._id,
      ...req.body,
    });
    await bed.save();
    res.status(201).json({
      success: true,
      message: 'Successfully created bed.',
      data: bed
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch about us.",
      error: error.message,
    });
  }
};

// Get All Beds
export const getAllBeds = async (req, res) => {
  try {
    const beds = await Bed.find({ businessId: req.user._id });
    res.status(200).json({
      success: true,
      message: 'Successfully fetched beds.',
      data: beds
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch all beds.",
      error: error.message,
    });
  }
};

// Get Beds By Ward
export const getBedsByWard = async (req, res) => {
  try {
    const beds = await Bed.find({
      businessId: req.user._id,
      wardId: req.params.wardId,
    });
    res.status(200).json({
      success: true,
      message: 'Successfully fetched bed by ward.',
      data: beds
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bed by ward.",
      error: error.message,
    });
  }
};

// Get Bed By ID
export const getBedById = async (req, res) => {
  try {
    const bed = await Bed.findOne({
      _id: req.params.id,
      businessId: req.user._id,
    });
    if (!bed) {
      return res.status(404).json({ message: "Bed not found" });
    }
    res.status(200).json({
      success: true,
      message: 'Successfully fetched bed by ID.',
      data: bed
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bed by ID.",
      error: error.message,
    });
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
      return res.status(404).json({ message: "Bed not found" });
    }
    res.status(200).json({
      success: true,
      message: 'Successfully updated bed.',
      data: bed
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update bed.",
      error: error.message,
    });
  }
};

// Delete Bed
export const deleteBed = async (req, res) => {
  try {
    const bed = await Bed.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id,
    });
    if (!bed) {
      return res.status(404).json({ message: "Bed not found" });
    }
    res.json({ message: "Bed deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete bed.",
      error: error.message,
    });
  }
};

// Toggle Bed Occupancy
export const toggleBedOccupancy = async (req, res) => {
  try {
    const bed = await Bed.findOne({
      _id: req.params.id,
      businessId: req.user._id,
    });
    if (!bed) {
      return res.status(404).json({ message: "Bed not found" });
    }
    bed.isOccupied = !bed.isOccupied;
    await bed.save();
    res.status(200).json({
      success: true,
      message: 'Successfully toggled bed occupancy.',
      data: bed
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle bed occupancy.",
      error: error.message,
    });
  }
};
