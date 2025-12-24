import Location from '../models/location.model.js';

export const getLocationByPincode = async (pincode) => {
  if (!pincode) return null;

  return Location.findOne({
    pincode,
    isServiceable: true,
  }).lean();
};
