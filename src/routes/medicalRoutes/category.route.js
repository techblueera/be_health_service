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
    getCategoriesWithImageOptions,
    deleteImageOption
} from '../../controllers/medicalStore/category.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

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
 * /api/ms/categories:
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
 *               description:
 *                 type: string
 *               parentId:
 *                 type: string
 *                 description: ID of the parent category, if this is a sub-category
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               image:
 *                 type: string
 *                 format: binary
*                 description: Main category image.
 *               imageOptions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of optional images for the category.
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
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'imageOptions', maxCount: 10 }]), createCategory);

/**
 * @swagger
 * /api/ms/categories:
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
 * /api/ms/categories/with-inventory:
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
 * /api/ms/categories/nested:
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
 *       - in: query
 *         name: excludeImage
 *         schema:
 *           type: boolean
 *           default: false
 *         description: If true, the image field will be excluded from the returned categories.
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
 * /api/ms/categories/{id}:
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
 * /api/ms/categories/with-image-options:
 *   get:
 *     summary: Retrieve category data with image options for one or more categories.
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: categoryIds
 *         schema:
 *           type: string
 *         description: Comma-separated list of category IDs.
 *       - in: query
 *         name: categoryKeys
 *         schema:
 *           type: string
 *         description: Comma-separated list of category keys.
 *     responses:
 *       200:
 *         description: A list of categories with their image options.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       404:
 *         description: No categories found for the provided IDs or keys.
 *       500:
 *         description: Server error
 */
router.get('/with-image-options', getCategoriesWithImageOptions);

/**
 * @swagger
 * /api/ms/categories/{id}/children:
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
 * /api/ms/categories/key/{key}/children:
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
 * /api/ms/categories/{id}:
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
 *               level:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Main category image.
 *               imageOptions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of optional images for the category.
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
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'imageOptions', maxCount: 10 }]), updateCategory);

/**
 * @swagger
 * /api/ms/categories/{id}:
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

/**
 * @swagger
 * /api/ms/categories/{id}/image-options:
 *   delete:
 *     summary: Delete a specific image URL from a category's optional images.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: The URL of the image to be deleted from imageOptions.
 *             required:
 *               - imageUrl
 *     responses:
 *       200:
 *         description: Image option deleted successfully.
 *       400:
 *         description: Bad request (e.g., imageUrl missing).
 *       401:
 *         description: Not authorized.
 *       404:
 *         description: Category or image URL not found.
 *       500:
 *         description: Server error.
 */
router.delete('/:id/image-options', protect, deleteImageOption);

export default router;