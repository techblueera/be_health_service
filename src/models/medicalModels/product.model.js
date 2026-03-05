import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  generic_name: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
    index: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  manufacturerDetails: {
    name: { type: String, trim: true },
    address: { type: String, trim: true },
    customerCare: { type: String, trim: true }
  },
  marketer_name: {
    type: String,
    trim: true,
  },
  tags: [String],
  filterKeywords: [String],
  images: [{
      url: { type: String, required: true },
      altText: { type: String }
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isVegetarian: {
      type: Boolean,
      default: true,
  },
  countryOfOrigin: {
      type: String,
      default: 'India',
  },
  nutritionalInfo: {
      type: Map,
      of: String,
  },

  // --- Medical & Pharma Specific Fields ---
  salt_composition: { type: String, trim: true },
  strength: { type: String, trim: true },
  drug_type: { type: String, trim: true }, // e.g., Allopathy, Ayurveda
  product_form: { type: String, trim: true }, // e.g., Tablet, Syrup
  is_prescription_required: { type: Boolean, default: false },
  pack_size: { type: String, trim: true },
  pack_type: { type: String, trim: true },
  storage_conditions: { type: String, trim: true },
  shelf_life: { type: String, trim: true },
  
  // --- Clinical Information ---
  indications: [{ type: String }],
  dosage_instructions: { type: String },
  contraindications: [{ type: String }],
  side_effects: [{ type: String }],
  drug_interactions: [{ type: String }],
  warnings_precautions: { type: String },
  
  // --- Special Population Usage ---
  use_in_pregnancy: { type: String },
  use_in_lactation: { type: String },
  use_in_children: { type: String },
  use_in_elderly: { type: String }

}, { timestamps: true });

// Added generic_name and filterKeywords to the text index for better searchability 
productSchema.index({ 
  name: 'text', 
  generic_name: 'text',
  description: 'text', 
  brand: 'text', 
  tags: 'text',
  filterKeywords: 'text'
});

export default mongoose.model('Product', productSchema);