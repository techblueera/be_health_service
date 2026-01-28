import express from "express";
import {
  getProductVariants,
  getProductVariant,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "../../controllers/pharmacyControllers/productVariant.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductVariant'
 *       500:
 *         description: Server error
 */

router.get("/product/:productId", protect, getProductVariants);

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
 *               - inventories
 *             properties:
 *               productId:
 *                 type: string
 *               weight:
 *                 type: number
 *                 example: 600
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     altText:
 *                       type: string
 *               inventories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pincode:
 *                       type: string
 *                     cityName:
 *                       type: string
 *                     batches:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           batchNumber:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           mfgDate:
 *                             type: string
 *                             format: date-time
 *                           expiryDate:
 *                             type: string
 *                             format: date-time
 *                           mrp:
 *                             type: number
 *                           sellingPrice:
 *                             type: number
 *                     supplierInfo:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         contact:
 *                           type: string
 *                     location:
 *                       type: object
 *                       properties:
 *                         aisle:
 *                           type: string
 *                         shelf:
 *                           type: string
 *                     reorderPoint:
 *                       type: number
 *           example:
 *             productId: "656a8163f9a7d3b00c5c4e6f"
 *             weight: 750
 *             images:
 *               - url: "https://example.com/image1.jpg"
 *                 altText: "Product Variant Image 1"
 *             inventories:
 *               - pincode: "560001"
 *                 cityName: "Bangalore"
 *                 batches:
 *                   - batchNumber: "BATCH001"
 *                     quantity: 100
 *                     mfgDate: "2026-01-25T00:00:00.000Z"
 *                     expiryDate: "2026-01-25T00:00:00.000Z"
 *                     mrp: 249
 *                     sellingPrice: 199
 *                 supplierInfo:
 *                   name: "Supplier A"
 *                   contact: "123-456-7890"
 *                 location:
 *                   aisle: "A1"
 *                   shelf: "S2"
 *                 reorderPoint: 10
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *                 example: 750
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     altText:
 *                       type: string
 *               inventories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pincode:
 *                       type: string
 *                     cityName:
 *                       type: string
 *                     batches:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           batchNumber:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           mfgDate:
 *                             type: string
 *                             format: date-time
 *                           expiryDate:
 *                             type: string
 *                             format: date-time
 *                           mrp:
 *                             type: number
 *                           sellingPrice:
 *                             type: number
 *                     supplierInfo:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         contact:
 *                           type: string
 *                     location:
 *                       type: object
 *                       properties:
 *                         aisle:
 *                           type: string
 *                         shelf:
 *                           type: string
 *                     reorderPoint:
 *                       type: number
 *           example:
 *             weight: 750
 *             images:
 *               - url: "https://example.com/image1.jpg"
 *                 altText: "Product Variant Image 1"
 *             inventories:
 *               - pincode: "560001"
 *                 cityName: "Bangalore"
 *                 batches:
 *                   - batchNumber: "BATCH002"
 *                     quantity: 50
 *                     mfgDate: "2026-01-25T00:00:00.000Z"
 *                     expiryDate: "2026-01-25T00:00:00.000Z"
 *                     mrp: 250
 *                     sellingPrice: 200
 *                 supplierInfo:
 *                   name: "Supplier A"
 *                   contact: "123-456-7890"
 *                 location:
 *                   aisle: "A1"
 *                   shelf: "S2"
 *                 reorderPoint: 10
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
