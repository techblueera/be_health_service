import mongoose from "mongoose";
import Listing from "../models/listing.model.js";
import Business from "../models/business.model.js";
import CatalogNode from "../models/catalogNode.model.js";
import logger from "../utils/appLogger.js";

export const createListing = async (req, res) => {
  try {
    const {
      businessId,
      catalogNodeId,
      type,
      title,
      description,
      data,
      pincodes,
      order,
      isActive,
    } = req.body;

    /* ---------- Mandatory checks ---------- */
    if (!businessId || !catalogNodeId || !type || !title) {
      return res.status(400).json({
        message: "businessId, catalogNodeId, type and title are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(businessId) ||
      !mongoose.Types.ObjectId.isValid(catalogNodeId)
    ) {
      return res.status(400).json({
        message: "Invalid businessId or catalogNodeId",
      });
    }

    /* ---------- Ensure parents exist ---------- */
    const [business, catalogNode] = await Promise.all([
      Business.findById(businessId),
      CatalogNode.findById(catalogNodeId),
    ]);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (!catalogNode) {
      return res.status(404).json({ message: "Catalog node not found" });
    }

    /* ---------- Type-based validation ---------- */
    const typeRules = {
      DOCTOR: ["availability", "fees"],
      WARD: ["beds", "pricePerDay"],
      FACILITY: ["enabled"],
      MANAGEMENT: ["designation"],
      CONTACT: ["phone"],
      STATIC_PAGE: ["content"],
    };

    if (typeRules[type]) {
      const missingFields = typeRules[type].filter(
        (field) => !data || data[field] === undefined
      );

      if (missingFields.length) {
        return res.status(400).json({
          message: `Missing required data fields for ${type}`,
          missingFields,
        });
      }
    }

    /* ---------- Create listing ---------- */
    const listing = await Listing.create({
      businessId,
      catalogNodeId,
      type,
      title,
      description,
      data: data || {},
      availability: {
        pincodes: pincodes || [],
      },
      order: order ?? 0,
      isActive: isActive ?? true,
    });

    return res.status(201).json({
      message: "Listing created successfully",
      data: listing,
    });
  } catch (error) {
    logger.error("Error creating listing", error);
    return res.status(500).json({
      message: "Error creating listing",
      error: error.message,
    });
  }
};

export const updateDoctorLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.body;

    /* ---------- Guards ---------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid listing ID format" });
    }

    if (!from || !to) {
      return res.status(400).json({
        message: "from and to dates are required",
      });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate) || isNaN(toDate) || fromDate > toDate) {
      return res.status(400).json({
        message: "Invalid leave date range",
      });
    }

    const doctor = await Listing.findOne({
      _id: id,
      type: "DOCTOR",
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor listing not found",
      });
    }

    /* ---------- SAFE update ---------- */
    doctor.data = doctor.data || {};
    doctor.data.availability = doctor.data.availability || {};

    doctor.data.availability.leave = {
      from: fromDate,
      to: toDate,
    };

    doctor.markModified("data");
    await doctor.save();

    return res.status(200).json({
      message: "Doctor leave updated successfully",
      data: doctor,
    });
  } catch (error) {
    logger.error("Error updating doctor leave", error);
    return res.status(500).json({
      message: "Error updating doctor leave",
      error: error.message,
    });
  }
};

export const fetchListings = async (req, res) => {
  try {
    const { businessId, catalogNodeId, type, pincode, isActive } = req.query;

    const filter = {};

    if (businessId) {
      if (!mongoose.Types.ObjectId.isValid(businessId)) {
        return res.status(400).json({ message: "Invalid businessId" });
      }
      filter.businessId = businessId;
    }

    if (catalogNodeId) {
      if (!mongoose.Types.ObjectId.isValid(catalogNodeId)) {
        return res.status(400).json({ message: "Invalid catalogNodeId" });
      }
      filter.catalogNodeId = catalogNodeId;
    }

    if (!businessId) {
      return res.status(400).json({ message: "businessId is required" });
    }

    if (type) filter.type = type;
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (pincode) {
      filter["availability.pincodes"] = pincode;
    }

    const listings = await Listing.find(filter).sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Listings fetched successfully",
      data: listings,
    });
  } catch (error) {
    logger.error("Error fetching listings", error);
    return res.status(500).json({
      message: "Error fetching listings",
      error: error.message,
    });
  }
};
