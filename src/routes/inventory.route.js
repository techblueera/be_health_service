import express from "express";
import {
  createBusinessInventory,
  getBusinessProducts,
  updateInventory,
  deleteInventory,
} from "../controllers/inventory.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management for businesses
 */

/**
 * @swagger
 * /api/inventory/my-products:
 *   get:
 *     summary: "[Business] Get a list of products in the business's inventory"
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Optional. Filter products by category ID.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page.
 *     responses:
 *       200:
 *         description: A paginated list of product variants grouped by main category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: The main category ID.
 *                           name:
 *                             type: string
 *                             description: The name of the main category.
 *                           image:
 *                              type: string
 *                              description: URL of the main category image.
 *                           lastUpdate:
 *                              type: string
 *                              format: date-time
 *                              description: The most recent update time for any inventory item in this category.
 *                           productVariantCount:
 *                             type: integer
 *                             description: Total number of product variants in this category for the business.
 *                           products:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   description: The product ID.
 *                                 name:
 *                                   type: string
 *                                 variants:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       _id:
 *                                         type: string
 *                                         description: The product variant ID.
 *                                       variantName:
 *                                         type: string
 *                                       inventory:
 *                                         type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of main categories.
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal Server Error.
 */
router.get(
  "/my-products",
  protect,
  authorizeRoles("BUSINESS"),
  getBusinessProducts
);

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: "[Business] Update an existing inventory record"
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the inventory record to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productVariant:
 *                 type: string
 *                 description: The ID of the ProductVariant.
 *               pincode:
 *                 type: string
 *               cityName:
 *                 type: string
 *               batches:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - batchNumber
 *                     - quantity
 *                     - expiryDate
 *                     - mrp
 *                     - sellingPrice
 *                   properties:
 *                     batchNumber:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     mfgDate:
 *                       type: string
 *                       format: date
 *                     expiryDate:
 *                       type: string
 *                       format: date
 *                     mrp:
 *                       type: number
 *                     sellingPrice:
 *                       type: number
 *               supplierInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   contact:
 *                     type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   aisle:
 *                     type: string
 *                   shelf:
 *                     type: string
 *               reorderPoint:
 *                 type: number
 *     responses:
 *       200:
 *         description: Inventory record updated successfully.
 *       400:
 *         description: Bad Request - Invalid input data.
 *       401:
 *         description: Not authorized.
 *       404:
 *         description: Inventory record or ProductVariant not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/:id", protect, authorizeRoles("BUSINESS"), updateInventory);

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: "[Business] Delete an inventory record"
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the inventory record to delete.
 *     responses:
 *       200:
 *         description: Inventory record deleted successfully.
 *       401:
 *         description: Not authorized.
 *       404:
 *         description: Inventory record not found.
 *       500:
 *         description: Internal Server Error.
 */
router.delete("/:id", protect, authorizeRoles("BUSINESS"), deleteInventory);

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: "[Business] Create inventory records for one or more product variants"
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - productVariant
 *                 - pincode
 *                 - cityName
 *                 - batches
 *               properties:
 *                 productVariant:
 *                   type: string
 *                   description: The ID of the ProductVariant.
 *                 pincode:
 *                   type: string
 *                 cityName:
 *                   type: string
 *                 batches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required:
 *                     - batchNumber
 *                     - quantity
 *                     - expiryDate
 *                     - mrp
 *                     - sellingPrice
 *                     properties:
 *                       batchNumber:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       mfgDate:
 *                         type: string
 *                         format: date
 *                       expiryDate:
 *                         type: string
 *                         format: date
 *                       mrp:
 *                         type: number
 *                       sellingPrice:
 *                         type: number
 *                 supplierInfo:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     contact:
 *                       type: string
 *                 location:
 *                   type: object
 *                   properties:
 *                     aisle:
 *                       type: string
 *                     shelf:
 *                       type: string
 *                 reorderPoint:
 *                   type: number
 *     responses:
 *       201:
 *         description: Inventory records created successfully. Returns a list of created inventory IDs.
 *       400:
 *         description: Bad Request - Invalid input data.
 *       401:
 *         description: Not authorized.
 *       404:
 *         description: ProductVariant not found for one of the items.
 *       409:
 *         description: Conflict - An inventory record for one of the product variants at the same pincode already exists for this business.
 *       500:
 *         description: Internal Server Error.
 */
router.post(
  "/",
  protect,
  authorizeRoles("BUSINESS"), // Assuming a 'BUSINESS' role
  createBusinessInventory
);

export default router;
