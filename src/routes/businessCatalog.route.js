import express from "express";
import { bulkToggleCatalogNodesForBusiness } from "../controllers/businessCatalogNode.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { fetchCatalogForBusiness } from "../controllers/catalog.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/business-catalog/{businessId}/catalog-nodes/bulk-toggle:
 *   patch:
 *     summary: Enable or disable multiple catalog nodes for a specific business
 *     tags: [Business Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - catalogNodeIds
 *               - isEnabled
 *             properties:
 *               catalogNodeIds:
 *                 type: array
 *                 description: List of catalog node IDs to toggle
 *                 items:
 *                   type: string
 *                 example:
 *                   - "6959053fb3607dce383a673e"
 *                   - "69590541b3607dce383a676d"
 *               isEnabled:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Catalog nodes toggled successfully for business
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Business not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:businessId/catalog-nodes/bulk-toggle",
  protect,
  bulkToggleCatalogNodesForBusiness
);

/**
 * @swagger
 * /api/business-catalog/{businessId}/catalog:
 *   get:
 *     summary: Fetch catalog nodes enabled for a specific business
 *     description: >
 *       Returns catalog nodes that are:
 *       - System active
 *       - Visible to the business (GLOBAL or BUSINESS_ONLY)
 *       - Enabled for the business (business-level toggle applied)
 *     tags: [Business Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *       - in: query
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Optional module ID to filter catalog nodes
 *     responses:
 *       200:
 *         description: Catalog fetched successfully for business
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Catalog fetched successfully for business
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6650f30bc9b8f1a2c8a3b456"
 *                       name:
 *                         type: string
 *                         example: ICU
 *                       key:
 *                         type: string
 *                         example: ICU
 *                       type:
 *                         type: string
 *                         example: LEAF
 *                       level:
 *                         type: number
 *                         example: 2
 *                       parentId:
 *                         type: string
 *                         nullable: true
 *                       order:
 *                         type: number
 *                         example: 1
 *                       isEnabledForBusiness:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Invalid businessId or moduleId
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Business not found
 *       500:
 *         description: Internal server error
 */

router.get(
  "/:businessId/catalog",
  protect,
  fetchCatalogForBusiness
);


export default router;
