// controllers/pharmacyControllers/findNearest.controller.js
import PharmacyContact from '../../models/medicalModels/contact.model.js';
import geocoder from "../../utils/geocoder.js";

// Find nearest pharmacies
export const findNearestPharmacies = async (req, res) => {
  try {
    const { pincode, radius } = req.body; // radius in kilometers

    if (!pincode || !radius) {
      return res.status(400).json({
        success: false,
        message: "Please provide a pincode and a radius",
      });
    }

    // Geocode the user's pincode
    const loc = await geocoder.geocode(pincode);
    const userLocation = {
      type: "Point",
      coordinates: [loc[0].longitude, loc[0].latitude],
    };

    const pharmacies = await PharmacyContact.aggregate([
      // {
      //   $geoNear: {
      //     near: userLocation,
      //     distanceField: "distance",
      //     maxDistance: radius * 1000, // convert km to meters
      //     spherical: true,
      //   },
      // },
      {
        $lookup: {
          from: "pharmacytestimonials",
          localField: "businessId",
          foreignField: "businessId",
          as: "testimonials",
        },
      },
      {
        $lookup: {
          from: "pharmacyaboutus",
          localField: "businessId",
          foreignField: "businessId",
          as: "about",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$testimonials.rating" },
          numberOfReviews: { $size: "$testimonials" },
          logo: { $ifNull: [ { $arrayElemAt: ["$about.logo", 0] }, "" ] },
        },
      },
      {
        $project: {
          pharmacyName: 1,
          website: 1,
          address: 1,
          pincode: 1,
          phone: 1,
          email: 1,
          distance: 1,
          openFrom: 1,
          openTill: 1,
          averageRating: 1,
          numberOfReviews: 1,
          logo: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: pharmacies.length,
      data: pharmacies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to find nearest pharmacies.",
      error: error.message,
    });
  }
};
