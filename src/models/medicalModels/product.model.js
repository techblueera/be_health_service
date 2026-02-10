import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
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
  tags: [String],
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
  }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

export default mongoose.model('Product', productSchema);
