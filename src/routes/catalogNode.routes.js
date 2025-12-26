import express from "express";
import multer from "multer";
import {
  createCatalogNode,
  getCatalogNodes,
  getCatalogNodeChildren,
  getCatalogTree,
  getCatalogNodeById,
  updateCatalogNode,
  deactivateCatalogNode,
} from "../controllers/catalogNode.controller.js";
import {
  createCatalogNodeSchema,
  getCatalogNodeChildrenSchema,
  getCatalogTreeSchema,
  updateCatalogNodeSchema,
} from "../validations/catalogNode.validataion.js";
import { validate } from "../middlewares/validate.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CatalogNodes
 *   description: Catalog node (category) management
 */

/**
 * @swagger
 * components:
 *   parameters:
 *   schemas:
 *     CatalogNode:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 694b241886be5fe849c588e2
 *         name:
 *           type: string
 *           example: General Medicine
 *         key:
 *           type: string
 *           example: GENERAL_MEDICINE
 *         type:
 *           type: string
 *           example: DEPARTMENT
 *         order:
 *           type: number
 *           example: 0
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CatalogNode'
 */

/**
 * @swagger
 * /api/catalog-nodes:
 *   post:
 *     summary: Create a new catalog node
 *     description: >
 *       Creates a catalog node (category or sub-category).
 *       Supports optional image upload.
 *       Parent-child hierarchy is restricted within the same module.
 *     tags: [CatalogNodes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - key
 *               - moduleId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Diagnostics
 *               key:
 *                 type: string
 *                 example: DIAGNOSTICS
 *               type:
 *                 type: string
 *                 example: SERVICE_GROUP
 *               description:
 *                 type: string
 *                 example: Diagnostic and lab services
 *               moduleId:
 *                 type: string
 *                 example: 694c8b5df37f5a8dbfd534d0
 *               parentId:
 *                 type: string
 *                 nullable: true
 *                 example: 65f1a9b0a23d4e0012345678
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Catalog node created successfully
 *       400:
 *         description: Validation error or parent-module mismatch
 *       404:
 *         description: Parent catalog node not found
 *       409:
 *         description: Duplicate catalog node key within module
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  upload.single("image"),
  validate(createCatalogNodeSchema),
  createCatalogNode
);

/**
 * @swagger
 * /api/catalog-nodes:
 *   get:
 *     summary: Get all catalog nodes
 *     description: Fetches all catalog nodes in the system.
 *     tags: [CatalogNodes]
 *     responses:
 *       200:
 *         description: Catalog nodes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Catalog nodes fetched successfully
 *                 count:
 *                   type: number
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
router.get("/", getCatalogNodes);

/**
 * @swagger
 * /api/catalog-nodes/{id}/children:
 *   get:
 *     summary: Get child catalog nodes
 *     description: >
 *       Fetches direct child nodes of a given catalog node.
 *     tags: [CatalogNodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent catalog node ID
 *     responses:
 *       200:
 *         description: Child catalog nodes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Child nodes fetched successfully
 *                 count:
 *                   type: number
 *                   example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid catalog node ID
 *       404:
 *         description: No child nodes found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id/children",
  validate(getCatalogNodeChildrenSchema),
  getCatalogNodeChildren
);

/**
 * @swagger
 * /api/catalog-nodes/tree:
 *   get:
 *     summary: Get catalog tree for a module
 *     description: >
 *       Returns the nested catalog hierarchy (categories and subcategories)
 *       for a given module. This API is used for navigation and category
 *       selection.
 *     tags: [CatalogNodes]
 *     parameters:
 *       - in: query
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *           example: 694b80799a5aeba18fb87226
 *         description: Module ObjectId (e.g. 694d2a4ce5a14ce0aaaa40d9)
 *     responses:
 *       200:
 *         description: Catalog tree fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Catalog tree fetched successfully
 *                 count:
 *                   type: number
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                         example: General Medicine
 *                       type:
 *                         type: string
 *                         example: DEPARTMENT
 *                       level:
 *                         type: number
 *                         example: 1
 *                       children:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/CatalogNode'
 *       500:
 *         description: Server error
 */
router.get("/tree", validate(getCatalogTreeSchema), getCatalogTree);
/**
 * @swagger
 * /api/catalog-nodes/{id}:
 *   get:
 *     tags: [CatalogNodes]
 *     summary: Get catalog node by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catalog node fetched successfully
 *       404:
 *         description: Catalog node not found
 *       500:
 *         description: Server error
 *
 *   patch:
 *     tags: [CatalogNodes]
 *     summary: Update catalog node
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Catalog node updated successfully
 *       404:
 *         description: Catalog node not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getCatalogNodeById);
router.patch("/:id", validate(updateCatalogNodeSchema), updateCatalogNode);

/**
 * @swagger
 * /api/catalog-nodes/{id}/deactivate:
 *   patch:
 *     tags: [CatalogNodes]
 *     summary: Deactivate catalog node
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catalog node deactivated successfully
 *       404:
 *         description: Catalog node not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/deactivate", deactivateCatalogNode);

export default router;
