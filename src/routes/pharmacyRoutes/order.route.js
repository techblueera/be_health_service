// import express from 'express';
// import { createOrder, updateOrder, checkOrderStatus, findOrderAlternatives, getUserOrders } from '../../controllers/pharmacyControllers/order.controller.js';
// import { protect, authorizeRoles } from '../../middlewares/auth.middleware.js';

// const router = express.Router();

// /**
//  * @swagger
//  * tags:
//  *   name: Orders
//  *   description: Order management
//  */

// /**
//  * @swagger
//  * /api/ms/orders/{orderId}/alternatives:
//  *   get:
//  *     summary: "[Customer] Find alternative stores for an order"
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: orderId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The ID of the order to find alternatives for.
//  *       - in: query
//  *         name: filter
//  *         schema:
//  *           type: string
//  *           enum: [suggested, cheapest, nearest]
//  *           default: suggested
//  *         description: The sorting filter for the results.
//  *       - in: query
//  *         name: latitude
//  *         schema:
//  *           type: number
//  *         description: "User's latitude (required for 'nearest' filter)."
//  *       - in: query
//  *         name: longitude
//  *         schema:
//  *           type: number
//  *         description: "User's longitude (required for 'nearest' filter)."
//  *     responses:
//  *       200:
//  *         description: A list of alternative businesses, sorted by the specified filter.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   businessId:
//  *                     type: string
//  *                   name:
//  *                     type: string
//  *                   profilePicture:
//  *                     type: string
//  *                   noOfItemsAvailable:
//  *                     type: integer
//  *                   totalPriceForAvailableItems:
//  *                     type: number
//  *                   distance:
//  *                     type: number
//  *                     description: "Distance in meters (null if location not provided)."
//  *                   availableProducts:
//  *                     type: array
//  *                     items:
//  *                       type: object
//  *                       properties:
//  *                         variant:
//  *                           $ref: '#/components/schemas/ProductVariant'
//  *                         inventory:
//  *                           type: object
//  *                           description: "The specific inventory sub-document from the ProductVariant."
//  *       400:
//  *         description: Bad Request - Invalid order ID or missing location for 'nearest' filter.
//  *       401:
//  *         description: Not authorized.
//  *       404:
//  *         description: Order not found.
//  *       500:
//  *         description: Internal Server Error.
//  */
// router.get(
//     '/:orderId/alternatives',
//     protect,
//     findOrderAlternatives
// );

// /**
//  * @swagger
//  * /api/ms/orders:
//  *   post:
//  *     summary: "[Customer] Create a new order"
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - items
//  *               - deliveryType
//  *             properties:
//  *               items:
//  *                 type: array
//  *                 description: "List of items to order. The backend will verify prices and stock."
//  *                 items:
//  *                   type: object
//  *                   required:
//  *                     - inventory
//  *                     - quantity
//  *                   properties:
//  *                     inventory:
//  *                       type: string
//  *                       format: object-id
//  *                       description: "The ID of the specific embedded inventory sub-document within a ProductVariant."
//  *                       example: "656a8163f9a7d3b00c5c4e71"
//  *                     quantity:
//  *                       type: number
//  *                       example: 2
//  *               deliveryType:
//  *                 type: string
//  *                 enum: [self-pickup, rider]
//  *                 example: "self-pickup"
//  *               discount:
//  *                 type: number
//  *                 description: "Optional discount amount to be applied to the grand total."
//  *                 example: 10
//  *           example:
//  *             items:
//  *               - inventory: "656a8163f9a7d3b00c5c4e71"
//  *                 quantity: 2
//  *               - inventory: "656a8163f9a7d3b00c5c4e72"
//  *                 quantity: 1
//  *             deliveryType: "rider"
//  *             discount: 5
//  *     responses:
//  *       201:
//  *         description: Order created successfully.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Order'
//  *       400:
//  *         description: Bad Request - Invalid input data (e.g., no items, invalid IDs).
//  *       401:
//  *         description: Not authorized.
//  *       404:
//  *         description: Inventory or ProductVariant not found for one of the items.
//  *       500:
//  *         description: Internal Server Error (e.g., transaction failure, stock mismatch).
//  */
// router.post(
//     '/',
//     protect,
//     createOrder
// );

