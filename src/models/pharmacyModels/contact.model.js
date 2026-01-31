// models/pharmacyModels/pharmacyContact.model.js
import { Schema, model } from 'mongoose';

const pharmacyContactSchema = new Schema({
  businessId: { type: String, required: true },
  pharmacyName: String,
  website: String,
  address: String,
  pincode: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
  phone: String,
  email: String,
  openFrom: String,
  openTill: String
}, { timestamps: true });

pharmacyContactSchema.index({ location: '2dsphere' });

export default model('PharmacyContact', pharmacyContactSchema);
