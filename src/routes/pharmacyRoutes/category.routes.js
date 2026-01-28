import express from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../controllers/pharmacyControllers/category.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/ms/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories fetched successfully
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
 *                   example: Categories fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: OTC Items
 *                           icon:
 *                             type: string
 *                             example: icon-url
 *       500:
 *         description: Server error
 */
router.get("/", protect, getCategories);

/**
 * @swagger
 * /api/ms/categories:
 *   post:
 *     summary: Create new category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: OTC Items
 *               icon:
 *                 type: string
 *                 example: https://cdn.app/icon.png
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                   example: Category created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: object
 *       500:
 *         description: Server error
 */
router.post("/", protect, createCategory);

/**
 * @swagger
 * /api/ms/categories/{categoryId}:
 *   put:
 *     summary: Update category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Herbal/Ayurved
 *               icon:
 *                 type: string
 *                 example: https://cdn.app/icon.png
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put("/:categoryId", protect, updateCategory);

/**
 * @swagger
 * /api/ms/categories/{categoryId}:
 *   delete:
 *     summary: Delete category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete("/:categoryId", protect, deleteCategory);

export default router;