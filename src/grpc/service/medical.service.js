import grpc from '@grpc/grpc-js';
import Order from '../../models/order.model.js';
import Inventory from '../../models/inventory.model.js';
import ProductVariant from '../../models/productVariant.model.js';

// --- Helper: Mongoose to gRPC Mapper ---
const toGrpcObj = (doc) => {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;

    const safeStr = (val) => (val ? val.toString() : "");

    return {
        ...obj,
        id: safeStr(obj._id),
        userId: safeStr(obj.userId),
        rider: safeStr(obj.rider),
        items: obj.items.map(item => ({
            ...item,
            inventory: safeStr(item.inventory),
            productVariant: safeStr(item.productVariant),
        })),
        createdAt: obj.createdAt ? obj.createdAt.toISOString() : "",
        updatedAt: obj.updatedAt ? obj.updatedAt.toISOString() : "",
    };
};

const updateOrderStatus = async (call, callback) => {
    try {
        const { orderId, status } = call.request;

        // Validate status
        const allowedStatus = ['placed', 'in-progress', 'completed', 'cancelled'];
        if (!allowedStatus.includes(status)) {
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

        callback(null, toGrpcObj(order));
    } catch (error) {
        callback({ code: grpc.status.INTERNAL, details: error.message });
    }
};

const getInventoryDetails = async (call, callback) => {
    try {
        const { inventoryIds } = call.request;
        if (!inventoryIds || inventoryIds.length === 0) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                details: 'Inventory IDs are required',
            });
        }

        const inventories = await Inventory.find({ _id: { $in: inventoryIds } })
            .populate({
                path: 'productVariant',
                populate: { path: 'product' }
            });

        if (!inventories || inventories.length === 0) {
            return callback({
                code: grpc.status.NOT_FOUND,
                details: 'Inventories not found',
            });
        }
        
        const responseData = inventories.map(inv => {
            const invObj = inv.toObject({ virtuals: true });
            const safeStr = val => val ? val.toString() : "";
            
            let productVariant = null;
            if(invObj.productVariant) {
                let product = null;
                if(invObj.productVariant.product) {
                    const p = invObj.productVariant.product;
                    product = {
                        ...p,
                        id: safeStr(p._id),
                        category: safeStr(p.category),
                        createdAt: p.createdAt ? p.createdAt.toISOString() : "",
                        updatedAt: p.updatedAt ? p.updatedAt.toISOString() : ""
                    };
                    delete product._id;
                    delete product.__v;
                }
                const pv = invObj.productVariant;
                productVariant = {
                    ...pv,
                    id: safeStr(pv._id),
                    product: product,
                    createdAt: pv.createdAt ? pv.createdAt.toISOString() : "",
                    updatedAt: pv.updatedAt ? pv.updatedAt.toISOString() : ""
                };
                delete productVariant._id;
                delete productVariant.__v;
            }

            const result = {
                ...invObj,
                id: safeStr(invObj._id),
                businessId: safeStr(invObj.businessId),
                createdAt: invObj.createdAt ? invObj.createdAt.toISOString() : "",
                updatedAt: invObj.updatedAt ? invObj.updatedAt.toISOString() : "",
                productVariant: productVariant
            };
            delete result._id;
            delete result.__v;
            return result;
        });
        
        callback(null, { inventories: responseData });

    } catch (error) {
        callback({ code: grpc.status.INTERNAL, details: error.message });
    }
};

const getProductDetailsByVariantId = async (call, callback) => {
    try {
        const { variantIds } = call.request;
        if (!variantIds || variantIds.length === 0) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                details: 'Variant IDs are required',
            });
        }

        const variants = await ProductVariant.find({ _id: { $in: variantIds } })
            .populate('product');

        if (!variants || variants.length === 0) {
            return callback({
                code: grpc.status.NOT_FOUND,
                details: 'Product variants not found',
            });
        }

        const responseData = variants.map(variant => {
            const variantObj = variant.toObject();
            const safeStr = val => val ? val.toString() : "";

            let product = null;
            if (variantObj.product) {
                const p = variantObj.product;
                product = {
                    ...p,
                    id: safeStr(p._id),
                    category: safeStr(p.category),
                    createdAt: p.createdAt ? p.createdAt.toISOString() : "",
                    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : ""
                };
                delete product._id;
                delete product.__v;
            }
            
            const result = {
                ...variantObj,
                id: safeStr(variantObj._id),
                product: product,
                createdAt: variantObj.createdAt ? variantObj.createdAt.toISOString() : "",
                updatedAt: variantObj.updatedAt ? variantObj.updatedAt.toISOString() : ""
            };
            delete result._id;
            delete result.__v;

            return result;
        });

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

