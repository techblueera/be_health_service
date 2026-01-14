// models/Doctor.js
import { Schema, model } from 'mongoose';

const doctorSchema = new Schema({
  businessId: { type: String, required: true },
  departmentId: { type: String, required: true },
  name: { type: String, required: true },
  specialization: String,
  qualification: String,
  photo: String,
  availability: String,
  fees: Number,
  isOnLeave: { type: Boolean, default: false },
  leaveFrom: Date,
  leaveTo: Date
}, { timestamps: true });

export default model('Doctor', doctorSchema);
