// models/pharmacyModels/pharmacyAboutUs.model.js
import { Schema, model } from 'mongoose';

const pharmacyAboutUsSchema = new Schema({
  businessId: { type: String, required: true },
  logo: String,
  medicalStoreImage: String,
}, { timestamps: true });

export default model('PharmacyAboutUs', pharmacyAboutUsSchema);
