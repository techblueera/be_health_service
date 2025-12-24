import Location from '../models/location.model.js';
import logger from '../utils/appLogger.js';

export const createLocation = async (req, res) => {
  const { pincode, city, state, country, geo } = req.body;

  try {
    if (!pincode) {
      return res.status(400).json({ message: 'Pincode is required' });
    }

    const location = await Location.create({
      pincode,
      city,
      state,
      country,
      geo,
      isServiceable: true,
    });

    res.status(201).json({
      message: 'Location registered successfully',
      data: location,
    });
  } catch (error) {
    logger.error('Error creating location', 'createLocation', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Location already exists for this pincode',
      });
    }

    res.status(500).json({
      message: 'Error creating location',
      error: error.message,
    });
  }
};


export const getLocations = async (req, res) => {
  const { pincode, isServiceable } = req.query;

  try {
    const filter = {};
    if (pincode) filter.pincode = pincode;
    if (isServiceable !== undefined) {
      filter.isServiceable = isServiceable === 'true';
    }

    const locations = await Location.find(filter).lean();

    res.status(200).json({
      message: 'Locations fetched successfully',
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    logger.error('Error fetching locations', 'getLocations', error);
    res.status(500).json({
      message: 'Error fetching locations',
      error: error.message,
    });
  }
};


/**
 * GET /locations/by-pincode/:pincode
 */
export const getLocationByPincode = async (req, res) => {
  const { pincode } = req.params;

  try {
    const location = await Location.findOne({ pincode }).lean();

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({
      message: 'Location fetched successfully',
      data: location,
    });
  } catch (error) {
    logger.error('Error fetching location', 'getLocationByPincode', error);
    res.status(500).json({
      message: 'Error fetching location',
      error: error.message,
    });
  }
};

const allowedUpdates = ['city', 'state', 'country', 'geo', 'isServiceable'];

export const updateLocation = async (req, res) => {
  const { pincode } = req.params;
  const updates = {};

  allowedUpdates.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  try {
    const location = await Location.findOneAndUpdate(
      { pincode },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({
      message: 'Location updated successfully',
      data: location,
    });
  } catch (error) {
    logger.error('Error updating location', 'updateLocation', error);
    res.status(500).json({
      message: 'Error updating location',
      error: error.message,
    });
  }
};


export const disableLocation = async (req, res) => {
  const { pincode } = req.params;

  try {
    const location = await Location.findOneAndUpdate(
      { pincode },
      { isServiceable: false },
      { new: true }
    );

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({
      message: 'Location disabled successfully',
      data: location,
    });
  } catch (error) {
    logger.error('Error disabling location', 'disableLocation', error);
    res.status(500).json({
      message: 'Error disabling location',
      error: error.message,
    });
  }
};

