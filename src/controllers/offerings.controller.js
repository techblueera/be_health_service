import Offering from "../models/offering.model.js";
import CatalogNode from "../models/catalogNode.model.js";
import mongoose from "mongoose";
import logger from "../utils/appLogger.js";

export const createOffering = async (req, res) => {
  try {
    const {
      businessId,
      moduleId,
      name,
      type,
      description,
      catalogNodeId,
      pricing,
      availability,
      medicalRules,
      isActive,
    } = req.body;

    /* -------- Validate catalog & module ------ */
    const catalogNode = await CatalogNode.findById(catalogNodeId);
    if (!catalogNode) {
      return res.status(404).json({ message: "Catalog node not found" });
    }

    if (!catalogNode.moduleId.equals(moduleId)) {
      return res.status(400).json({
        message: "Catalog node belongs to a different module",
      });
    }

    /* -------- Optional: rely on DB uniqueness */
    // Let MongoDB unique index handle duplicates

    /* -------- Image upload & moderation ------ */
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

    /* -------- Create Offering ---------------- */
    const offering = await Offering.create({
      businessId,
      moduleId,
      catalogNodeId,
      name,
      type,
      description,
      pricing,
      availability,
      medicalRules,
      isActive,
      image: imageUrl,
    });

    return res.status(201).json({
      message: "Offering created successfully",
      data: offering,
    });

  } catch (error) {
    logger.error("Error creating offering", error);

    return res.status(500).json({
      message: "Error creating offering",
      error: error.message,
    });
  }
};


export const updateOffering = async (req, res) => {
  try {
    const { id } = req.params;

    // businessId from auth context (NOT body)
    // const businessId = req.user.businessId;

    // /* -------- Guard: auth -------- */
    // if (!businessId) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    /* -------- Guard: offeringId -------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid offeringId" });
    }

    /* -------- Allow only safe fields -------- */
    const allowedUpdates = [
      "name",
      "description",
      "pricing",
      "availability",
      "medicalRules",
      "image",
      "isActive",
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    /* -------- Update offering -------- */
    const updatedOffering = await Offering.findOneAndUpdate(
      { _id: id, businessId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedOffering) {
      return res.status(404).json({
        message: "Offering not found or access denied",
      });
    }

    return res.json({
      message: "Offering updated successfully",
      data: updatedOffering,
    });

  } catch (error) {
    logger.error("Error updating offering", error);

    return res.status(500).json({
      message: "Error updating offering",
      error: error.message,
    });
  }
};


export const getBusinessOfferings = async (req, res) => {
  try {
    // const businessId = req.user.businessId;

    // if (!businessId) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    const offerings = await Offering.find({
      businessId,
      isActive: true,
    })
      .populate("catalogNodeId", "name level")
      .sort({ createdAt: -1 });

    return res.json({
      message: "Offerings fetched successfully",
      count: offerings.length,
      data: offerings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching offerings",
      error: error.message,
    });
  }
};


export const deleteOffering = async (req, res) => {
  try {
    const { id } = req.params;

    // businessId from auth context
    const businessId = req.user.businessId;

    /* -------- Guard: auth -------- */
    if (!businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    /* -------- Guard: offeringId -------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid offeringId" });
    }

    /* -------- Soft delete offering -------- */
    const offering = await Offering.findOneAndUpdate(
      { _id: id, businessId, isActive: true },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!offering) {
      return res.status(404).json({
        message: "Offering not found or already deleted",
      });
    }

    /* -------- Deactivate related inventory -------- */
    await Inventory.updateMany(
      { offeringId: id, businessId, isActive: true },
      { $set: { isActive: false } }
    );

    return res.json({
      message: "Offering deleted (soft) successfully",
    });

  } catch (error) {
    logger.error("Error deleting offering", error);

    return res.status(500).json({
      message: "Error deleting offering",
      error: error.message,
    });
  }
};
