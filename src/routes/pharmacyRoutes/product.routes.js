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
 *     summary: Get all products with price info
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       image:
 *                         type: string
 *                       categoryId:
 *                         type: object
 *                       displayPrice:
 *                         type: number
 *                         example: 199
 *                       priceRange:
 *                         type: string
 *                         example: "₹199 - ₹249"
 *                       mrp:
 *                         type: number
 *                         example: 249
 *                       variantCount:
 *                         type: number
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
 *     responses:
 *       200:
 *         description: Product fetched successfully
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
 *                   type: object
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
 *     summary: Create product with mandatory variant
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
 *               - variant
 *             properties:
 *               categoryId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               variant:
 *                 type: object
 *                 required:
 *                   - weight
 *                   - inventories
 *                 properties:
 *                   weight:
 *                     type: number
 *                     example: 600
 *                   images:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         altText:
 *                           type: string
 *                   inventories:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - pincode
 *                         - cityName
 *                         - batches
 *                       properties:
 *                         pincode:
 *                           type: string
 *                           example: "560001"
 *                         cityName:
 *                           type: string
 *                           example: Bangalore
 *                         batches:
 *                           type: array
 *                           items:
 *                             type: object
 *                             required:
 *                               - mrp
 *                               - sellingPrice
 *                             properties:
 *                               batchNumber:
 *                                 type: string
 *                                 example: BATCH001
 *                               quantity:
 *                                 type: number
 *                                 example: 100
 *                               mfgDate:
 *                                 type: string
 *                                 format: date-time
 *                               expiryDate:
 *                                 type: string
 *                                 format: date-time
 *                               mrp:
 *                                 type: number
 *                                 example: 249
 *                               sellingPrice:
 *                                 type: number
 *                                 example: 199
 *                         supplierInfo:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Supplier A"
 *                             contact:
 *                               type: string
 *                               example: "123-456-7890"
 *                         location:
 *                           type: object
 *                           properties:
 *                             aisle:
 *                               type: string
 *                               example: "A1"
 *                             shelf:
 *                               type: string
 *                               example: "S2"
 *                         reorderPoint:
 *                           type: number
 *                           example: 10
 *           example:
 *             categoryId: "656a8163f9a7d3b00c5c4e6d"
 *             name: "New Product Example"
 *             description: "Description for new product"
 *             image: "https://example.com/product_image.jpg"
 *             variant:
 *               weight: 750
 *               images:
 *                 - url: "https://example.com/variant_image1.jpg"
 *                   altText: "Product Variant Image"
 *               inventories:
 *                 - pincode: "560001"
 *                   cityName: "Bangalore"
 *                   batches:
 *                     - batchNumber: "BATCH001"
 *                       quantity: 100
 *                       mfgDate: "2026-01-25T00:00:00.000Z"
 *                       expiryDate: "2026-01-25T00:00:00.000Z"
 *                       mrp: 249
 *                       sellingPrice: 199
 *                   supplierInfo:
 *                     name: "Supplier ABC"
 *                     contact: "9876543210"
 *                   location:
 *                     aisle: "A1"
 *                     shelf: "S1"
 *                   reorderPoint: 10
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
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