// /**
//  * @swagger
//  * /api/ms/orders/{id}:
//  *   put:
//  *     summary: "[Customer/Business] Update an existing order"
//  *     description: "Update order status or assign a rider. Customers can only cancel orders that are still in 'placed' status. Other status updates are typically for business roles."
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The ID of the order to update.
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               orderStatus:
//  *                 type: string
//  *                 enum: [placed, in-progress, completed, cancelled]
//  *                 description: "The new status of the order."
//  *               rider:
//  *                 type: string
//  *                 description: "The ID of the rider assigned to the order."
//  *     responses:
//  *       200:
//  *         description: Order updated successfully.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Order'
//  *       400:
//  *         description: Bad Request - Invalid input or logic violation (e.g., cancelling an in-progress order).
//  *       401:
//  *         description: Not authorized.
//  *       403:
//  *         description: Forbidden - User does not have permission to update this order.
//  *       404:
//  *         description: Order not found.
//  *       500:
//  *         description: Internal Server Error.
//  */
// router.put(
//     '/:id',
//     protect,
//     updateOrder
// );

// /**
//  * @swagger
//  * /api/ms/orders/status/me:
//  *   get:
//  *     summary: "[Customer] Check for an ongoing order"
//  *     description: "Checks if the currently authenticated user has an active order (status 'placed' or 'in-progress'). Returns the most recent ongoing order if one exists."
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Returns the user's ongoing order status.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 hasOngoingOrder:
//  *                   type: boolean
//  *                 order:
//  *                   $ref: '#/components/schemas/Order'
//  *                 message:
//  *                   type: string
//  *       401:
//  *         description: Not authorized.
//  *       500:
//  *         description: Internal Server Error.
//  */
// router.get(
//     '/status/me',
//     protect,
//     checkOrderStatus
// );

// /**
//  * @swagger
//  * /api/ms/orders/me:
//  *   get:
//  *     summary: "[Customer] Get all orders for the authenticated user"
//  *     description: "Retrieves all orders for the currently authenticated user with optional filtering, pagination, and sorting."
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           minimum: 1
//  *           default: 1
//  *         description: Page number for pagination
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           minimum: 1
//  *           maximum: 100
//  *           default: 10
//  *         description: Number of orders per page
//  *       - in: query
//  *         name: orderStatus
//  *         schema:
//  *           type: string
//  *         description: "Filter by order status. Multiple statuses can be provided as comma-separated values (e.g., 'placed,in-progress')"
//  *       - in: query
//  *         name: startDate
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: "Filter orders created after this date (ISO format: YYYY-MM-DD)"
//  *       - in: query
//  *         name: endDate
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: "Filter orders created before this date (ISO format: YYYY-MM-DD)"
//  *       - in: query
//  *         name: sortBy
//  *         schema:
//  *           type: string
//  *           enum: [createdAt, updatedAt, grandTotal, orderStatus]
//  *           default: createdAt
//  *         description: Field to sort by
//  *       - in: query
//  *         name: sortOrder
//  *         schema:
//  *           type: string
//  *           enum: [asc, desc]
//  *           default: desc
//  *         description: Sort order (ascending or descending)
//  *     responses:
//  *       200:
//  *         description: Successfully retrieved user's orders
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     orders:
//  *                       type: array
//  *                       items:
//  *                         $ref: '#/components/schemas/PopulatedOrder'
//  *                     pagination:
//  *                       type: object
//  *                       properties:
//  *                         currentPage:
//  *                           type: integer
//  *                         totalPages:
//  *                           type: integer
//  *                         totalOrders:
//  *                           type: integer
//  *                         hasNextPage:
//  *                           type: boolean
//  *                         hasPrevPage:
//  *                           type: boolean
//  *                         nextPage:
//  *                           type: integer
//  *                           nullable: true
//  *                         prevPage:
//  *                           type: integer
//  *                           nullable: true
//  *                     filters:
//  *                       type: object
//  *                       properties:
//  *                         orderStatus:
//  *                           type: string
//  *                           nullable: true
//  *                         startDate:
//  *                           type: string
//  *                           nullable: true
//  *                         endDate:
//  *                           type: string
//  *                           nullable: true
//  *                         sortBy:
//  *                           type: string
//  *                         sortOrder:
//  *                           type: string
//  *                 message:
//  *                   type: string
//  *       401:
//  *         description: Not authorized.
//  *       500:
//  *         description: Internal Server Error.
//  */
// router.get(
//     '/me',
//     protect,
//     getUserOrders
// );

// export default router;
