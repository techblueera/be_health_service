import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
    inventory: {
        type: Schema.Types.ObjectId,
        ref: 'Inventory',
        required: false,
    },
    productVariant: {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    mrp: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
}, { _id: false });

const orderSchema = new Schema({

    userId: { // customer
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    items: [orderItemSchema],

    totalItems: {
        type: Number,
        required: true,
    },
    totalMRP: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    grandTotal: {
        type: Number,
        required: true,
    },
    deliveryType: {
        type: String,
        enum: ['self-pickup', 'rider'],
        required: true,
    },
    rider: {
        type: Schema.Types.ObjectId,
    },
    orderStatus: {
        type: String,
        enum: ['placed', 'in-progress', 'completed', 'cancelled'],
        default: 'placed',
        index: true,
    },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
