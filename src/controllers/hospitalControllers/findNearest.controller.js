// controllers/hospitalControllers/findNearest.controller.js
import Contact from '../../models/hospitalModels/contact.model.js';
import geocoder from '../../utils/geocoder.js';

// Find nearest hospitals
export const findNearestHospitals = async (req, res) => {
  try {
    const { radius } = req.body; // radius in kilometers
    let pincode = req.body.pincode;

    // Trim the pincode if it's a string to handle whitespace correctly
    if (typeof pincode === 'string') {
      pincode = pincode.trim();
    }
    console.log('Processed pincode:', pincode);

    let hospitals;

    const lookupStages = [
      {
        $lookup: {
          from: 'facilities',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'facilities'
        }
      },
      {
        $lookup: {
          from: 'testimonials',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'testimonials'
        }
      },
      {
        $lookup: {
          from: 'aboutus',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'about'
        }
      },
      // Additional lookups for other hospital models
      {
        $lookup: {
          from: 'beds',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'beds'
        }
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'branches'
        }
      },
      {
        $lookup: {
          from: 'careers',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'careers'
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'departments'
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'doctors'
        }
      },
      {
        $lookup: {
          from: 'emergencyservices',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'emergencyServices'
        }
      },
      {
        $lookup: {
          from: 'wards',
          localField: 'businessId',
          foreignField: 'businessId',
          as: 'wards'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: "$testimonials.rating" },
          numberOfReviews: { $size: "$testimonials" },
          logoImage: { $arrayElemAt: ["$about.logoImage", 0] }
        }
      },
    ];

    const projectStage = {
      $project: {
        hospitalName: 1,
        address: 1,
        pincode: 1,
        emergencyNumber: 1,
        facilities: {
          $map: {
            input: "$facilities",
            as: "facility",
            in: "$$facility.name"
          }
        },
        averageRating: 1,
        numberOfReviews: 1,
        logoImage: 1,
        // Add new fields from lookups
        beds: 1,
        branches: 1,
        careers: 1,
        // departments: 1,
        doctors: 1,
        emergencyServices: 1,
        wards: 1
      }
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
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
      };

      const geoProjectStage = {
        $project: {
          ...projectStage.$project,
          distance: 1
        }
      };

      const pipeline = [
        {
          $geoNear: {
            near: userLocation,
            distanceField: "distance",
            maxDistance: radius * 1000, // convert km to meters
            spherical: true
          }
        },
        ...lookupStages,
        geoProjectStage
      ];

      hospitals = await Contact.aggregate(pipeline);
    } else {
      console.log('Executing "get all hospitals" logic (no pincode provided).');
      const pipeline = [
        ...lookupStages,
        projectStage
      ];
      hospitals = await Contact.aggregate(pipeline);
    }

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to find nearest hospitals.',
      error: error.message,
    });
  }
};

