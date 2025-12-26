import mongoose from "mongoose";
import Inventory from "../models/inventory.model.js";
import Offering from "../models/offering.model.js";

export const createInventory = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { offeringId, pincode, stock, unit } = req.body;

    /* -------- Auth -------- */
    if (!businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const offering = await Offering.findOne({
      _id: offeringId,
      businessId,
      isActive: true,
    });

    if (!offering) {
      return res.status(404).json({
        message: "Offering not found or inactive",
      });
    }

    /* -------- Create inventory -------- */
    const inventory = await Inventory.create({
      offeringId,
      businessId,
      catalogNodeId: offering.catalogNodeId,
      moduleId: offering.moduleId,
      pincode,
      stock,
      unit,
    });

    return res.status(201).json({
      message: "Inventory created successfully",
      data: inventory,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Inventory already exists for this pincode",
      });
    }

    return res.status(500).json({
      message: "Error creating inventory",
      error: error.message,
    });
  }
};


export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;

    if (!businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid inventoryId" });
    }

    const allowedUpdates = ["stock", "unit", "isActive"];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const inventory = await Inventory.findOneAndUpdate(
      { _id: id, businessId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!inventory) {
      return res.status(404).json({
        message: "Inventory not found or access denied",
      });
    }

    return res.json({
      message: "Inventory updated successfully",
      data: inventory,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error updating inventory",
      error: error.message,
    });
  }
};

export const getInventoryByOffering = async (req, res) => {
  const { offeringId } = req.params;
  const businessId = req.user.businessId;

  if (!mongoose.Types.ObjectId.isValid(offeringId)) {
    return res.status(400).json({ message: "Invalid offeringId" });
  }

  const inventories = await Inventory.find({
    offeringId,
    businessId,
  }).sort({ pincode: 1 });

  return res.json({
    message: "Inventory fetched successfully",
    count: inventories.length,
    data: inventories,
  });
};

export const searchInventoryByPincode = async (req, res) => {
  const { pincode, catalogNodeId } = req.query;

  if (!pincode) {
    return res.status(400).json({ message: "pincode is required" });
  }

  const filter = {
    pincode: Number(pincode),
    stock: { $gt: 0 },
    isActive: true,
  };

  if (catalogNodeId) {
    filter.catalogNodeId = catalogNodeId;
  }

  const inventories = await Inventory.find(filter)
    .populate("offeringId", "name pricing type")
    .lean();

  return res.json({
    message: "Available inventory fetched",
    count: inventories.length,
    data: inventories,
  });
};

export const toggleInventory = async (req, res) => {
  const { id } = req.params;
  const businessId = req.user.businessId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid inventoryId" });
  }

  const inventory = await Inventory.findOne({ _id: id, businessId });

  if (!inventory) {
    return res.status(404).json({ message: "Inventory not found" });
  }

  inventory.isActive = !inventory.isActive;
  await inventory.save();

  return res.json({
    message: `Inventory ${inventory.isActive ? "activated" : "deactivated"} successfully`,
  });
};
