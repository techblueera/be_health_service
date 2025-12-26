import CatalogNode from "../models/catalogNode.model.js";
import logger from "../utils/appLogger.js";
import { uploadToS3 } from "../utils/s3Uploader.js";
import { moderateContentFromUrl } from "../utils/s3-moderator.js";
import mongoose from "mongoose";

export const createCatalogNode = async (req, res) => {
  const { name, key, type, description, parentId, isActive, moduleId } =
    req.body;

  try {
    let imageUrl;

    /* ---------------- Image upload + moderation ---------------- */
    if (req.file) {
      const uploadedUrl = await uploadToS3(req.file);
      const moderationResult = await moderateContentFromUrl(uploadedUrl);

      if (moderationResult.status !== "allowed") {
        logger.warn(
          `Image moderation failed for ${uploadedUrl} with reason: ${moderationResult.reason}`,
          "createCatalogNode"
        );
        return res.status(400).json({
          message: `Image moderation failed: ${moderationResult.reason}`,
        });
      }
      imageUrl = uploadedUrl;
    }

    /* ---------------- Calculate level & validate parent ---------------- */
    let level = 0;

    if (parentId) {
      const parentNode = await CatalogNode.findById(parentId);

      if (!parentNode) {
        return res.status(404).json({
          message: "Parent node not found",
        });
      }

      if (!parentNode.moduleId.equals(moduleId)) {
        return res.status(400).json({
          message: "Parent node belongs to a different moduleId",
        });
      }

      if (parentNode.rules?.allowChildren === false) {
        return res.status(400).json({
          message: "Parent node does not allow child nodes",
        });
      }

      level = parentNode.level + 1;
    }

    /* ---------------- Create node ---------------- */
    const newNode = new CatalogNode({
      name,
      key,
      type,
      description,
      parentId: parentId || null,
      level,
      isActive,
      image: imageUrl,
      moduleId,
    });

    await newNode.save();

    return res.status(201).json({
      message: "Catalog node created successfully",
      data: newNode,
    });
  } catch (error) {
    logger.error("Error creating catalog node", "createCatalogNode", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A catalog node with this key already exists in this moduleId",
      });
    }

    return res.status(500).json({
      message: "Error creating catalog node",
      error: error.message,
    });
  }
};

export const getCatalogNodes = async (req, res) => {
  const { moduleId } = req.query;

  try {
    const filter = {};
    if (moduleId) {
      filter.moduleId = moduleId;
    }

    const nodes = await CatalogNode.find(filter).sort({ level: 1 });

    res.status(200).json({
      message: "Catalog nodes fetched successfully.",
      count: nodes.length,
      data: nodes,
    });
  } catch (error) {
    logger.error("Error fetching catalog nodes", "getCatalogNodes", error);
    res.status(500).json({
      message: "Error fetching catalog nodes",
      error: error.message,
    });
  }
};

export const getCatalogNodeChildren = async (req, res) => {
  const { id } = req.params;

  try {
    const children = await CatalogNode.find({
      parentId: id,
      isActive: true,
    }).sort({ level: 1 });

    res.status(200).json({
      message: "Child nodes fetched successfully.",
      count: children.length,
      data: children,
    });
  } catch (error) {
    logger.error(
      "Error fetching catalog node children",
      "getCatalogNodeChildren",
      error
    );
    res.status(500).json({
      message: "Error fetching child nodes",
      error: error.message,
    });
  }
};

export const getCatalogNodeById = async (req, res) => {
  const { id } = req.params;

  try {
    const node = await CatalogNode.findById(id);

    if (!node) {
      return res.status(404).json({ message: "Catalog node not found" });
    }

    res.status(200).json({
      message: "Catalog node fetched successfully.",
      data: node,
    });
  } catch (error) {
    logger.error("Error fetching catalog node", "getCatalogNodeById", error);
    res.status(500).json({
      message: "Error fetching catalog node",
      error: error.message,
    });
  }
};

export const updateCatalogNode = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const node = await CatalogNode.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!node) {
      return res.status(404).json({ message: "Catalog node not found" });
    }

    res.status(200).json({
      message: "Catalog node updated successfully.",
      data: node,
    });
  } catch (error) {
    logger.error("Error updating catalog node", "updateCatalogNode", error);
    res.status(500).json({
      message: "Error updating catalog node",
      error: error.message,
    });
  }
};

export const deactivateCatalogNode = async (req, res) => {
  const { id } = req.params;

  try {
    const node = await CatalogNode.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!node) {
      return res.status(404).json({ message: "Catalog node not found" });
    }

    res.status(200).json({
      message: "Catalog node deactivated successfully.",
      data: node,
    });
  } catch (error) {
    logger.error(
      "Error deactivating catalog node",
      "deactivateCatalogNode",
      error
    );
    res.status(500).json({
      message: "Error deactivating catalog node",
      error: error.message,
    });
  }
};

export const getCatalogTree = async (req, res) => {
  try {
    const { moduleId } = req.query;

    if (!moduleId || !mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ message: "Valid moduleId is required" });
    }

    const nodes = await CatalogNode.find({
      moduleId,
      isActive: true,
    }).lean();

    if (nodes.length === 0) {
      return res.json({
        message: "Catalog tree fetched successfully",
        count: 0,
        data: [],
      });
    }

    const map = {};
    nodes.forEach((node) => {
      map[node._id] = { ...node, children: [] };
    });

    const tree = [];
    nodes.forEach((node) => {
      if (node.parentId) {
        // attach to parent
        map[node.parentId]?.children.push(map[node._id]);
      } else {
        // root node
        tree.push(map[node._id]);
      }
    });

    return res.json({
      message: "Catalog tree fetched successfully",
      count: tree.length,
      data: tree,
    });
  } catch (error) {
    logger.error("Error fetching catalog tree", error);
    return res.status(500).json({
      message: "Error fetching catalog tree",
      error: error.message,
    });
  }
};

