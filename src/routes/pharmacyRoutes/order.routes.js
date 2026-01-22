import express from 'express';
import { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrder, 
  updateOrderStatus, 
  deleteOrder 
} from '../../controllers/pharmacyControllers/order.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/ms/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, complete, cancelled, payment]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Orders fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           businessId:
 *                             type: string
 *                           orderId:
 *                             type: string
 *                             example: 12345852
 *                           customerName:
 *                             type: string
 *                             example: Ramesh Kumar
 *                           totalItems:
 *                             type: number
 *                             example: 10
 *                           totalAmount:
 *                             type: number
 *                             example: 960
 *                           status:
 *                             type: string
 *                             example: pending
 *                           itemsMissing:
 *                             type: number
 *                             example: 1
 *       500:
 *         description: Server error
 */
router.get("/", protect, getOrders);

/**
 * @swagger
 * /api/ms/orders/{orderId}:
 *   get:
 *     summary: Get single order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get("/:orderId", protect, getOrder);

/**
 * @swagger
 * /api/ms/orders:
 *   post:
 *     summary: Create new order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - customerName
 *               - totalItems
 *               - totalAmount
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: 12345852
 *               customerName:
 *                 type: string
 *                 example: Ramesh Kumar
 *               totalItems:
 *                 type: number
 *                 example: 10
 *               totalAmount:
 *                 type: number
 *                 example: 960
 *               status:
 *                 type: string
 *                 enum: [pending, complete, cancelled, payment]
 *                 example: pending
 *               itemsMissing:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Order created successfully
 *       500:
 *         description: Server error
 */
router.post("/", protect, createOrder);

/**
 * @swagger
 * /api/ms/orders/{orderId}:
 *   put:
 *     summary: Update order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               totalItems:
 *                 type: number
 *               totalAmount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [pending, complete, cancelled, payment]
 *               itemsMissing:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put("/:orderId", protect, updateOrder);

/**
 * @swagger
 * /api/ms/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, complete, cancelled, payment]
 *                 example: complete
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.patch("/:orderId/status", protect, updateOrderStatus);

/**
 * @swagger
 * /api/ms/orders/{orderId}:
 *   delete:
 *     summary: Delete order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.delete("/:orderId", protect, deleteOrder);

export default router;