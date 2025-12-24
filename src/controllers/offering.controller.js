import Offering from "../models/offering.model.js";
import CatalogNode from "../models/catalogNode.model.js";
import logger from "../utils/appLogger.js";
import { uploadToS3 } from "../utils/s3Uploader.js";
import { moderateContentFromUrl } from "../utils/s3-moderator.js";
import mongoose from "mongoose";

export const createOffering = async (req, res) => {
  const {
    name,
    key,
    type,
    description,
    moduleId,
    catalogNodeId,
    serviceablePincodes,
    pricing,
    inventory,
    availability,
    medicalRules,
    isActive,
  } = req.body;

  try {
    if (!moduleId) {
      return res.status(400).json({ message: "moduleId is required" });
    }

    if (!catalogNodeId) {
      return res.status(400).json({ message: "catalogNodeId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ message: "Invalid moduleId format" });
    }

    if (!mongoose.Types.ObjectId.isValid(catalogNodeId)) {
      return res.status(400).json({ message: "Invalid catalogNodeId format" });
    }

    let imageUrl;

    if (req.file) {
      const uploadedUrl = await uploadToS3(req.file);
      const moderationResult = await moderateContentFromUrl(uploadedUrl);

      if (moderationResult.status !== "allowed") {
        return res.status(400).json({
          message: `Image moderation failed: ${moderationResult.reason}`,
        });
      }

      imageUrl = uploadedUrl;
    }

    const catalogNode = await CatalogNode.findById(catalogNodeId);

    if (!catalogNode) {
      return res.status(404).json({ message: "Catalog node not found" });
    }

    if (!catalogNode.module) {
      return res.status(500).json({
        message: "Catalog node is missing module reference",
      });
    }

    if (!catalogNode.module.equals(moduleId)) {
      return res.status(400).json({
        message: "Catalog node belongs to a different module",
      });
    }

    const exists = await Offering.exists({ name });
    if (exists) {
      return res.status(409).json({
        message: "Offering with this name already exists",
      });
    }

    let parsedPincodes;

    if (typeof serviceablePincodes === "string") {
      try {
        const parsed = JSON.parse(serviceablePincodes);

        if (Array.isArray(parsed)) {
          parsedPincodes = parsed;
        } else {
          parsedPincodes = [String(parsed)];
        }
      } catch {
        parsedPincodes = serviceablePincodes
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      }
    } else if (Array.isArray(serviceablePincodes)) {
      parsedPincodes = serviceablePincodes;
    }

    if (!Array.isArray(parsedPincodes) || parsedPincodes.length === 0) {
      return res.status(400).json({
        message: "serviceablePincodes is required",
      });
    }

    let parsedPricing;

    if (pricing) {
      if (typeof pricing === "string") {
        try {
          parsedPricing = JSON.parse(pricing);
        } catch {
          return res.status(400).json({
            message: "pricing must be valid JSON",
          });
        }
      } else {
        parsedPricing = pricing;
      }
    }

    const newOffering = new Offering({
      name,
      key,
      type,
      description,
      module: moduleId,
      catalogNodeId,
      serviceablePincodes: parsedPincodes,
      pricing: parsedPricing,
      inventory,
      availability,
      medicalRules,
      isActive,
      image: imageUrl,
    });

    await newOffering.save();

    return res.status(201).json({
      message: "Offering created successfully",
      data: newOffering,
    });
  } catch (error) {
    logger.error("Error creating offering", "createOffering", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Offering already exists",
      });
    }

    return res.status(500).json({
      message: "Error creating offering",
      error: error.message,
    });
  }
};


export const getOfferings = async (req, res) => {
  const { catalogNodeId, type } = req.query;
  const location = req.location;

  try {
    const filter = { isActive: true };

    if (catalogNodeId) filter.catalogNodeId = catalogNodeId;
    if (type) filter.type = type;

    if (location) {
      filter.serviceablePincodes = location.pincode;
    }

    const offerings = await Offering.find(filter).lean();

    res.status(200).json({
      message: "Offerings fetched successfully",
      count: offerings.length,
      data: offerings,
    });
  } catch (error) {
    logger.error("Error fetching offerings", "getOfferings", error);
    res.status(500).json({
      message: "Error fetching offerings",
      error: error.message,
    });
  }
};

export const getOfferingById = async (req, res) => {
  const { id } = req.params;

  try {
    const offering = await Offering.findById(id);

    if (!offering) {
      return res.status(404).json({ message: "Offering not found" });
    }

    res.status(200).json({
      message: "Offering fetched successfully.",
      data: offering,
    });
  } catch (error) {
    logger.error("Error fetching offering", "getOfferingById", error);
    res.status(500).json({
      message: "Error fetching offering",
      error: error.message,
    });
  }
};

export const updateOffering = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const offering = await Offering.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!offering) {
      return res.status(404).json({ message: "Offering not found" });
    }

    res.status(200).json({
      message: "Offering updated successfully.",
      data: offering,
    });
  } catch (error) {
    logger.error("Error updating offering", "updateOffering", error);
    res.status(500).json({
      message: "Error updating offering",
      error: error.message,
    });
  }
};

export const deactivateOffering = async (req, res) => {
  const { id } = req.params;

  try {
    const offering = await Offering.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!offering) {
      return res.status(404).json({ message: "Offering not found" });
    }

    res.status(200).json({
      message: "Offering deactivated successfully.",
      data: offering,
    });
  } catch (error) {
    logger.error("Error deactivating offering", "deactivateOffering", error);
    res.status(500).json({
      message: "Error deactivating offering",
      error: error.message,
    });
  }
};
