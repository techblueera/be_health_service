import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
    businessId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    productVariant: {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant',
        required: true,
    },
    pincode: {
      type: String,
      required: true,
      index: true,
    },
    cityName: {
      type: String,
    },
        batches: [{
            batchNumber: { type: String, default: 'N/A' },
            quantity: { type: Number, min: 0 },
            mfgDate: { type: Date },
            expiryDate: { type: Date },
            mrp: { type: Number, required: true },
            sellingPrice: { type: Number, required: true },
        }],
    supplierInfo: {
      name: String,
      contact: String,
    },
    location: {
        aisle: String,
        shelf: String,
    },
    reorderPoint: {
        type: Number,
        default: 10,
    }
}, { timestamps: true });

// An inventory record must be unique for a product variant in a specific location (pincode) for a business
inventorySchema.index({ businessId: 1, productVariant: 1, pincode: 1 }, { unique: true });

inventorySchema.virtual('totalStock').get(function() {
    return this.batches.reduce((total, batch) => total + batch.quantity, 0);
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

export default mongoose.model('Inventory', inventorySchema);
