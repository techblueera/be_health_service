import Business from "../models/business.model.js";
import logger from "../utils/appLogger.js";

export const createBusiness = async (req, res) => {
  const { name, type, isActive } = req.body;

  try {
    /* ---------------- Guards ---------------- */
    if (!name || !type) {
      return res.status(400).json({
        message: "name and type are required",
      });
    }

    /* ---------------- Create business ---------------- */
    const business = new Business({
      name,
      type,
      isActive,
    });

    await business.save();

    return res.status(201).json({
      message: "Business created successfully",
      data: business,
    });
  } catch (error) {
    logger.error("Error creating business", "createBusiness", error);

    return res.status(500).json({
      message: "Error creating business",
      error: error.message,
    });
  }
};

export const updateBusiness = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid businessId",
      });
    }

    const business = await Business.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    return res.json({
      message: "Business updated successfully",
      data: business,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating business",
      error: error.message,
    });
  }
};

export const getBusinessById = async (req, res) => {
  const { id } = req.params;

  try {
    /* ---------------- Guard ---------------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid businessId",
      });
    }

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    return res.json({
      message: "Business fetched successfully",
      data: business,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching business",
      error: error.message,
    });
  }
};

export const deleteBusiness = async (req, res) => {
  const { id } = req.params;

  try {
    /* ---------------- Guard: businessId ---------------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid businessId",
      });
    }

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    /* ---------------- Soft delete business ---------------- */
    business.isActive = false;
    await business.save();

    /* ---------------- Soft delete all offerings ---------------- */
    await Offering.updateMany(
      { businessId: id },
      { $set: { isActive: false } }
    );

    return res.json({
      message: "Business deactivated successfully",
    });
  } catch (error) {
    logger.error("Error deleting business", "deleteBusiness", error);

    return res.status(500).json({
      message: "Error deleting business",
      error: error.message,
    });
  }
};

export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    return res.json({
      message: "Businesses fetched successfully",
      count: businesses.length,
      data: businesses,
    });
  } catch (error) {
    logger.error("Error fetching businesses", "getAllBusinesses", error); 
    return res.status(500).json({
      message: "Error fetching businesses",
      error: error.message,
    });
  }
};