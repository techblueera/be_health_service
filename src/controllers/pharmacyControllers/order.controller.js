import mongoose from "mongoose";
import { Order, ProductVariant } from "../../models/pharmacyModels/index.js";
import logger from "../../utils/appLogger.js";
import haversine from "haversine-distance";
import {
  getBusinessById,
  getBusinessByUserId,
} from "../../grpc/clients/businessClient.js";

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { items, deliveryType, discount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must contain at least one item." });
    }

    let totalItems = 0;
    let totalMRP = 0;
    let grandTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const { inventory: inventoryId, quantity } = item; 

      if (!inventoryId) {
        throw new Error(`Inventory ID is required for each item.`);
      }

      if (!mongoose.Types.ObjectId.isValid(inventoryId)) {
        throw new Error(`Invalid inventory ID: ${inventoryId}`);
      }

      const productVariant = await ProductVariant.findOne({
        "inventories._id": inventoryId,
      }).session(session);

      if (!productVariant) {
        throw new Error(
          `Product Variant containing inventory with id ${inventoryId} not found.`
        );
      }

      const targetInventory = productVariant.inventories.id(inventoryId);

      if (!targetInventory) {
        throw new Error(
          `Inventory sub-document with id ${inventoryId} not found within Product Variant.`
        );
      }

      const totalStock = targetInventory.batches.reduce(
        (sum, batch) => sum + batch.quantity,
        0
      );

      if (totalStock < quantity) {
        throw new Error(
          `Not enough stock for inventory ${inventoryId}. Available: ${totalStock}, Requested: ${quantity}`
        );
      }

      let itemMrp = 0;
      let itemSellingPrice = 0;

      if (targetInventory.batches.length > 0) {
        itemMrp = targetInventory.batches[0].mrp;
        itemSellingPrice = targetInventory.batches[0].sellingPrice;
      } else {
        throw new Error(`No batches available for inventory ${inventoryId}`);
      }

      let quantityToDeduct = quantity;
      for (const batch of targetInventory.batches) {
        if (quantityToDeduct === 0) break;

        if (batch.quantity >= quantityToDeduct) {
          batch.quantity -= quantityToDeduct;
          quantityToDeduct = 0;
        } else {
          quantityToDeduct -= batch.quantity;
          batch.quantity = 0;
        }
      }

      targetInventory.batches = targetInventory.batches.filter(
        (b) => b.quantity > 0
      );

      await productVariant.save({ session });

      processedItems.push({
        productVariant: productVariant._id,
        inventory: inventoryId,
        quantity,
        mrp: itemMrp,
        sellingPrice: itemSellingPrice,
      });

      
      totalItems += quantity;
      totalMRP += itemMrp * quantity;
      grandTotal += itemSellingPrice * quantity;
    }

    const finalGrandTotal = grandTotal - (discount || 0);

    const newOrder = new Order({
      userId,
      items: processedItems,
      deliveryType,
      totalItems,
      totalMRP,
      grandTotal: finalGrandTotal,
      discount: discount || 0,
    });

    const savedOrder = await newOrder.save({ session });

    await session.commitTransaction();
    res.status(201).json(savedOrder);
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error creating order", "createOrder", error);
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  } finally {
    session.endSession();
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, rider } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (orderStatus) {
      updateData.orderStatus = orderStatus;
    }
    if (rider) {
      updateData.rider = rider;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided." });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Basic authorization: either the user who created the order or can be extended for admins
    if (order.userId.toString() !== userId.toString()) {
      // This can be expanded to check for business roles
      return res
        .status(403)
        .json({ message: "You are not authorized to update this order." });
    }

    // Prevent users from reverting status or making restricted updates
    if (orderStatus === "cancelled" && order.orderStatus !== "placed") {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled once it is in progress." });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedOrder);
  } catch (error) {
    logger.error(`Error updating order ${req.params.id}`, "updateOrder", error);
    res
      .status(500)
      .json({ message: "Error updating order", error: error.message });
  }
};

const checkOrderStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const ongoingOrder = await Order.findOne({
      userId,
      orderStatus: { $in: ["placed", "in-progress"] },
    }).sort({ createdAt: -1 });

    if (!ongoingOrder) {
      return res
        .status(200)
        .json({ hasOngoingOrder: false, message: "No ongoing orders found." });
    }

    res.status(200).json({ hasOngoingOrder: true, order: ongoingOrder });
  } catch (error) {
    logger.error(
      `Error checking order status for user ${req.user._id}`,
      "checkOrderStatus",
      error
    );
    res
      .status(500)
      .json({ message: "Error checking order status", error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      page = 1,
      limit = 10,
      orderStatus,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { userId };

    if (orderStatus) {
      const statuses = Array.isArray(orderStatus)
        ? orderStatus
        : orderStatus.split(",");
      filter.orderStatus = { $in: statuses };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Define sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Fetch orders with filters, pagination, and sorting
    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "items.productVariant",
        populate: {
          path: "productId",
          select: "name description brand images",
        },
        select: "weight images inventories", // fields from productVariant itself
      })
      .lean();

    // Get total count for pagination metadata
    const totalCount = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: totalCount,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          nextPage: parseInt(page) < totalPages ? parseInt(page) + 1 : null,
          prevPage: parseInt(page) > 1 ? parseInt(page) - 1 : null,
        },
        filters: {
          orderStatus,
          startDate,
          endDate,
          sortBy,
          sortOrder,
        },
      },
    });
  } catch (error) {
    logger.error(
      `Error fetching orders for user ${req.user._id}`,
      "getUserOrders",
      error
    );
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

const findOrderAlternatives = async (req, res) => {
  const { orderId } = req.params;
  const { filter = "suggested", latitude, longitude } = req.query;
  const logContext = "findOrderAlternatives";

  logger.info(
    `Starting findOrderAlternatives for order: ${orderId}`,
    logContext
  );

  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      logger.warn(`Invalid order ID: ${orderId}`, logContext);
      return res.status(400).json({ message: "Invalid order ID." });
    }

    if (filter === "nearest" && (!latitude || !longitude)) {
      logger.warn(`Missing coordinates for 'nearest' filter`, logContext);
      return res
        .status(400)
        .json({
          message: 'Latitude and longitude are required for "nearest" filter.',
        });
    }

    const order = await Order.findById(orderId).lean();
    if (!order) {
      logger.warn(`Order not found: ${orderId}`, logContext);
      return res.status(404).json({ message: "Order not found." });
    }
    logger.info(`Order found with ${order.items.length} items`, logContext);

    const productVariantIds = order.items.map((item) => item.productVariant);
    logger.info(
      `Product variant IDs: ${productVariantIds.join(", ")}`,
      logContext
    );

    // Find ProductVariants that contain any of the ordered product variant IDs and have at least one inventory entry
    const productVariantsWithInventory = await ProductVariant.find({
      _id: { $in: productVariantIds }, // We are looking for the ProductVariants themselves
      "inventories.0": { $exists: true }, // Ensure it has at least one inventory sub-document
    })
      .populate({
        path: "productId", // Assuming productId in ProductVariant refers to a Product model
        select: "name description brand images", // Select relevant fields from Product
      })
      .lean();

    // Renaming 'inventories' to 'productVariants' for clarity in the loop below.
    const productVariants = productVariantsWithInventory;
    logger.info(
      `Found ${productVariants.length} product variants with inventories`,
      logContext
    );

    if (productVariants.length === 0) {
      return res.status(200).json([]);
    }

    const businessData = new Map();
    for (const pv of productVariants) {
      // Renamed inventory to pv (productVariant)
      // Each product variant belongs to a business (businessId is on the ProductVariant model)
      if (!pv.businessId) {
        logger.warn(`ProductVariant ${pv._id} has no businessId`, logContext);
        continue;
      }

      const businessIdStr = pv.businessId.toString();
      if (!businessData.has(businessIdStr)) {
        businessData.set(businessIdStr, {
          businessId: businessIdStr,
          products: [],
          totalPrice: 0,
          itemCount: 0,
        });
      }

      const business = businessData.get(businessIdStr);
      const orderItem = order.items.find(
        (item) => item.productVariant.toString() === pv._id.toString()
      );

      if (orderItem) {
        let bestInventoryForVariant = null;
        let bestPrice = Infinity;
        let totalStockForVariant = 0;

        for (const invSubdoc of pv.inventories) {
          const currentInventoryStock = invSubdoc.batches.reduce(
            (sum, batch) => sum + batch.quantity,
            0
          );
          if (currentInventoryStock >= orderItem.quantity) {
            const currentBestPrice = invSubdoc.batches.reduce(
              (min, batch) => Math.min(min, batch.sellingPrice),
              Infinity
            );
            if (currentBestPrice < bestPrice) {
              bestPrice = currentBestPrice;
              bestInventoryForVariant = invSubdoc;
            }
          }
          totalStockForVariant += currentInventoryStock;
        }

        if (bestInventoryForVariant && bestPrice !== Infinity) {
          const existingProduct = business.products.find(
            (p) => p.variant._id.toString() === pv._id.toString()
          );
          if (!existingProduct) {
            business.products.push({
              variant: pv,
              inventory: bestInventoryForVariant,
            });
            business.totalPrice += orderItem.quantity * bestPrice;
            business.itemCount++;
          }
        } else {
          logger.warn(
            `ProductVariant ${pv._id} has no suitable inventory for order quantity ${orderItem.quantity} (total stock ${totalStockForVariant})`,
            logContext
          );
        }
      }
    }
    logger.info(
      `Found ${businessData.size} unique businesses from inventories`,
      logContext
    );

    const businessIds = Array.from(businessData.keys());
    logger.info(
      `Fetching details for business IDs: ${businessIds.join(", ")}`,
      logContext
    );

    const businessDetailsPromises = businessIds.map(async (id) => {
      try {
        const response = await getBusinessById(id);
        if (response && response.business) {
          return response;
        }
        logger.warn(
          `getBusinessById returned no business for ID ${id}. Falling back to getBusinessByUserId.`,
          logContext
        );
      } catch (error) {
        logger.warn(
          `getBusinessById failed for ID ${id}. Falling back to getBusinessByUserId. Reason: ${error.message}`,
          logContext
        );
      }

      // Fallback call
      try {
        return await getBusinessByUserId(id);
      } catch (fallbackError) {
        logger.error(
          `Fallback getBusinessByUserId also failed for ID ${id}. Reason: ${fallbackError.message}`,
          logContext
        );
        // Re-throw to ensure Promise.allSettled sees it as 'rejected'
        throw fallbackError;
      }
    });

    const businessDetailsResponses = await Promise.allSettled(
      businessDetailsPromises
    );

    const validAlternatives = [];
    const failedLookups = [];

    businessDetailsResponses.forEach((response, index) => {
      const businessId = businessIds[index];
      if (
        response.status === "fulfilled" &&
        response.value &&
        response.value.business
      ) {
        const details = response.value.business;
        const business = businessData.get(businessId);

        if (business) {
          let distance = null;
          if (latitude && longitude && details.business_location) {
            try {
              const userLocation = {
                lat: parseFloat(latitude),
                lon: parseFloat(longitude),
              };
              distance = haversine(userLocation, details.business_location); // in meters
            } catch (e) {
              logger.warn(
                `Could not calculate distance for business ${details.id}`,
                logContext
              );
            }
          }

          validAlternatives.push({
            businessId: details.id,
            name: details.business_name,
            profilePicture: details.logo,
            noOfItemsAvailable: business.itemCount,
            totalPriceForAvailableItems: business.totalPrice,
            distance, // in meters
            availableProducts: business.products,
          });
        } else {
          failedLookups.push({
            businessId,
            reason: "Business data not found in map post-lookup",
          });
        }
      } else {
        const reason =
          response.status === "rejected"
            ? response.reason.message
            : "gRPC call succeeded but returned no business data";
        failedLookups.push({ businessId, reason });
      }
    });

    if (failedLookups.length > 0) {
      logger.warn(
        `Failed to look up ${failedLookups.length} businesses: ${JSON.stringify(failedLookups)}`,
        logContext
      );
    }
    logger.info(
      `Successfully found ${validAlternatives.length} valid alternatives.`,
      logContext
    );

    validAlternatives.sort((a, b) => {
      switch (filter) {
        case "cheapest":
          return a.totalPriceForAvailableItems - b.totalPriceForAvailableItems;
        case "nearest":
          return (a.distance || Infinity) - (b.distance || Infinity);
        case "suggested":
        default:
          if (b.noOfItemsAvailable !== a.noOfItemsAvailable) {
            return b.noOfItemsAvailable - a.noOfItemsAvailable;
          }
          return a.totalPriceForAvailableItems - b.totalPriceForAvailableItems;
      }
    });

    res.status(200).json(validAlternatives);
  } catch (error) {
    logger.error(
      `Error finding order alternatives for order ${req.params.orderId}: ${error.message}`,
      logContext,
      error
    );
    res
      .status(500)
      .json({
        message: "Error finding order alternatives",
        error: error.message,
      });
  }
};

export {
  createOrder,
  updateOrder,
  checkOrderStatus,
  findOrderAlternatives,
  getUserOrders,
};
