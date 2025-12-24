import { getLocationByPincode } from '../services/location.service.js';

export const attachLocation = async (req, res, next) => {
  const pincode =
    req.headers['x-pincode'] ||
    req.query.pincode;

  if (!pincode) return next();

  const location = await getLocationByPincode(pincode);
  if (!location) {
    return res.status(400).json({ message: 'Service not available for this PIN' });
  }

  req.location = location;
  next();
};
