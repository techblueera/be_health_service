import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  businessId: { type: String, required: true },
  orderId: String,
  customerName: String,
  totalItems: Number,
  totalAmount: Number,
  status: { type: String, enum: ['pending', 'complete', 'cancelled', 'payment'] },
  itemsMissing: Number
});

export const Order = model('Order', orderSchema);