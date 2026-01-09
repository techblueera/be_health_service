import mongoose from "mongoose";
import Business from "../models/business.model.js";
import logger from "../utils/appLogger.js";
import { Listing } from "../models/index.js";

export const createBusiness = async (req, res) => {
  try {
    const { name, type, locations, isActive } = req.body;

    /* ---------- Guards ---------- */
    if (!name || !type) {
      return res.status(400).json({
        message: "name and type are required",
      });
    }

    if (locations && !Array.isArray(locations)) {
      return res.status(400).json({
        message: "locations must be an array",
      });
    }

    /* ---------- Create ---------- */
    const business = await Business.create({
      name,
      type,
      locations: locations || [],
      isActive: isActive ?? true,
    });

    return res.status(201).json({
      message: "Business created successfully",
      data: business,
    });
  } catch (error) {
    logger.error("Error creating business", error);
    return res.status(500).json({
      message: "Error creating business",
      error: error.message,
    });
  }
};

export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid business ID" });
    }

    const updated = await Business.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Business not found" });
    }

    return res.status(200).json({
      message: "Business updated successfully",
      data: updated,
    });
  } catch (error) {
    logger.error("Error updating business", error);
    return res.status(500).json({
      message: "Error updating business",
      error: error.message,
    });
  }
};

export const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid business ID" });
    }

    const business = await Business.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    return res.status(200).json({
      message: "Business deactivated successfully",
      data: business,
    });
  } catch (error) {
    logger.error("Error deleting business", error);
    return res.status(500).json({
      message: "Error deleting business",
      error: error.message,
    });
  }
};

export const getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid business ID" });
    }

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    return res.status(200).json({
      message: "Business fetched successfully",
      data: business,
    });
  } catch (error) {
    logger.error("Error fetching business by id", error);
    return res.status(500).json({
      message: "Error fetching business",
      error: error.message,
    });
  }
};

export const listBusinesses = async (req, res) => {
  try {
    const { type, isActive } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const businesses = await Business.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Businesses fetched successfully",
      data: businesses,
    });
  } catch (error) {
    logger.error("Error listing businesses", error);
    return res.status(500).json({
      message: "Error fetching businesses",
      error: error.message,
    });
  }
};

export const getBusinessesByPincode = async (req, res) => {
  try {
    const { pincode } = req.query;

    if (!pincode) {
      return res.status(400).json({
        message: "pincode is required",
      });
    }

    const businesses = await Business.find({
      isActive: true,
      "locations.pincode": pincode,
    });

    return res.status(200).json({
      message: "Businesses fetched successfully by pincode",
      data: businesses,
    });
  } catch (error) {
    logger.error("Error fetching businesses by pincode", error);
    return res.status(500).json({
      message: "Error fetching businesses",
      error: error.message,
    });
  }
};

export const fetchHospitalDetails = async (req, res) => {
  try {
    const { businessId, pincode } = req.query;

    /* ---------- Guards ---------- */
    if (!businessId || !mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({
        message: "Valid businessId is required",
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    /* ---------- Filter ---------- */
    const filter = {
      businessId,
      isActive: true,
    };

    if (pincode) {
      filter.$or = [
        { "availability.pincodes": { $exists: false } }, // no pincode restriction
        { "availability.pincodes": pincode },
      ];
    }

    /* ---------- Fetch offerings ---------- */
    const listings = await Listing.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .lean();

    /* ---------- Group for UI ---------- */
    const grouped = {
      CONTACT: [],
      DOCTOR: [],
      WARD: [],
      FACILITY: [],
      MANAGEMENT: [],
      STATIC_PAGE: [],
    };

    listings.forEach((item) => {
      if (grouped[item.type]) {
        grouped[item.type].push(item);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Hospital offerings fetched successfully",
      data: {
        business: {
          id: business._id,
          name: business.name,
          type: business.type,
        },
        offerings: grouped,
      },
    });
  } catch (error) {
    logger.error("Error fetching hospital details", error);
    return res.status(500).json({
      message: "Error fetching hospital details",
      error: error.message,
    });
  }
};