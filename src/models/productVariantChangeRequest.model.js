import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productVariantChangeRequestSchema = new Schema({
    variant: {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant',
        required: true,
    },
    requestedBy: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    changes: {
        type: Object,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
    },
    rejectionReason: {
        type: String,
    },
}, { timestamps: true });

export default mongoose.model('ProductVariantChangeRequest', productVariantChangeRequestSchema);
