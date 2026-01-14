// models/EmergencyService.js
import { Schema, model } from 'mongoose';

const emergencyServiceSchema = new Schema({
  businessId: { type: String, required: true },
  departmentId: { type: String, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Emergency', 'Trauma', 'ICU', 'CCU', 'NICU', 'PICU'] 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model('EmergencyService', emergencyServiceSchema);