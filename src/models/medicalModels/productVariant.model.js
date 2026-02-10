import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productVariantSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    variantName: {
        type: String,
        trim: true,
    },
    unit: {
        type: String,
        required: true,
    },
    sku: {
        type: String,
        trim: true,
    },
    barcode: {
        type: String,
        trim: true,
    },
    pricing: [{
        pincode: { type: String, index: true },
        cityName: { type: String },
        mrp: { type: Number, required: true },
        sellingPrice: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
    }],
    images: [{
        url: { type: String, required: true },
        altText: { type: String }
    }],
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
    },
    weight: Number,
}, { timestamps: true });

productVariantSchema.index({ product: 1 });
// SKU and Barcode must be unique within a business
productVariantSchema.index({ sku: 1 }, { unique: true, sparse: true });
productVariantSchema.index({ barcode: 1 }, { unique: true, sparse: true });


export default mongoose.model('ProductVariant', productVariantSchema);
