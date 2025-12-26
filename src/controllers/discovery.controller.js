import Offering from "../models/offering.model.js";
import Business from "../models/business.model.js";
import mongoose from "mongoose";

export const getBusinessesByPincode = async (req, res) => {
  const { pincode } = req.query;

  try {
    /* ---------------- Guard: pincode ---------------- */
    if (!pincode) {
      return res.status(400).json({
        message: "pincode is required",
      });
    }

    /* ---------------- Find businessIds via offerings */
    const businessIds = await Offering.distinct("businessId", {
      pincode: Number(pincode),
      isActive: true,
    });

    if (businessIds.length === 0) {
      return res.json({
        message: "No businesses found for this pincode",
        count: 0,
        data: [],
      });
    }

    /* ---------------- Fetch businesses ------------- */
    const businesses = await Business.find({
      _id: { $in: businessIds },
      isActive: true,
    }).select("name type");

    return res.json({
      message: "Businesses fetched successfully",
      count: businesses.length,
      data: businesses,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching businesses",
      error: error.message,
    });
  }
};

export const getOfferingsByPincode = async (req, res) => {
  const { pincode, q, type, catalogNodeId } = req.query;

  try {
    /* ---------------- Guard: pincode ---------------- */
    if (!pincode) {
      return res.status(400).json({
        message: "pincode is required",
      });
    }

    /* ---------------- Base query ------------------- */
    const query = {
      pincode: Number(pincode),
      isActive: true,
    };

    /* ---------------- Optional filters ------------- */

    // Filter by offering type (PRODUCT / SERVICE / etc.)
    if (type) {
      query.type = type;
    }

    // Filter by specific category
    if (catalogNodeId) {
      query.catalogNodeId = catalogNodeId;
    }

    // Filter by name (generic search)
    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    /* ---------------- Fetch offerings -------------- */
    const offerings = await Offering.find(query)
      .populate("businessId", "name type");

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


export const getBusinessOfferingsByPincode = async (req, res) => {
  const { id } = req.params;
  const { pincode } = req.query;

  try {
    /* ---------------- Guard: businessId ------------ */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid businessId",
      });
    }

    /* ---------------- Guard: pincode --------------- */
    if (!pincode) {
      return res.status(400).json({
        message: "pincode is required",
      });
    }

    /* ---------------- Fetch offerings -------------- */
    const offerings = await Offering.find({
      businessId: id,
      pincode: Number(pincode),
      isActive: true,
    });

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
