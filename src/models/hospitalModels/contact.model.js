// models/Contact.js
import { Schema, model } from 'mongoose';

const contactSchema = new Schema({
  businessId: { type: String, required: true },
  hospitalName: String,
  website: String,
  address: String,
  admissionPhone: String,
  principalPhone: String,
  email: String
}, { timestamps: true });

export default model('Contact', contactSchema);