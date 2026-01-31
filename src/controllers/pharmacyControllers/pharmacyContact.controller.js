// controllers/pharmacyControllers/pharmacyContact.controller.js
import { PharmacyContact } from "../../models/pharmacyModels/index.js";
import geocoder from "../../utils/geocoder.js";

// Create Pharmacy Contact
export const createPharmacyContact = async (req, res) => {
  try {
    const { pincode } = req.body;
    let location;

    if (pincode) {
      const loc = await geocoder.geocode(pincode);
      location = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
      };
    }

    const contact = new PharmacyContact({
      businessId: req.user._id,
      ...req.body,
      location,
    });
    await contact.save();
    res.status(201).json({
      success: true,
      message: "Pharmacy contact created succesfully.",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create pharmacy contact.",
      error: error.message,
    });
  }
};

// Get Pharmacy Contact
export const getPharmacyContact = async (req, res) => {
  try {
    const contact = await PharmacyContact.findOne({ businessId: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: "Pharmacy contact not found" });
    }
    res.status(200).json({
      success: true,
      message: "Pharmacy contact fetched succesfully.",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get pharmacy contact.",
      error: error.message,
    });
  }
};

// Update Pharmacy Contact
export const updatePharmacyContact = async (req, res) => {
  try {
    const { pincode } = req.body;

    if (pincode) {
      const loc = await geocoder.geocode(pincode);
      req.body.location = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
      };
    }

    const contact = await PharmacyContact.findOneAndUpdate(
      { businessId: req.user._id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: "Pharmacy contact updated successfully.",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update pharmacy contact.",
      error: error.message,
    });
  }
};

// Delete Pharmacy Contact
export const deletePharmacyContact = async (req, res) => {
  try {
    const contact = await PharmacyContact.findOneAndDelete({
      businessId: req.user._id,
    });
    if (!contact) {
      return res.status(404).json({ message: "Pharmacy contact not found" });
    }
    res.json({
      success: true,
      message: "Pharmacy contact deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete pharmacy contact.",
      error: error.message,
    });
  }
};
