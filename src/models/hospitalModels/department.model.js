// models/Department.js
import { Schema, model } from 'mongoose';

const departmentSchema = new Schema({
  businessId: { type: String, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['OPD', 'IPD', 'Emergency', 'Diagnostic', 'MedicalStore', 'Other'], 
    required: true 
  },
  icon: String,
  parentId: { type: String, default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model('Department', departmentSchema);