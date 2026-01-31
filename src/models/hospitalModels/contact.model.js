// models/Contact.js
import { Schema, model } from 'mongoose';

const contactSchema = new Schema({
  businessId: { type: String, required: true },
  hospitalName: String,
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
  admissionPhone: String,
  principalPhone: String,
  emergencyNumber: Number,
  email: String
}, { timestamps: true });

contactSchema.index({ location: '2dsphere' });

export default model('Contact', contactSchema);