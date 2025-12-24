import express from 'express';
import {
  addItemToPackage,
  getPackageItems,
  removeItemFromPackage,
} from '../controllers/package.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Packages
 *   description: Package composition and bundled offerings
 */


/**
 * @swagger
 * /api/packages/items:
 *   post:
 *     summary: Add an offering to a package
 *     description: >
 *       Adds an existing offering as an item inside a package.
 *       Both the package and the included offering must already exist.
 *     tags: [Packages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageOfferingId
 *               - includedOfferingId
 *             properties:
 *               packageOfferingId:
 *                 type: string
 *                 description: Offering ID representing the package
 *                 example: 65f1a9b0a23d4e001234aaaa
 *               includedOfferingId:
 *                 type: string
 *                 description: Offering ID to be included in the package
 *                 example: 65f1a9b0a23d4e001234bbbb
 *     responses:
 *       201:
 *         description: Offering added to package successfully
 *       400:
 *         description: Invalid payload or item already exists in package
 *       404:
 *         description: Package or offering not found
 *       500:
 *         description: Server error
 */
router.post('/items', addItemToPackage);

/**
 * @swagger
 * /api/packages/{packageId}/items:
 *   get:
 *     summary: Get items of a package
 *     description: >
 *       Fetches all offerings included in a specific package.
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Package offering ID
 *     responses:
 *       200:
 *         description: Package items fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Package items fetched successfully
 *                 count:
 *                   type: number
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Package not found
 *       500:
 *         description: Server error
 */
router.get('/:packageId/items', getPackageItems);

/**
 * @swagger
 * /api/packages/items/{id}:
 *   delete:
 *     summary: Remove an offering from a package
 *     description: >
 *       Removes a specific item entry from a package.
 *       This does not delete the offering itself.
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package item ID
 *     responses:
 *       200:
 *         description: Offering removed from package successfully
 *       404:
 *         description: Package item not found
 *       500:
 *         description: Server error
 */
router.delete('/items/:id', removeItemFromPackage);

export default router;
