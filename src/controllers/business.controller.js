import mongoose from "mongoose";
import Business from "../models/business.model.js";
import logger from "../utils/appLogger.js";
import { Catalog, Listing, Module } from "../models/index.js";

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
      createdBy: req.user._id,
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

export const getMyBusiness = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("this is the userId_+___", userId);
    const business = await Business.findOne({ createdBy: userId });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    return res.status(200).json({
      message: "Business fetched successfully",
      data: business,
    });
  } catch (error) {
    logger.error("Error fetching business for user", error);
    return res.status(500).json({
      message: "Error fetching business",
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
    const userId = req.user._id;

    /* ================= BUSINESS ================= */
    const business = await Business.findOne({
      createdBy: userId,
      isActive: true,
    }).lean();

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    /* ================= MODULE ================= */
    const module = await Module.findOne({
      code: business.type,
      isActive: true,
    }).lean();

    if (!module) {
      return res.status(400).json({ message: "Module not found" });
    }

    /* ================= LOAD DATA ================= */
    const catalogs = await Catalog.find({
      moduleId: module._id,
      isActive: true,
    }).lean();

    const listings = await Listing.find({
      businessId: business._id,
      isActive: true,
    }).lean();

    /* ================= MAPS ================= */
    const catalogMap = {};
    catalogs.forEach((c) => {
      catalogMap[c._id.toString()] = { ...c, children: [] };
    });

    catalogs.forEach((c) => {
      if (c.parentId) {
        const parent = catalogMap[c.parentId.toString()];
        if (parent) parent.children.push(c._id.toString());
      }
    });

    const listingMap = {};
    for (const l of listings) {
      const key = l.catalogNodeId.toString();
      if (!listingMap[key]) listingMap[key] = [];
      listingMap[key].push(l);
    }

    /* ================= TREE BUILDER ================= */
    const buildNode = (catalogId) => {
      const node = catalogMap[catalogId];
      const result = {};
      const nodeListings = listingMap[catalogId] || [];

      // ABOUT / CONTACT / MEDICAL STORE
      if (
        node.key === "ABOUT_US" ||
        node.key === "CONTACT_US" ||
        node.key === "MEDICAL_STORE"
      ) {
        return nodeListings[0]?.data || {};
      }

      // CAREER
      if (node.key === "CAREER") {
        return nodeListings.map((l) => l.data);
      }

      // DEPARTMENTS / WARDS / FACILITIES
      for (const childId of node.children) {
        const child = catalogMap[childId];
        const childListings = listingMap[childId] || [];

        const main = childListings.find(
          (l) => !["DOCTOR", "SERVICE"].includes(l.type)
        );

        if (!main) continue;

        const entry = { ...main.data };

        const doctors = childListings
          .filter((l) => l.type === "DOCTOR")
          .map((l) =>
            typeof l.data === "string"
              ? { name: l.data }
              : l.data
          );

        if (doctors.length) entry.doctors = doctors;

        const services = childListings
          .filter((l) => l.type === "SERVICE")
          .map((l) => l.data);

        if (services.length) entry.services = services;

        result[child.key] = entry;
      }

      return result;
    };

    /* ================= ROOT NODES ================= */
    const offerings = {};
    const rootNodes = catalogs.filter((c) => !c.parentId);

    for (const root of rootNodes) {
      offerings[root.key] = buildNode(root._id.toString());
    }

    /* ================= RESPONSE ================= */
    return res.json({
      success: true,
      message: "Hospital offerings fetched successfully",
      data: {
        business: {
          id: business._id,
          name: business.name,
          type: business.type,
        },
        offerings,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospital offerings",
      error: error.message,
    });
  }
};