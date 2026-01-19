// models/Bed.js
import { Schema, model } from 'mongoose';

const bedSchema = new Schema({
  businessId: { type: String, required: true },
  wardId: { type: String, required: true },
  bedNumber: { type: String, required: true },
  name: String,
  image: String,
  description: String,
  fees: Number,
  isOccupied: { type: Boolean, default: false }
}, { timestamps: true });

export default model('Bed', bedSchema);