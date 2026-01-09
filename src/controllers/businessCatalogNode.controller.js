import mongoose from "mongoose";
import BusinessCatalogNode from "../models/businessCatalogNode.model.js";
import Business from "../models/business.model.js";
import CatalogNode from "../models/catalogNode.model.js";
import logger from "../utils/appLogger.js";

/**
 * Bulk enable / disable catalog nodes for a business
 */
export const bulkToggleCatalogNodesForBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { catalogNodeIds, isEnabled } = req.body;

    /* ---------- Guards ---------- */
    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid businessId" });
    }

    if (!Array.isArray(catalogNodeIds) || catalogNodeIds.length === 0) {
      return res.status(400).json({
        message: "catalogNodeIds must be a non-empty array",
      });
    }

    if (typeof isEnabled !== "boolean") {
      return res.status(400).json({
        message: "isEnabled must be boolean",
      });
    }

    /* ---------- Ensure business exists ---------- */
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    /* ---------- Validate catalog nodes ---------- */
    const validNodeCount = await CatalogNode.countDocuments({
      _id: { $in: catalogNodeIds },
      isActive: true,
    });

    if (validNodeCount !== catalogNodeIds.length) {
      return res.status(400).json({
        message: "One or more catalog nodes are invalid or inactive",
      });
    }

    /* ---------- Bulk upsert ---------- */
    const bulkOps = catalogNodeIds.map((catalogNodeId) => ({
      updateOne: {
        filter: {
          businessId,
          catalogNodeId,
        },
        update: {
          $set: { isEnabled },
        },
        upsert: true,
      },
    }));

    await BusinessCatalogNode.bulkWrite(bulkOps);

    return res.status(200).json({
      message: "Catalog nodes updated successfully for business",
      data: {
        businessId,
        catalogNodeIds,
        isEnabled,
      },
    });
  } catch (error) {
    logger.error("Error toggling catalog nodes for business", error);
    return res.status(500).json({
      message: "Error toggling catalog nodes",
      error: error.message,
    });
  }
};
