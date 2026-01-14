// models/Branch.js
import { Schema, model } from 'mongoose';

const branchSchema = new Schema({
  businessId: { type: String, required: true },
  name: { type: String, required: true },
  address: String,
  phone: String,
  email: String
}, { timestamps: true });

export default model('Branch', branchSchema);