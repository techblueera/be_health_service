import mongoose from 'mongoose';

const packageItemSchema = new mongoose.Schema(
  {
    packageOfferingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offering',
      required: true,
      index: true,
    },

    includedOfferingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offering',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate inclusion
packageItemSchema.index(
  { packageOfferingId: 1, includedOfferingId: 1 },
  { unique: true }
);

export default mongoose.model('PackageItem', packageItemSchema);
