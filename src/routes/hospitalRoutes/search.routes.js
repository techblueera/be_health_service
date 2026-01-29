// routes/publicSearchRoutes.js
import express from 'express';
import { searchAcrossModels } from '../../controllers/hospitalControllers/search.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/hp/search:
 *   get:
 *     summary: Universal public search for hospitals by location
 *     description: Publicly search for doctors, departments, and other hospital data based on a pincode and an optional radius.
 *     tags: [Hospital Search]
 *     parameters:
 *       - in: query
 *         name: pincode
 *         required: true
 *         schema:
 *           type: string
 *         description: The Indian pincode to search around.
 *         example: 110001
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: The search radius in kilometers.
 *         example: 5
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: A general keyword to search within the results (e.g., 'fever', 'cardiologist').
 *         example: cardiologist
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: string
 *         description: Search within a specific hospital by its ID (overrides pincode search).
 *       - in: query
 *         name: price
 *         schema:
 *           type: string
 *         description: Fee range for services or consultations (e.g., '500-2000').
 *         example: 500-2000
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter doctors by specialization.
 *         example: Cardiology
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results from nearby hospitals, enriched with hospital information.
 *       400:
 *         description: Bad request, a pincode or businessId is required.
 *       404:
 *         description: No data found for the provided pincode or location.
 */
router.get('/', searchAcrossModels); // NO protect middleware

export default router;