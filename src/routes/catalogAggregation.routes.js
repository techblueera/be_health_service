import express from 'express';
import {
  getCatalogForLocation,
  getOfferingsForNode,
  searchCatalog,
} from '../controllers/catalogAggregation.controller.js';
import { attachLocation } from '../middlewares/location.middleware.js';

const router = express.Router();

router.use(attachLocation);

/**
 * @swagger
 * tags:
 *   name: Catalog
 *   description: Catalog aggregation and search APIs
 */

/**
 * @swagger
 * components:
 *   parameters:
 *     PincodeHeader:
 *       in: header
 *       name: x-pincode
 *       required: true
 *       schema:
 *         type: string
 *         example: "560001"
 *       description: User serviceable pincode resolved by location middleware
 */
/**
 * @swagger
 * /api/catalog:
 *   get:
 *     summary: Get catalog for user location
 *     description: >
 *       Returns catalog nodes filtered by module and user’s serviceable location.
 *       Location is resolved via x-pincode header.
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *           example: 694b1feb5f56aadbd1e85764
 *         description: Module ObjectId
 *       - $ref: '#/components/parameters/PincodeHeader'
 *     responses:
 *       200:
 *         description: Catalog fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing or invalid moduleId / pincode
 *       500:
 *         description: Server error
 */
router.get('/', getCatalogForLocation);


/**
 * @swagger
 * /api/catalog/search:
 *   get:
 *     summary: Search catalog offerings
 *     description: >
 *       Searches across catalog nodes and offerings
 *       based on query text and filters results by location.
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *       - $ref: '#/components/parameters/PincodeHeader'

 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Search results fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Search results fetched successfully
 *                 count:
 *                   type: number
 *                   example: 8
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing or invalid search query
 *       500:
 *         description: Server error
 */
router.get('/search', searchCatalog);

/**
 * @swagger
 * /api/catalog/{nodeId}/offerings:
 *   get:
 *     summary: Get offerings for a specific catalog node
 *     description: >
 *       Fetches offerings mapped to a specific catalog node,
 *       filtered by the user's serviceable location.
 *     tags: [Catalog]
 *     parameters:
 *       - in: path
 *         name: nodeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Catalog node ID
 *       - $ref: '#/components/parameters/PincodeHeader'
 *     responses:
 *       200:
 *         description: Offerings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Offerings fetched successfully
 *                 count:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid catalog node ID
 *       404:
 *         description: No offerings found for this node
 *       500:
 *         description: Server error
 */
router.get('/:nodeId/offerings', getOfferingsForNode);

export default router;
