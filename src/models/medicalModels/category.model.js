import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  key: {
    type: String,
    required: true,
    unique: true, // Key must be globally unique
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  level: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

// A category name must be unique within its parent.
categorySchema.index({ parentId: 1, name: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
