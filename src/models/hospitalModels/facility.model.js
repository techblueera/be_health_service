// models/Facility.js
import { Schema, model } from 'mongoose';

const facilitySchema = new Schema({
  businessId: { type: String, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Insurance', 'Ambulance', 'GovernmentScheme', 'BloodBank', 'Other'] 
  },
  image: String,
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model('Facility', facilitySchema);
