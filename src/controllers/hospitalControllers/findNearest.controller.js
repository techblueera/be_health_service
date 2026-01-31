// controllers/hospitalControllers/findNearest.controller.js
import Contact from '../../models/hospitalModels/contact.model.js';
import geocoder from '../../utils/geocoder.js';

// Find nearest hospitals
export const findNearestHospitals = async (req, res) => {
  try {
    const { pincode, radius } = req.body; // radius in kilometers

    if (!pincode || !radius) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a pincode and a radius',
      });
    }

    // Geocode the user's pincode
    const loc = await geocoder.geocode(pincode);
    const userLocation = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
    };

    const hospitals = await Contact.aggregate([
      {
        $geoNear: {
          near: userLocation,
          distanceField: "distance",
          maxDistance: radius * 1000, // convert km to meters
          spherical: true
        }
      },
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
        $addFields: {
          averageRating: { $avg: "$testimonials.rating" },
          numberOfReviews: { $size: "$testimonials" }
        }
      },
      {
        $project: {
          hospitalName: 1,
          address: 1,
          pincode: 1,
          emergencyNumber: 1,
          distance: 1,
          facilities: {
            $map: {
              input: "$facilities",
              as: "facility",
              in: "$$facility.name"
            }
          },
          averageRating: 1,
          numberOfReviews: 1
        }
      }
    ]);

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
