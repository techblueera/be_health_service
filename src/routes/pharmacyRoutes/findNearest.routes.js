// routes/pharmacyRoutes/findNearest.routes.js
import express from 'express';
import { findNearestPharmacies } from '../../controllers/pharmacyControllers/findNearest.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: FindNearestPharmacy
 *   description: Find nearest pharmacies
 */

/**
 * @swagger
 * /api/ms/nearest:
 *   post:
 *     summary: Find nearest pharmacies
 *     tags: [FindNearestPharmacy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pincode:
 *                 type: string
 *               radius:
 *                 type: number
 *     responses:
 *       200:
 *         description: A list of nearest pharmacies
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/', findNearestPharmacies);

export default router;
