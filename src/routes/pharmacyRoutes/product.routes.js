import express from 'express';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../controllers/pharmacyControllers/product.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/ms/products:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: Products fetched successfully
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
 *                   example: Products fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           businessId:
 *                             type: string
 *                           categoryId:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: Pharma Franchise For OTC Product
 *                           description:
 *                             type: string
 *                           image:
 *                             type: string
 *                           basePrice:
 *                             type: number
 *                             example: 98000
 *                           sellingPrice:
 *                             type: number
 *                             example: 61499
 *                           discountPercent:
 *                             type: number
 *                             example: 50
 *       500:
 *         description: Server error
 */
router.get("/", protect, getProducts);

/**
 * @swagger
 * /api/ms/products/{productId}:
 *   get:
 *     summary: Get single product
 *     tags: [Product]
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
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/:productId", protect, getProduct);

/**
 * @swagger
 * /api/ms/products:
 *   post:
 *     summary: Create new product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - name
 *               - sellingPrice
 *             properties:
 *               categoryId:
 *                 type: string
 *                 example: 60d5f484f8d2e24b8c8e4f1a
 *               name:
 *                 type: string
 *                 example: Pharma Franchise For OTC Product
 *               description:
 *                 type: string
 *                 example: A popular and healthy South Indian breakfast
 *               image:
 *                 type: string
 *                 example: https://cdn.app/product.png
 *               basePrice:
 *                 type: number
 *                 example: 98000
 *               sellingPrice:
 *                 type: number
 *                 example: 61499
 *               discountPercent:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: Product created successfully
 *       500:
 *         description: Server error
 */
router.post("/", protect, createProduct);

/**
 * @swagger
 * /api/ms/products/{productId}:
 *   put:
 *     summary: Update product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               sellingPrice:
 *                 type: number
 *               discountPercent:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put("/:productId", protect, updateProduct);

/**
 * @swagger
 * /api/ms/products/{productId}:
 *   delete:
 *     summary: Delete product
 *     tags: [Product]
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
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete("/:productId", protect, deleteProduct);

export default router;