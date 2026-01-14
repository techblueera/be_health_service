// models/Ward.js
import { Schema, model } from 'mongoose';

const wardSchema = new Schema({
  businessId: { type: String, required: true },
  departmentId: { type: String, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['General', 'Semi-Private', 'Private', 'Isolation', 'Pediatric', 'Maternity'] 
  },
  totalBeds: Number,
  availableBeds: Number,
  fees: Number,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model('Ward', wardSchema);