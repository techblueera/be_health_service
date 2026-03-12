import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const gallerySchema = new Schema({
  businessId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  imageUrls: [{
    type: String,
    required: true,
  }],
  title: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);
