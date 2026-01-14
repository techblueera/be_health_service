// models/Career.js
import { Schema, model } from 'mongoose';

const careerSchema = new Schema({
  businessId: { type: String, required: true },
  position: { type: String, required: true },
  description: String,
  requirements: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model('Career', careerSchema);