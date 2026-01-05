import logger from "../utils/appLogger.js";
import mongoose from "mongoose";
import { Listing } from "../models/index.js";

const createListing = async (req, res) => {
  try {
    const { catalogNodeId, type, title, description, data, order, isActive } =
      req.body;

    /* ---------- Mandatory checks ---------- */
    if (!catalogNodeId || !type || !title) {
      return res.status(400).json({
        message: "catalogNodeId, type and title are required",
      });
    }

    /* ---------- Type-based minimal validation ---------- */
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
      catalogNodeId,
      type,
      title,
      description,
      data,
      order: order ?? 0,
      isActive: isActive ?? true,
    });

    return res.status(201).json({
      message: "Listing created successfully.",
      data: listing,
    });
  } catch (error) {
    logger.error("Error creating listing", error);
    return res.status(500).json({
      message: "Error creating listing.",
      error: error.message,
    });
  }
};

const fetchListings = async (req, res) => {
  try {
    const { catalogNodeId, type, isActive } = req.query;
    console.log('req.query_____>',req.query)
    const filter = {};

    if (catalogNodeId) filter.catalogNodeId = catalogNodeId;
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    const listings = await Listing.find(filter).sort({
      order: 1,
      createdAt: -1,
    });
    return res.status(200).json({
      message: "Listings fetched successfully.",
      data: listings,
    });
  } catch (error) {
    logger.error("Error fetching listings", error);
    return res.status(500).json({
      message: "Error fetching listings.",
      error: error.message,
    });
  }
};

export { createListing, fetchListings };
