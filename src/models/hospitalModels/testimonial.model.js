// models/hospitalModels/testimonial.model.js
import { Schema, model } from 'mongoose';

const testimonialSchema = new Schema({
  businessId: { type: String, required: true },
  name: { type: String, required: true },
  image: String,
  rating: { type: Number, min: 1, max: 5 },
  message: String,
  designation: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model('Testimonial', testimonialSchema);