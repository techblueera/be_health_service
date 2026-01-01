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
      required: true,
    },
        batches: [{
            batchNumber: { type: String, required: true },
            quantity: { type: Number, required: true, min: 0 },
            mfgDate: { type: Date },
            expiryDate: { type: Date, required: true },
            mrp: {
                price: { type: Number, required: true },
                unit: { type: String, required: true }
            },
            purchasePrice: {
                price: { type: Number },
                unit: { type: String }
            },
            sellingPrice: {
                price: { type: Number, required: true },
                unit: { type: String, required: true }
            },
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
