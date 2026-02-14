// controllers/pharmacyControllers/findNearest.controller.js
import PharmacyContact from '../../models/medicalModels/contact.model.js';
import geocoder from "../../utils/geocoder.js";

// Find nearest pharmacies
export const findNearestPharmacies = async (req, res) => {
  try {
    const { radius } = req.body; // radius in kilometers
    let pincode = req.body.pincode;

    // Trim the pincode if it's a string to handle whitespace correctly
    if (typeof pincode === 'string') {
      pincode = pincode.trim();
    }
    console.log('Processed pincode:', pincode);

    let pharmacies;

    const lookupStages = [
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
      // Additional lookups for other medical models
      {
        $lookup: {
          from: 'categories',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: 'inventories',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'inventories'
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'orders'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'products'
        }
      },
      {
        $lookup: {
          from: 'productvariants',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'productVariants'
        }
      },
      {
        $lookup: {
          from: 'productvariantchangerequests',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'productVariantChangeRequests'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: "$testimonials.rating" },
          numberOfReviews: { $size: "$testimonials" },
          logo: { $ifNull: [{ $arrayElemAt: ["$about.logo", 0] }, ""] },
        },
      },
    ];

    const projectStage = {
      $project: {
        pharmacyName: 1,
        website: 1,
        address: 1,
        pincode: 1,
        phone: 1,
        email: 1,
        openFrom: 1,
        openTill: 1,
        averageRating: 1,
        numberOfReviews: 1,
        logo: 1,
        // Add new fields from lookups
        // categories: 1,
        inventories: 1,
        // orders: 1,
        // products: 1,
        // productVariants: 1,
        // productVariantChangeRequests: 1
      },
    };

    if (pincode) {
      console.log('Executing geo-search logic.');
      if (!radius) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a radius along with the pincode.',
        });
      }

      // Geocode the user's pincode
      const loc = await geocoder.geocode(pincode);
      if (!loc || loc.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Could not geocode the provided pincode. Please provide a valid pincode.',
        });
      }
      const userLocation = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
      };

      const geoProjectStage = {
        $project: {
          ...projectStage.$project,
          distance: 1,
        }
      };

      const pipeline = [
        {
          $geoNear: {
            near: userLocation,
            distanceField: "distance",
            maxDistance: radius * 1000, // convert km to meters
            spherical: true,
          },
        },
        ...lookupStages,
        geoProjectStage
      ];

      pharmacies = await PharmacyContact.aggregate(pipeline);
    } else {
      console.log('Executing "get all pharmacies" logic (no pincode provided).');
      const pipeline = [
        ...lookupStages,
        projectStage
      ];
      pharmacies = await PharmacyContact.aggregate(pipeline);
    }

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
