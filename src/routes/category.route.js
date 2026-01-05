import express from 'express';
import multer from 'multer';
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getNestedCategories,
    getChildrenByCategoryId,
    getChildrenByCategoryKey,
    searchCategories,
    getBusinessCategoriesWithInventory,
    updateCatalogNodeStatus
} from '../controllers/catalog.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Multer setup for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               key:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               moduleId: 
 *                 type: string
 *                 description: ID of the module this category belongs to   
 *               parentId:
 *                 type: string
 *                 description: ID of the parent category, if this is a sub-category
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request, e.g., image moderation failed
 *       409:
 *         description: Conflict, category with name or key already exists
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('image'), createCategory);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve a list of all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Server error
 */
router.get('/', getCategories);

/**
 * @swagger
 * /api/categories/with-inventory:
 *   get:
 *     summary: Retrieve parent categories for which the business has inventory
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of unique, top-level parent categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         description: Not authorized, token failed or not provided.
 *       500:
 *         description: Server error
 */
router.get('/with-inventory', protect, getBusinessCategoriesWithInventory);

/**
 * @swagger
 * /api/categories/nested:
 *   get:
 *     summary: Retrieve categories in a nested (tree) format.
 *     description: Fetches all categories and structures them as a tree. Can start from the root or a specific category if a parameter is provided.
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Optional. The ID of the category to use as the root of the tree.
 *       - in: query
 *         name: categoryKey
 *         schema:
 *           type: string
 *         description: Optional. The key of the category to use as the root of the tree.
 *     responses:
 *       200:
 *         description: A single category with its children nested, or an array of root categories if no parameter is provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       404:
 *         description: The specified categoryId or categoryKey was not found.
 *       500:
 *         description: Server error
 */
router.get('/nested', getNestedCategories);

/**
 * @swagger
 * /api/categories/search:
 *   get:
 *     summary: Search for categories by name or key
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: Case-insensitive key to search for.
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Case-insensitive name to search for.
 *     responses:
 *       200:
 *         description: A list of matching categories.
 *       400:
 *         description: Bad Request - No query parameter provided.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/search', searchCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Retrieve a single category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: A single category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getCategoryById);

/**
 * @swagger
 * /api/categories/{id}/children:
 *   get:
 *     summary: Retrieve all direct child categories for a given category ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The parent category ID
 *     responses:
 *       200:
 *         description: A list of child categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       404:
 *         description: Parent category not found
 *       500:
 *         description: Server error
 */
router.get('/:id/children', getChildrenByCategoryId);

/**
 * @swagger
 * /api/categories/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a catalog node
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Catalog node ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Catalog node status updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Catalog node not found
 *       500:
 *         description: Server error
 */

router.patch(
  "/:id/status",
  protect,
  updateCatalogNodeStatus
);

/**
 * @swagger
 * /api/categories/key/{key}/children:
 *   get:
 *     summary: Retrieve all direct child categories for a given category key
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique key of the parent category
 *     responses:
 *       200:
 *         description: A list of child categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       404:
 *         description: Parent category not found with provided key
 *       500:
 *         description: Server error
 */
router.get('/key/:key/children', getChildrenByCategoryKey);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               key:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: string
 *               type:
 *                type: string
 *               level:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Bad request, e.g., image moderation failed
 *       404:
 *         description: Category not found
 *       409:
 *         description: Conflict, category with name or key already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', upload.single('image'), updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Bad request, e.g., category has sub-categories
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteCategory);

export default router;