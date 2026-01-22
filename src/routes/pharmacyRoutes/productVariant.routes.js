import express from 'express';
import { 
  getProductVariants, 
  getProductVariant, 
  createProductVariant, 
  updateProductVariant, 
  deleteProductVariant 
} from '../../controllers/pharmacyControllers/productVariant.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/ms/product-variants/product/{productId}:
 *   get:
 *     summary: Get all variants of a product
 *     tags: [Product Variant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product variants fetched successfully
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
 *                   example: Product variants fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           businessId:
 *                             type: string
 *                           productId:
 *                             type: string
 *                           weight:
 *                             type: string
 *                             example: 600 gm
 *                           quantity:
 *                             type: string
 *                             example: 100GM
 *                           mrp:
 *                             type: number
 *                             example: 1999
 *                           sellingPrice:
 *                             type: number
 *                             example: 1500
 *       500:
 *         description: Server error
 */
router.get("/product/:productId", protect, getProductVariants);

/**
 * @swagger
 * /api/ms/product-variants/{variantId}:
 *   get:
 *     summary: Get single product variant
 *     tags: [Product Variant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Product variant fetched successfully
 *       404:
 *         description: Product variant not found
 *       500:
 *         description: Server error
 */
router.get("/:variantId", protect, getProductVariant);

/**
 * @swagger
 * /api/ms/product-variants:
 *   post:
 *     summary: Create new product variant
 *     tags: [Product Variant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - weight
 *               - mrp
 *               - sellingPrice
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               weight:
 *                 type: string
 *                 example: 600 gm
 *               quantity:
 *                 type: string
 *                 example: 100GM
 *               mrp:
 *                 type: number
 *                 example: 1999
 *               sellingPrice:
 *                 type: number
 *                 example: 1500
 *     responses:
 *       201:
 *         description: Product variant created successfully
 *       500:
 *         description: Server error
 */
router.post("/", protect, createProductVariant);

/**
 * @swagger
 * /api/ms/product-variants/{variantId}:
 *   put:
 *     summary: Update product variant
 *     tags: [Product Variant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: string
 *                 example: 800 gm
 *               quantity:
 *                 type: string
 *                 example: 200GM
 *               mrp:
 *                 type: number
 *                 example: 2499
 *               sellingPrice:
 *                 type: number
 *                 example: 1999
 *     responses:
 *       200:
 *         description: Product variant updated successfully
 *       404:
 *         description: Product variant not found
 *       500:
 *         description: Server error
 */
router.put("/:variantId", protect, updateProductVariant);

/**
 * @swagger
 * /api/ms/product-variants/{variantId}:
 *   delete:
 *     summary: Delete product variant
 *     tags: [Product Variant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Product variant deleted successfully
 *       404:
 *         description: Product variant not found
 *       500:
 *         description: Server error
 */
router.delete("/:variantId", protect, deleteProductVariant);

export default router;