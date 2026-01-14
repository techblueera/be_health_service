// models/AboutUs.js
import { Schema, model } from 'mongoose';

const aboutUsSchema = new Schema({
  businessId: { type: String, required: true },
  visionMission: String,
  history: String,
  management: String
}, { timestamps: true });

export default model('AboutUs', aboutUsSchema);