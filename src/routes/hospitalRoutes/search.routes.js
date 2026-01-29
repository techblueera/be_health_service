// routes/publicSearchRoutes.js
import express from 'express';
import { searchAcrossModels } from '../../controllers/hospitalControllers/search.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/hp/search:
 *   get:
 *     summary: Public search across all hospitals
 *     description: Search doctors, departments, facilities across hospitals by location, fees, etc.
 *     tags: [Public Search]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword
 *         example: cardiologist
 *       - in: query
 *         name: pincode
 *         schema:
 *           type: string
 *         description: Search by pincode
 *         example: 110001
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Search by city
 *         example: Delhi
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Search by state
 *         example: Delhi
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: string
 *         description: Search within specific hospital
 *       - in: query
 *         name: price
 *         schema:
 *           type: string
 *         description: Fee range (e.g., 500-2000)
 *         example: 500-2000
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Doctor specialization
 *         example: Cardiology
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Department type (OPD, IPD, Emergency)
 *         example: OPD
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter active items only
 *         example: true
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
 *         description: Search results with hospital information
 */
router.get('/', searchAcrossModels); // NO protect middleware

export default router;