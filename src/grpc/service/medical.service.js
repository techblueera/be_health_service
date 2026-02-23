import grpc from '@grpc/grpc-js';
import Order from '../../models/order.model.js';
import Inventory from '../../models/inventory.model.js';
import ProductVariant from '../../models/productVariant.model.js';

const ORDER_STATUSES = ['placed', 'in-progress', 'completed', 'cancelled'];

// --- Utility Functions ---
const safeStr = (val) => (val ? val.toString() : '');
const safeIsoStr = (date) => (date ? new Date(date).toISOString() : '');
const isValidIdArray = (ids) => Array.isArray(ids) && ids.length > 0;
const stripMongooseKeys = ({ _id, __v, ...rest }) => rest;

// --- Mapping Functions ---
const toGrpcProduct = (product) => {
    if (!product) return null;
    const cleanProduct = stripMongooseKeys(product);
    return {
        ...cleanProduct,
        id: safeStr(product._id),
        category: safeStr(product.category),
        createdAt: safeIsoStr(product.createdAt),
        updatedAt: safeIsoStr(product.updatedAt),
    };
};

const toGrpcProductVariant = (variant) => {
    if (!variant) return null;
    const cleanVariant = stripMongooseKeys(variant);
    return {
        ...cleanVariant,
        id: safeStr(variant._id),
        product: variant.product ? toGrpcProduct(variant.product) : null,
        createdAt: safeIsoStr(variant.createdAt),
        updatedAt: safeIsoStr(variant.updatedAt),
    };
};

const toGrpcInventory = (inv) => {
    if (!inv) return null;
    const cleanInv = stripMongooseKeys(inv);
    return {
        ...cleanInv,
        id: safeStr(inv._id),
        businessId: safeStr(inv.businessId),
        productVariant: inv.productVariant ? toGrpcProductVariant(inv.productVariant) : null,
        createdAt: safeIsoStr(inv.createdAt),
        updatedAt: safeIsoStr(inv.updatedAt),
    };
};

const toGrpcOrder = (doc) => {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    const cleanObj = stripMongooseKeys(obj);
    return {
        ...cleanObj,
        id: safeStr(obj._id),
        userId: safeStr(obj.userId),
        rider: safeStr(obj.rider),
        items: (obj.items || []).map((item) => {
            const cleanItem = stripMongooseKeys(item);
            return {
                ...cleanItem,
                inventory: safeStr(item.inventory),
                productVariant: safeStr(item.productVariant),
            };
        }),
        createdAt: safeIsoStr(obj.createdAt),
        updatedAt: safeIsoStr(obj.updatedAt),
    };
};

// --- gRPC Service Methods ---

const updateOrderStatus = async (call, callback) => {
    try {
        const { orderId, status } = call.request;

        if (!ORDER_STATUSES.includes(status)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                details: 'Invalid order status',
            });
        }

        const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });

        if (!order) {
            return callback({
                code: grpc.status.NOT_FOUND,
                details: 'Order not found',
            });
        }

        callback(null, toGrpcOrder(order));
    } catch (error) {
        callback({ code: grpc.status.INTERNAL, details: error.message });
    }
};

const getInventoryDetails = async (call, callback) => {
    try {
        const { inventoryIds } = call.request;

        if (!isValidIdArray(inventoryIds)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                details: 'Inventory IDs are required',
            });
        }

        const inventories = await Inventory.find({ _id: { $in: inventoryIds } }).populate({
            path: 'productVariant',
            populate: { path: 'product' },
        });

        if (!inventories || inventories.length === 0) {
            return callback({
                code: grpc.status.NOT_FOUND,
                details: 'Inventories not found',
            });
        }

        const responseData = inventories.map((inv) => toGrpcInventory(inv.toObject({ virtuals: true })));
        callback(null, { inventories: responseData });
    } catch (error) {
        callback({ code: grpc.status.INTERNAL, details: error.message });
    }
};

const getProductDetailsByVariantId = async (call, callback) => {
    try {
        const { variantIds } = call.request;

        if (!isValidIdArray(variantIds)) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                details: 'Variant IDs are required',
            });
        }

        const variants = await ProductVariant.find({ _id: { $in: variantIds } }).populate('product');

        if (!variants || variants.length === 0) {
            return callback({
                code: grpc.status.NOT_FOUND,
                details: 'Product variants not found',
            });
        }

        const responseData = variants.map((variant) => toGrpcProductVariant(variant.toObject()));
        callback(null, { variants: responseData });
    } catch (error) {
        callback({ code: grpc.status.INTERNAL, details: error.message });
    }
};

export default {
    UpdateOrderStatus: updateOrderStatus,
    GetInventoryDetails: getInventoryDetails,
    GetProductDetailsByVariantId: getProductDetailsByVariantId,
};

