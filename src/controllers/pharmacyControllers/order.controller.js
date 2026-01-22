// ==================== GET ALL ORDERS ====================

import { Order } from "../../models/pharmacyModels/order.model.js";

// Screen: "Orders" tab - Display all orders with filters
export const getOrders = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { status } = req.query; // pending, complete, cancelled, payment

    const filter = { businessId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== GET SINGLE ORDER ====================
// Screen: "Orders" tab - View order details
export const getOrder = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      businessId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully.",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== CREATE ORDER ====================
// Screen: "Orders" tab - Create new order
export const createOrder = async (req, res) => {
  try {
    const businessId = req.user._id;
    const {
      orderId,
      customerName,
      totalItems,
      totalAmount,
      status,
      itemsMissing,
    } = req.body;

    const order = await Order.create({
      businessId,
      orderId,
      customerName,
      totalItems,
      totalAmount,
      status,
      itemsMissing,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== UPDATE ORDER ====================
// Screen: "Orders" tab - Update order status
export const updateOrder = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { orderId } = req.params;
    const { customerName, totalItems, totalAmount, status, itemsMissing } =
      req.body;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, businessId },
      { customerName, totalItems, totalAmount, status, itemsMissing },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully.",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== UPDATE ORDER STATUS ====================
// Screen: "Orders" tab - Mark as complete/pending/cancelled
export const updateOrderStatus = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, businessId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== DELETE ORDER ====================
// Screen: "Orders" tab - Delete order
export const deleteOrder = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findOneAndDelete({
      _id: orderId,
      businessId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
